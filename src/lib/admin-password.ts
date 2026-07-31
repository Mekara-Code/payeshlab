import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const DUMMY_SALT = "payeshlab-admin-auth-timing-salt";

type ParsedHash = {
  key: Buffer;
  salt: string;
};

function parsePasswordHash(value: string): ParsedHash | null {
  const [algorithm, salt, encodedKey, ...rest] = value.split("$");

  if (algorithm !== "scrypt" || !salt || !encodedKey || rest.length > 0) {
    return null;
  }

  const key = Buffer.from(encodedKey, "base64url");
  return key.length === KEY_LENGTH ? { key, salt } : null;
}

async function deriveKey(password: string, salt: string) {
  return (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
}

export function isStrongAdminPassword(password: string) {
  return (
    password.length >= 14 &&
    password.length <= 128 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export async function hashAdminPassword(password: string) {
  if (!isStrongAdminPassword(password)) {
    throw new Error("Administrator password does not meet the required strength.");
  }

  const salt = randomBytes(16).toString("base64url");
  const key = await deriveKey(password, salt);
  return `scrypt$${salt}$${key.toString("base64url")}`;
}

export async function verifyAdminPassword(password: string, passwordHash: string | null) {
  const parsed = passwordHash ? parsePasswordHash(passwordHash) : null;

  if (!parsed) {
    await deriveKey(password, DUMMY_SALT);
    return false;
  }

  const derivedKey = await deriveKey(password, parsed.salt);
  return timingSafeEqual(derivedKey, parsed.key);
}
