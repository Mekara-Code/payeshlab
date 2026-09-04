import "server-only";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const ACCESS_TOKEN_LIFETIME_SECONDS = 5 * 60;
const ACCESS_TOKEN_AUDIENCE = "payeshlab-patient-result";
const ACCESS_TOKEN_ISSUER = "payeshlab";
const MAX_RESULT_IDS_PER_ACCESS = 50;

type PatientResultAccessClaims = {
  resultIds: string[];
  scope: "patient-result-download";
};

function isResultId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);
}

function getCookieName() {
  return process.env.NODE_ENV === "production"
    ? "__Host-payeshlab_patient_result_access"
    : "payeshlab_patient_result_access";
}

function getAccessSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  return secret && Buffer.byteLength(secret) >= 32 ? secret : null;
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

export async function grantPatientResultDownloadAccess(resultIds: string[]) {
  const uniqueResultIds = [...new Set(resultIds)].filter(isResultId);
  if (
    uniqueResultIds.length === 0 ||
    uniqueResultIds.length !== resultIds.length ||
    uniqueResultIds.length > MAX_RESULT_IDS_PER_ACCESS
  ) {
    return false;
  }

  const secret = getAccessSecret();
  if (!secret) return false;

  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_LIFETIME_SECONDS * 1000);
  const token = jwt.sign(
    {
      resultIds: uniqueResultIds,
      scope: "patient-result-download",
    } satisfies PatientResultAccessClaims,
    secret,
    {
      algorithm: "HS512",
      audience: ACCESS_TOKEN_AUDIENCE,
      expiresIn: ACCESS_TOKEN_LIFETIME_SECONDS,
      issuer: ACCESS_TOKEN_ISSUER,
    },
  );

  const cookieStore = await cookies();
  cookieStore.set(getCookieName(), token, {
    ...getCookieOptions(),
    expires: expiresAt,
    maxAge: ACCESS_TOKEN_LIFETIME_SECONDS,
  });

  return true;
}

export async function getPatientResultDownloadAccess() {
  const secret = getAccessSecret();
  const token = (await cookies()).get(getCookieName())?.value;
  if (!secret || !token) return null;

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS512"],
      audience: ACCESS_TOKEN_AUDIENCE,
      issuer: ACCESS_TOKEN_ISSUER,
    });
    if (
      typeof payload === "string" ||
      payload.scope !== "patient-result-download" ||
      !Array.isArray(payload.resultIds) ||
      payload.resultIds.length === 0 ||
      payload.resultIds.length > MAX_RESULT_IDS_PER_ACCESS ||
      !payload.resultIds.every(isResultId)
    ) {
      return null;
    }

    return [...new Set(payload.resultIds)];
  } catch {
    return null;
  }
}
