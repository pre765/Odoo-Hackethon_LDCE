import { query } from "../config/database.js";

export const activityCategories = [
  "sightseeing",
  "food",
  "adventure",
  "culture",
  "nature",
  "nightlife",
  "shopping",
  "relaxation",
] as const;

export type ActivityCategory = (typeof activityCategories)[number];

export interface ActivityQuery {
  search?: string;
  cityId?: number;
  category?: ActivityCategory;
  minCost?: number;
  maxCost?: number;
  limit?: number;
}

interface ActivityRow {
  id: number;
  city_id: number;
  city_name: string;
  city_country: string;
  name: string;
  category: ActivityCategory;
  description: string | null;
  cost: string | number;
  duration_mins: number;
  image_url: string | null;
  rating: string | number | null;
}

function toActivity(row: ActivityRow) {
  return {
    id: row.id,
    cityId: row.city_id,
    cityName: row.city_name,
    cityCountry: row.city_country,
    name: row.name,
    category: row.category,
    description: row.description,
    cost: Number(row.cost),
    durationMins: row.duration_mins,
    imageUrl: row.image_url,
    rating: row.rating === null ? null : Number(row.rating),
  };
}

const fields = `
  a.id, a.city_id, c.name AS city_name, c.country AS city_country,
  a.name, a.category, a.description, a.cost, a.duration_mins, a.image_url, a.rating
`;

export async function findActivities(options: ActivityQuery) {
  const values: unknown[] = [];
  const conditions: string[] = [];
  if (options.search) {
    values.push(`%${options.search}%`);
    conditions.push(`(a.name ILIKE $${values.length} OR COALESCE(a.description, '') ILIKE $${values.length})`);
  }
  if (options.cityId) {
    values.push(options.cityId);
    conditions.push(`a.city_id = $${values.length}`);
  }
  if (options.category) {
    values.push(options.category);
    conditions.push(`a.category = $${values.length}`);
  }
  if (options.minCost !== undefined) {
    values.push(options.minCost);
    conditions.push(`a.cost >= $${values.length}`);
  }
  if (options.maxCost !== undefined) {
    values.push(options.maxCost);
    conditions.push(`a.cost <= $${values.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = options.limit ?? 100;
  values.push(limit);
  const result = await query<ActivityRow>(
    `SELECT ${fields} FROM activities a JOIN cities c ON c.id = a.city_id
     ${where} ORDER BY COALESCE(a.rating, 0) DESC, a.name ASC LIMIT $${values.length}`,
    values,
  );
  return result.rows.map(toActivity);
}

export async function findActivityById(id: number) {
  const result = await query<ActivityRow>(
    `SELECT ${fields} FROM activities a JOIN cities c ON c.id = a.city_id WHERE a.id = $1`,
    [id],
  );
  return result.rows[0] ? toActivity(result.rows[0]) : null;
}
