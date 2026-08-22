import type { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

interface AuthTokenPayload extends jwt.JwtPayload {
  sub: string;
  type: "access";
}

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to a value with at least 32 characters.");
  }
  return secret;
}

export function createAuthToken(userId: number) {
  return jwt.sign(
    { type: "access" },
    jwtSecret(),
    {
      subject: String(userId),
      issuer: "globetrotter-api",
      audience: "globetrotter-web",
      expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"],
    },
  );
}

export function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const authorization = request.header("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : undefined;

  if (!token) {
    return response.status(401).json({ error: "Authentication is required." });
  }

  try {
    const payload = jwt.verify(token, jwtSecret(), {
      issuer: "globetrotter-api",
      audience: "globetrotter-web",
    }) as AuthTokenPayload;
    const userId = Number(payload.sub);

    if (payload.type !== "access" || !Number.isSafeInteger(userId) || userId < 1) {
      return response.status(401).json({ error: "Your session is invalid. Please sign in again." });
    }

    request.userId = userId;
    return next();
  } catch (error) {
    const message = error instanceof TokenExpiredError
      ? "Your session has expired. Please sign in again."
      : error instanceof JsonWebTokenError
        ? "Your session is invalid. Please sign in again."
        : "Authentication could not be verified.";
    return response.status(401).json({ error: message });
  }
}
