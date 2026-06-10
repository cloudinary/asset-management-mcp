/*
 * Security hardening for the SSE transport — addresses Bugcrowd 4b93e87b
 * (CWE-306: Missing Authentication for Critical Function).
 *
 * This module is intentionally HAND-WRITTEN (not Speakeasy-generated). It is wired
 * into the generated cli/start/{impl,command}.ts. Those generated edits must also be
 * ported into the Speakeasy template/customization layer so they survive regeneration.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "::1", "localhost", ""]);

/** A host is "loopback" if it is unset or one of the well-known local addresses. */
export function isLoopbackHost(host: string | undefined): boolean {
  return host == null || LOOPBACK_HOSTS.has(host);
}

/** Resolve the shared secret: CLI flag wins, otherwise the MCP_AUTH_TOKEN env var. */
export function resolveAuthToken(flagToken?: string): string | undefined {
  const token = flagToken ?? process.env.MCP_AUTH_TOKEN;
  return token && token.length > 0 ? token : undefined;
}

/**
 * Fail-safe: refuse to start an unauthenticated server on a non-loopback host.
 * Throwing here prevents the exact exposure reported in Bugcrowd 4b93e87b — a
 * network-reachable /sse that drives the operator's account with no credentials.
 */
export function assertSafeBinding(host: string, authToken: string | undefined): void {
  if (!isLoopbackHost(host) && !authToken) {
    throw new Error(
      `Refusing to start: binding the SSE transport to a non-loopback host ` +
        `(${host}) without an auth token would expose the operator's Cloudinary ` +
        `account to any caller on the network. Set --auth-token (or the ` +
        `MCP_AUTH_TOKEN env var), or bind to a loopback address (--host 127.0.0.1).`,
    );
  }
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/**
 * Constant-time comparison. Hashing both sides to a fixed length keeps
 * timingSafeEqual from throwing on length mismatch and avoids leaking the
 * secret's length through timing.
 */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

function presentedToken(req: Request): string | undefined {
  const headerToken = req.headers["x-mcp-token"];
  if (typeof headerToken === "string" && headerToken.length > 0) {
    return headerToken;
  }
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice("Bearer ".length);
  }
  return undefined;
}

/**
 * Express middleware enforcing the shared secret. No-op when no token is
 * configured (loopback-only deployments); otherwise every request must present a
 * matching token via `x-mcp-token` or `Authorization: Bearer <token>`.
 */
export function sseAuthMiddleware(authToken: string | undefined) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!authToken) {
      next();
      return;
    }
    const presented = presentedToken(req);
    if (presented == null || !safeEqual(presented, authToken)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  };
}
