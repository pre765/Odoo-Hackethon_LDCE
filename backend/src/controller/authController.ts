import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Response } from "express";
import { createAuthToken, type AuthenticatedRequest } from "../middleware/authMiddleware.js";
import {
  createUser,
  createPasswordResetToken,
  deleteUser,
  findUserByEmail,
  findUserById,
  listSavedDestinations,
  removeSavedDestination,
  saveDestination,
  resetPasswordFromToken,
  updateUserProfile,
  withoutPassword,
} from "../models/userModel.js";

const scrypt = promisify(scryptCallback);

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

async function passwordMatches(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const stored = Buffer.from(hash, "hex");
  return stored.length === derived.length && timingSafeEqual(stored, derived);
}

function userResponse(user: ReturnType<typeof withoutPassword>) {
  return { user, token: createAuthToken(user.id) };
}

export async function signup(request: AuthenticatedRequest, response: Response) {
  const firstName = stringValue(request.body.firstName);
  const lastName = stringValue(request.body.lastName);
  const email = stringValue(request.body.email).toLowerCase();
  const password = stringValue(request.body.password);

  if (!firstName || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    return response.status(400).json({ error: "First name, a valid email, and an 8-character password are required." });
  }
  if (await findUserByEmail(email)) return response.status(409).json({ error: "An account with that email already exists." });

  const user = await createUser({ firstName, lastName: lastName || undefined, email, passwordHash: await hashPassword(password) });
  return response.status(201).json({ data: userResponse(withoutPassword(user)) });
}

export async function login(request: AuthenticatedRequest, response: Response) {
  const email = stringValue(request.body.email).toLowerCase();
  const password = stringValue(request.body.password);
  const user = email ? await findUserByEmail(email) : null;
  if (!user || !(await passwordMatches(password, user.passwordHash))) {
    return response.status(401).json({ error: "Incorrect email or password." });
  }
  return response.json({ data: userResponse(withoutPassword(user)) });
}

export async function getCurrentUser(request: AuthenticatedRequest, response: Response) {
  const user = request.userId ? await findUserById(request.userId) : null;
  if (!user) return response.status(404).json({ error: "User not found." });
  return response.json({ data: withoutPassword(user) });
}

export async function updateProfile(request: AuthenticatedRequest, response: Response) {
  const firstName = request.body.firstName === undefined ? undefined : stringValue(request.body.firstName);
  const preferences = request.body.preferences === undefined ? undefined : objectValue(request.body.preferences);
  if (firstName === "" || (request.body.preferences !== undefined && !preferences)) {
    return response.status(400).json({ error: "First name and preferences must be valid." });
  }
  const user = await updateUserProfile(request.userId!, {
    firstName,
    lastName: request.body.lastName === undefined ? undefined : stringValue(request.body.lastName) || null,
    phone: request.body.phone === undefined ? undefined : stringValue(request.body.phone) || null,
    city: request.body.city === undefined ? undefined : stringValue(request.body.city) || null,
    country: request.body.country === undefined ? undefined : stringValue(request.body.country) || null,
    photoUrl: request.body.photoUrl === undefined ? undefined : stringValue(request.body.photoUrl) || null,
    languagePref: request.body.languagePref === undefined ? undefined : stringValue(request.body.languagePref) || null,
    preferences,
  });
  if (!user) return response.status(404).json({ error: "User not found." });
  return response.json({ data: withoutPassword(user) });
}

export async function getSavedDestinations(request: AuthenticatedRequest, response: Response) {
  return response.json({ data: await listSavedDestinations(request.userId!) });
}

export async function addSavedDestination(request: AuthenticatedRequest, response: Response) {
  const cityId = Number(request.params.cityId);
  if (!Number.isInteger(cityId)) return response.status(400).json({ error: "A valid city id is required." });
  await saveDestination(request.userId!, cityId);
  return response.status(201).json({ data: { cityId } });
}

export async function deleteSavedDestination(request: AuthenticatedRequest, response: Response) {
  const cityId = Number(request.params.cityId);
  if (!Number.isInteger(cityId)) return response.status(400).json({ error: "A valid city id is required." });
  const deleted = await removeSavedDestination(request.userId!, cityId);
  return deleted ? response.status(204).send() : response.status(404).json({ error: "Saved destination not found." });
}

export async function forgotPassword(request: AuthenticatedRequest, response: Response) {
  const email = stringValue(request.body.email).toLowerCase();
  const user = email && /^\S+@\S+\.\S+$/.test(email) ? await findUserByEmail(email) : null;
  const data: { message: string; resetToken?: string } = {
    message: "If an account exists for that email, reset instructions have been prepared.",
  };

  if (user) {
    const token = randomBytes(32).toString("base64url");
    const minutes = Number(process.env.PASSWORD_RESET_TTL_MINUTES ?? 30);
    const expiresAt = new Date(Date.now() + (Number.isFinite(minutes) && minutes > 0 ? minutes : 30) * 60_000);
    await createPasswordResetToken(user.id, tokenHash(token), expiresAt);

    // A mail provider can deliver this token in production. It is exposed only for local development.
    if (process.env.NODE_ENV !== "production") data.resetToken = token;
  }

  return response.status(202).json({ data });
}

export async function resetPassword(request: AuthenticatedRequest, response: Response) {
  const token = stringValue(request.body.token);
  const password = stringValue(request.body.password);
  if (!token || password.length < 8) {
    return response.status(400).json({ error: "A reset token and an 8-character password are required." });
  }
  const user = await resetPasswordFromToken(tokenHash(token), await hashPassword(password));
  if (!user) return response.status(400).json({ error: "This reset token is invalid or has expired." });
  return response.json({ data: userResponse(withoutPassword(user)) });
}

export async function deleteAccount(request: AuthenticatedRequest, response: Response) {
  const deleted = await deleteUser(request.userId!);
  return deleted
    ? response.status(204).send()
    : response.status(404).json({ error: "User not found." });
}
