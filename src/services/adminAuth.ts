import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import type { AdminRole } from "@/models/AdminUser";

export const ADMIN_SESSION_COOKIE = "eastfield_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  authType: "bearer_key" | "session_cookie";
}

function getSigningSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || process.env.ADMIN_API_KEY?.trim();
  if (!secret || secret.length < 16) return null;
  return secret;
}

export function createAdminSessionToken(payload: {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}): string {
  const secret = getSigningSecret();
  if (!secret) {
    throw new Error("Admin session secret is not configured.");
  }

  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const body = Buffer.from(JSON.stringify({ ...payload, exp }), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyAdminSessionToken(token: string): AuthenticatedAdmin | null {
  const secret = getSigningSecret();
  if (!secret || !token) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;

  const expectedSig = createHmac("sha256", secret).update(body).digest("base64url");
  const sigBuf = Buffer.from(sig, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      id?: string;
      email?: string;
      name?: string;
      role?: AdminRole;
      exp?: number;
    };
    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    if (!decoded.id || !decoded.email || !decoded.role) {
      return null;
    }
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || decoded.email,
      role: decoded.role,
      authType: "session_cookie",
    };
  } catch {
    return null;
  }
}

function checkBearerApiKey(req: NextRequest): AuthenticatedAdmin | null {
  const configuredKey = process.env.ADMIN_API_KEY?.trim();
  if (!configuredKey || configuredKey.length < 16) return null;

  const authHeader = req.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) return null;

  const providedBuf = Buffer.from(match[1], "utf8");
  const expectedBuf = Buffer.from(configuredKey, "utf8");
  if (providedBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(providedBuf, expectedBuf)) return null;

  return {
    id: "api-key-admin",
    email: "admin@eastfieldindia.com",
    name: "EastField API Admin",
    role: "admin",
    authType: "bearer_key",
  };
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(getSigningSecret());
}

export function requireAdminAuth(
  req: NextRequest,
  allowedRoles: readonly AdminRole[] = ["admin", "manager", "viewer"]
):
  | { ok: true; admin: AuthenticatedAdmin }
  | { ok: false; status: 401 | 403 | 503; error: string } {
  if (!isAdminAuthConfigured()) {
    return { ok: false, status: 503, error: "Admin endpoint is not configured." };
  }

  const bearerAdmin = checkBearerApiKey(req);
  if (bearerAdmin) {
    if (!allowedRoles.includes(bearerAdmin.role)) {
      return { ok: false, status: 403, error: "Forbidden." };
    }
    return { ok: true, admin: bearerAdmin };
  }

  const cookieToken = req.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";
  const cookieAdmin = verifyAdminSessionToken(cookieToken);
  if (cookieAdmin) {
    if (!allowedRoles.includes(cookieAdmin.role)) {
      return { ok: false, status: 403, error: "Forbidden." };
    }
    return { ok: true, admin: cookieAdmin };
  }

  return { ok: false, status: 401, error: "Unauthorized." };
}
