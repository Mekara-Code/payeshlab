import "server-only";

import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { AuthAuditEvent } from "@/generated/prisma/client";
import { verifyAdminPassword } from "@/lib/admin-password";
import { getPrisma } from "@/lib/prisma";

const SESSION_AUDIENCE = "payeshlab-admin";
const SESSION_ISSUER = "payeshlab";
const ACCESS_TOKEN_LIFETIME_SECONDS = 30 * 60;
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

type AdminJwtClaims = {
  role: "ADMIN";
  sid: string;
  ver: number;
};

export type AdminSession = {
  email: string;
  role: "ADMIN";
  userId: string;
};

type AuthenticatedAdmin = {
  email: string;
  id: string;
  role: "ADMIN";
  tokenVersion: number;
};

function getSessionCookieName() {
  return process.env.NODE_ENV === "production" ? "__Host-payeshlab_admin_access" : "payeshlab_admin_access";
}

function getSessionSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  return secret && Buffer.byteLength(secret) >= 32 ? secret : null;
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function getCookieOptions() {
  return {
    httpOnly: true,
    path: "/",
    priority: "high" as const,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

function isMatchingHash(first: string, second: string) {
  const firstHash = Buffer.from(first, "hex");
  const secondHash = Buffer.from(second, "hex");
  return firstHash.length === secondHash.length && timingSafeEqual(firstHash, secondHash);
}

function getVerifiedToken(token: string) {
  const secret = getSessionSecret();
  if (!secret) {
    return null;
  }

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS512"],
      audience: SESSION_AUDIENCE,
      issuer: SESSION_ISSUER,
    });

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      typeof payload.sid !== "string" ||
      payload.role !== "ADMIN" ||
      !Number.isSafeInteger(payload.ver)
    ) {
      return null;
    }

    return {
      claims: {
        role: payload.role,
        sid: payload.sid,
        ver: payload.ver,
      } satisfies AdminJwtClaims,
      userId: payload.sub,
    };
  } catch {
    return null;
  }
}

async function recordAuditEvent({
  email,
  event,
  userId,
}: {
  email: string;
  event: AuthAuditEvent;
  userId?: string;
}) {
  await getPrisma().adminAuthAudit.create({
    data: {
      emailHash: hashValue(normalizeEmail(email)),
      event,
      userId,
    },
  });
}

export async function authenticateAdmin(email: string, password: string): Promise<AuthenticatedAdmin | null> {
  const normalizedEmail = normalizeEmail(email);
  const prisma = getPrisma();
  const user = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
    select: {
      email: true,
      failedLoginCount: true,
      id: true,
      isActive: true,
      lockedUntil: true,
      passwordHash: true,
      role: true,
      tokenVersion: true,
    },
  });

  const passwordMatches = await verifyAdminPassword(password, user?.passwordHash ?? null);
  const now = new Date();
  const isLocked = Boolean(user?.lockedUntil && user.lockedUntil > now);
  const isPermitted = Boolean(user?.isActive && user.role === "ADMIN" && !isLocked && passwordMatches);

  if (!user || !isPermitted) {
    if (user && isLocked) {
      await recordAuditEvent({ email: normalizedEmail, event: "LOGIN_LOCKED", userId: user.id });
      return null;
    }

    if (user) {
      const failedLoginCount = user.failedLoginCount + 1;
      const lockedUntil = failedLoginCount >= MAX_FAILED_LOGIN_ATTEMPTS ? new Date(now.getTime() + LOCK_DURATION_MS) : null;

      await prisma.$transaction([
        prisma.adminUser.update({
          where: { id: user.id },
          data: {
            failedLoginCount,
            lockedUntil,
          },
        }),
        prisma.adminAuthAudit.create({
          data: {
            emailHash: hashValue(normalizedEmail),
            event: lockedUntil ? "LOGIN_LOCKED" : "LOGIN_FAILED",
            userId: user.id,
          },
        }),
      ]);
    } else {
      await recordAuditEvent({ email: normalizedEmail, event: "LOGIN_FAILED" });
    }

    return null;
  }

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lastLoginAt: now,
        lockedUntil: null,
      },
    }),
    prisma.adminAuthAudit.create({
      data: {
        emailHash: hashValue(normalizedEmail),
        event: "LOGIN_SUCCEEDED",
        userId: user.id,
      },
    }),
  ]);

  return {
    email: user.email,
    id: user.id,
    role: "ADMIN",
    tokenVersion: user.tokenVersion,
  };
}

export async function createAdminSession(user: AuthenticatedAdmin) {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET is not configured.");
  }

  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_LIFETIME_SECONDS * 1000);
  const token = jwt.sign(
    {
      role: user.role,
      sid: sessionId,
      ver: user.tokenVersion,
    } satisfies AdminJwtClaims,
    secret,
    {
      algorithm: "HS512",
      audience: SESSION_AUDIENCE,
      expiresIn: ACCESS_TOKEN_LIFETIME_SECONDS,
      issuer: SESSION_ISSUER,
      jwtid: randomUUID(),
      subject: user.id,
    },
  );

  await getPrisma().adminSession.create({
    data: {
      expiresAt,
      id: sessionId,
      tokenHash: hashValue(token),
      userId: user.id,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), token, {
    ...getCookieOptions(),
    expires: expiresAt,
    maxAge: ACCESS_TOKEN_LIFETIME_SECONDS,
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (!token) {
    return null;
  }

  const verifiedToken = getVerifiedToken(token);
  if (!verifiedToken) {
    return null;
  }

  const session = await getPrisma().adminSession.findFirst({
    where: {
      expiresAt: { gt: new Date() },
      id: verifiedToken.claims.sid,
      revokedAt: null,
      userId: verifiedToken.userId,
      user: {
        isActive: true,
        role: "ADMIN",
        tokenVersion: verifiedToken.claims.ver,
      },
    },
    select: {
      tokenHash: true,
      user: {
        select: {
          email: true,
          id: true,
          role: true,
        },
      },
    },
  });

  if (!session || !isMatchingHash(session.tokenHash, hashValue(token))) {
    return null;
  }

  return {
    email: session.user.email,
    role: session.user.role,
    userId: session.user.id,
  };
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;

  if (token) {
    const decoded = jwt.decode(token);
    if (decoded && typeof decoded !== "string" && typeof decoded.sid === "string") {
      const session = await getPrisma().adminSession.updateMany({
        where: {
          id: decoded.sid,
          revokedAt: null,
          tokenHash: hashValue(token),
        },
        data: { revokedAt: new Date() },
      });

      if (session.count > 0 && typeof decoded.sub === "string") {
        await recordAuditEvent({ email: "logout", event: "LOGOUT", userId: decoded.sub });
      }
    }
  }

  cookieStore.set(getSessionCookieName(), "", {
    ...getCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
}
