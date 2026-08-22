import { query } from "../config/database.js";

export interface User {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  photoUrl: string | null;
  languagePref: string | null;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

interface UserRow {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  password_hash: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  photo_url: string | null;
  language_pref: string | null;
  preferences: Record<string, unknown> | string | null;
  created_at: Date;
  updated_at: Date;
}

const fields = `id, first_name, last_name, email, password_hash, phone, city, country, photo_url, language_pref, preferences, created_at, updated_at`;

function preferencesFrom(value: UserRow["preferences"]) {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function dateToIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toUser(row: UserRow): UserWithPassword {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    passwordHash: row.password_hash,
    phone: row.phone,
    city: row.city,
    country: row.country,
    photoUrl: row.photo_url,
    languagePref: row.language_pref,
    preferences: preferencesFrom(row.preferences),
    createdAt: dateToIso(row.created_at),
    updatedAt: dateToIso(row.updated_at),
  };
}

export function withoutPassword(user: UserWithPassword): User {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function findUserByEmail(email: string) {
  const result = await query<UserRow>(`SELECT ${fields} FROM users WHERE LOWER(email) = LOWER($1)`, [email]);
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function findUserById(id: number) {
  const result = await query<UserRow>(`SELECT ${fields} FROM users WHERE id = $1`, [id]);
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function createUser(input: { firstName: string; lastName?: string; email: string; passwordHash: string }) {
  const result = await query<UserRow>(
    `INSERT INTO users (first_name, last_name, email, password_hash)
     VALUES ($1, $2, LOWER($3), $4)
     RETURNING ${fields}`,
    [input.firstName, input.lastName || null, input.email, input.passwordHash],
  );
  return toUser(result.rows[0]);
}

export async function updateUserProfile(
  id: number,
  input: Partial<Pick<User, "firstName" | "lastName" | "phone" | "city" | "country" | "photoUrl" | "languagePref" | "preferences">>,
) {
  const candidates: Array<[string, unknown | undefined]> = [
    ["first_name", input.firstName],
    ["last_name", input.lastName],
    ["phone", input.phone],
    ["city", input.city],
    ["country", input.country],
    ["photo_url", input.photoUrl],
    ["language_pref", input.languagePref],
    ["preferences", input.preferences === undefined ? undefined : JSON.stringify(input.preferences)],
  ];
  const columns = candidates.filter(
    (entry): entry is [string, unknown] => entry[1] !== undefined,
  );

  if (!columns.length) return findUserById(id);
  const values = columns.map(([, value]) => value);
  values.push(id);
  const assignments = [
    ...columns.map(([column], index) => `${column} = $${index + 1}`),
    "updated_at = NOW()",
  ].join(", ");
  const result = await query<UserRow>(
    `UPDATE users SET ${assignments} WHERE id = $${values.length} RETURNING ${fields}`,
    values,
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function deleteUser(id: number) {
  const result = await query(`DELETE FROM users WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function createPasswordResetToken(userId: number, tokenHash: string, expiresAt: Date) {
  await query(
    `UPDATE password_reset_tokens SET used_at = NOW()
     WHERE user_id = $1 AND used_at IS NULL`,
    [userId],
  );
  await query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );
}

export async function resetPasswordFromToken(tokenHash: string, passwordHash: string) {
  const result = await query<UserRow>(
    `WITH consumed_token AS (
       UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       RETURNING user_id
     )
     UPDATE users
     SET password_hash = $2, updated_at = NOW()
     WHERE id = (SELECT user_id FROM consumed_token)
     RETURNING ${fields}`,
    [tokenHash, passwordHash],
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function listSavedDestinations(userId: number) {
  const result = await query(
    `SELECT c.id, c.name, c.country, c.region, c.description, c.image_url AS "imageUrl",
            c.rating, c.popularity AS "popularityScore", sd.saved_at AS "savedAt"
     FROM saved_destinations sd
     JOIN cities c ON c.id = sd.city_id
     WHERE sd.user_id = $1
     ORDER BY sd.saved_at DESC`,
    [userId],
  );
  return result.rows;
}

export async function saveDestination(userId: number, cityId: number) {
  const result = await query(
    `INSERT INTO saved_destinations (user_id, city_id) VALUES ($1, $2)
     ON CONFLICT (user_id, city_id) DO NOTHING
     RETURNING user_id`,
    [userId, cityId],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function removeSavedDestination(userId: number, cityId: number) {
  const result = await query(`DELETE FROM saved_destinations WHERE user_id = $1 AND city_id = $2`, [userId, cityId]);
  return (result.rowCount ?? 0) > 0;
}
