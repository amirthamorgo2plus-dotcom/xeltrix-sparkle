import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE = "xs_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days — stays signed in

export type Session = {
  id: string;
  name: string;
  role: "cleaner" | "supervisor" | "owner";
  lang: "en" | "ta" | "hi";
  orgId: string;
  orgSlug: string;
};

function secret() {
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeSession(s: Session): string {
  const body = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeSession(token?: string | null): Session | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (sign(body) !== sig) return null;
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    // Pre-multi-org cookies lack orgId — force a clean re-login.
    if (!s.orgId) return null;
    return s;
  } catch {
    return null;
  }
}

export async function setSession(s: Session) {
  const jar = await cookies();
  jar.set(COOKIE, encodeSession(s), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return decodeSession(jar.get(COOKIE)?.value);
}

// ---------- Super-admin cookie (separate from staff sessions) ----------
const ADMIN_COOKIE = "xs_admin";
const adminToken = () => sign("super-admin");

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  const v = jar.get(ADMIN_COOKIE)?.value;
  return !!v && v === adminToken();
}
