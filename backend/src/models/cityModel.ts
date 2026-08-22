import { query } from "../config/database.js";

export type DestinationSort = "popular" | "rating" | "name";
export type DestinationFilter = "all" | "popular" | "highly-rated";
export type DestinationGroup = "country" | "region" | undefined;

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string | null;
  description: string | null;
  imageUrl: string | null;
  rating: number | null;
  popularityScore: number | null;
}

export interface DestinationQuery {
  search?: string;
  filter: DestinationFilter;
  sort: DestinationSort;
  groupBy?: DestinationGroup;
  limit?: number;
}

interface DestinationRow {
  id: string | number;
  name: string;
  country: string;
  region: string | null;
  description: string | null;
  image_url: string | null;
  rating: string | number | null;
  popularity_score: string | number | null;
}

const destinationFields = `
  id,
  name,
  country,
  region,
  description,
  image_url,
  rating,
  popularity AS popularity_score
`;

function toDestination(row: DestinationRow): Destination {
  return {
    id: String(row.id),
    name: row.name,
    country: row.country,
    region: row.region,
    description: row.description,
    imageUrl: row.image_url,
    rating: row.rating === null ? null : Number(row.rating),
    popularityScore:
      row.popularity_score === null ? null : Number(row.popularity_score),
  };
}

function orderBy(sort: DestinationSort, groupBy?: DestinationGroup) {
  const groupOrder =
    groupBy === "country"
      ? "country ASC NULLS LAST,"
      : groupBy === "region"
        ? "region ASC NULLS LAST,"
        : "";

  const sortOrder = {
    popular:
      "COALESCE(popularity, 0) DESC, COALESCE(rating, 0) DESC, name ASC",
    rating: "COALESCE(rating, 0) DESC, COALESCE(popularity, 0) DESC, name ASC",
    name: "name ASC",
  }[sort];

  return `${groupOrder} ${sortOrder}`;
}

/**
 * Reads existing city data only. The database owner should expose the columns
 * selected above on the `cities` table; this model never creates or alters it.
 */
export async function findDestinations(options: DestinationQuery) {
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (options.search) {
    values.push(`%${options.search}%`);
    conditions.push(
      `(name ILIKE $${values.length} OR country ILIKE $${values.length} OR COALESCE(region, '') ILIKE $${values.length})`,
    );
  }

  if (options.filter === "popular") {
    conditions.push("COALESCE(popularity, 0) > 0");
  }

  if (options.filter === "highly-rated") {
    conditions.push("COALESCE(rating, 0) >= 4.5");
  }

  if (options.limit) {
    values.push(options.limit);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limitClause = options.limit ? `LIMIT $${values.length}` : "";
  const result = await query<DestinationRow>(
    `
      SELECT ${destinationFields}
      FROM cities
      ${whereClause}
      ORDER BY ${orderBy(options.sort, options.groupBy)}
      ${limitClause}
    `,
    values,
  );

  return result.rows.map(toDestination);
}

export async function findDestinationById(id: string) {
  const result = await query<DestinationRow>(
    `SELECT ${destinationFields} FROM cities WHERE id = $1 LIMIT 1`,
    [id],
  );

  return result.rows[0] ? toDestination(result.rows[0]) : null;
}
