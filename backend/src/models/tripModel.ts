import { randomBytes } from "node:crypto";
import { database, query } from "../config/database.js";

export interface TripInput {
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  coverPhotoUrl?: string | null;
  totalBudget?: number | null;
  travelers?: number;
}

export interface StopInput {
  cityId: number;
  orderIndex?: number;
  startDate: string;
  endDate: string;
  transportMode?: string | null;
  transportCost?: number;
  accommodationCost?: number;
  mealCost?: number;
  notes?: string | null;
}

export interface ItineraryInput {
  activityId?: number | null;
  customTitle?: string | null;
  scheduledDate: string;
  startTime?: string | null;
  durationMins?: number;
  cost?: number;
  notes?: string | null;
  orderIndex?: number;
}

interface TripRow {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  cover_photo_url: string | null;
  total_budget: string | number | null;
  is_public: boolean;
  public_slug: string | null;
  created_at: Date;
  destinations?: string | null;
}

interface StopRow {
  id: number;
  trip_id: number;
  city_id: number;
  city_name: string;
  city_country: string;
  city_image_url: string | null;
  order_index: number;
  start_date: string;
  end_date: string;
  transport_mode: string | null;
  transport_cost: string | number | null;
  accommodation_cost: string | number | null;
  meal_cost: string | number | null;
  notes: string | null;
}

interface ItemRow {
  id: number;
  trip_stop_id: number;
  activity_id: number | null;
  activity_name: string | null;
  custom_title: string | null;
  scheduled_date: string;
  start_time: string | null;
  duration_mins: number | null;
  cost: string | number;
  notes: string | null;
  order_index: number;
}

const tripFields = `id, user_id, name, description, start_date, end_date, cover_photo_url, total_budget, is_public, public_slug, created_at`;
const tripFieldsWithAlias = `t.id, t.user_id, t.name, t.description, t.start_date, t.end_date, t.cover_photo_url, t.total_budget, t.is_public, t.public_slug, t.created_at`;

function toTrip(row: TripRow) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    coverPhotoUrl: row.cover_photo_url,
    totalBudget: row.total_budget === null ? null : Number(row.total_budget),
    isPublic: row.is_public,
    publicSlug: row.public_slug,
    createdAt: row.created_at.toISOString(),
    destinations: row.destinations?.split(" | ").filter(Boolean) ?? [],
  };
}

function toStop(row: StopRow, itineraryItems: ReturnType<typeof toItineraryItem>[] = []) {
  return {
    id: row.id,
    tripId: row.trip_id,
    cityId: row.city_id,
    cityName: row.city_name,
    cityCountry: row.city_country,
    cityImageUrl: row.city_image_url,
    orderIndex: row.order_index,
    startDate: row.start_date,
    endDate: row.end_date,
    transportMode: row.transport_mode,
    transportCost: Number(row.transport_cost ?? 0),
    accommodationCost: Number(row.accommodation_cost ?? 0),
    mealCost: Number(row.meal_cost ?? 0),
    notes: row.notes,
    itineraryItems,
  };
}

function toItineraryItem(row: ItemRow) {
  return {
    id: row.id,
    tripStopId: row.trip_stop_id,
    activityId: row.activity_id,
    activityName: row.activity_name,
    customTitle: row.custom_title,
    scheduledDate: row.scheduled_date,
    startTime: row.start_time,
    durationMins: row.duration_mins,
    cost: Number(row.cost),
    notes: row.notes,
    orderIndex: row.order_index,
  };
}

const stopsQuery = `
  SELECT s.id, s.trip_id, s.city_id, c.name AS city_name, c.country AS city_country, c.image_url AS city_image_url,
         s.order_index, s.start_date, s.end_date, s.transport_mode, s.transport_cost,
         s.accommodation_cost, s.meal_cost, s.notes
  FROM trip_stops s JOIN cities c ON c.id = s.city_id
`;

export async function findTripsForUser(userId: number) {
  const result = await query<TripRow>(
    `SELECT ${tripFieldsWithAlias}, STRING_AGG(DISTINCT c.name || ', ' || c.country, ' | ' ORDER BY c.name) AS destinations
     FROM trips t LEFT JOIN trip_stops s ON s.trip_id = t.id LEFT JOIN cities c ON c.id = s.city_id
     WHERE t.user_id = $1 GROUP BY t.id ORDER BY t.start_date DESC, t.created_at DESC`,
    [userId],
  );
  return result.rows.map(toTrip);
}

export async function findOwnedTrip(userId: number, tripId: number) {
  const result = await query<TripRow>(`SELECT ${tripFields} FROM trips WHERE id = $1 AND user_id = $2`, [tripId, userId]);
  return result.rows[0] ? toTrip(result.rows[0]) : null;
}

async function getTripDetailsByWhere(where: string, values: unknown[]) {
  const tripResult = await query<TripRow>(`SELECT ${tripFields} FROM trips WHERE ${where}`, values);
  if (!tripResult.rows[0]) return null;
  const trip = toTrip(tripResult.rows[0]);
  const stopsResult = await query<StopRow>(`${stopsQuery} WHERE s.trip_id = $1 ORDER BY s.order_index`, [trip.id]);
  const itemsResult = await query<ItemRow>(
    `SELECT i.id, i.trip_stop_id, i.activity_id, a.name AS activity_name, i.custom_title,
            i.scheduled_date, i.start_time, i.duration_mins, i.cost, i.notes, i.order_index
     FROM itinerary_items i LEFT JOIN activities a ON a.id = i.activity_id
     WHERE i.trip_stop_id = ANY($1::int[]) ORDER BY i.scheduled_date, i.start_time NULLS LAST, i.order_index`,
    [stopsResult.rows.map((stop) => stop.id)],
  );
  const itemsByStop = new Map<number, ReturnType<typeof toItineraryItem>[]>();
  itemsResult.rows.forEach((item) => {
    const items = itemsByStop.get(item.trip_stop_id) ?? [];
    items.push(toItineraryItem(item));
    itemsByStop.set(item.trip_stop_id, items);
  });
  return { ...trip, stops: stopsResult.rows.map((stop) => toStop(stop, itemsByStop.get(stop.id) ?? [])) };
}

export function findOwnedTripDetails(userId: number, tripId: number) {
  return getTripDetailsByWhere("id = $1 AND user_id = $2", [tripId, userId]);
}

export function findPublicTripDetails(slug: string) {
  return getTripDetailsByWhere("public_slug = $1 AND is_public = TRUE", [slug]);
}

export async function createTrip(userId: number, input: TripInput, stops: StopInput[] = []) {
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    const tripResult = await client.query<TripRow>(
      `INSERT INTO trips
(user_id, name, description, start_date, end_date,
 cover_photo_url, total_budget, travelers)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ${tripFields}`,
      [userId, input.name, input.description ?? null, input.startDate, input.endDate, input.coverPhotoUrl ?? null, input.totalBudget ?? null],
    );
    const trip = toTrip(tripResult.rows[0]);
    for (const [index, stop] of stops.entries()) {
      await client.query(
        `INSERT INTO trip_stops (trip_id, city_id, order_index, start_date, end_date, transport_mode, transport_cost, accommodation_cost, meal_cost, notes)
         VALUES ($1, $2, $3, $4, $5, $6::transport_mode, $7, $8, $9, $10)`,
        [trip.id, stop.cityId, stop.orderIndex ?? index, stop.startDate, stop.endDate, stop.transportMode ?? null, stop.transportCost ?? 0, stop.accommodationCost ?? 0, stop.mealCost ?? 0, stop.notes ?? null],
      );
    }
    await client.query("COMMIT");
    return findOwnedTripDetails(userId, trip.id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateTrip(userId: number, tripId: number, input: Partial<TripInput>) {
  const values: unknown[] = [];
  const candidates: Array<[string, unknown | undefined]> = [
    ["name", input.name], ["description", input.description], ["start_date", input.startDate],
    ["end_date", input.endDate], ["cover_photo_url", input.coverPhotoUrl], ["total_budget", input.totalBudget],
  ];
  const fields = candidates.filter((entry): entry is [string, unknown] => entry[1] !== undefined);
  if (!fields.length) return findOwnedTripDetails(userId, tripId);
  fields.forEach(([, value]) => values.push(value));
  values.push(tripId, userId);
  const set = fields.map(([field], index) => `${field} = $${index + 1}`).join(", ");
  const result = await query<TripRow>(`UPDATE trips SET ${set} WHERE id = $${values.length - 1} AND user_id = $${values.length} RETURNING id`, values);
  return result.rows[0] ? findOwnedTripDetails(userId, tripId) : null;
}

export async function deleteTrip(userId: number, tripId: number) {
  const result = await query(`DELETE FROM trips WHERE id = $1 AND user_id = $2`, [tripId, userId]);
  return (result.rowCount ?? 0) > 0;
}

export async function createStop(userId: number, tripId: number, stop: StopInput) {
  if (!(await findOwnedTrip(userId, tripId))) return null;
  const orderResult = await query<{ next_order: number }>(
    `SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order FROM trip_stops WHERE trip_id = $1`, [tripId],
  );
  const inserted = await query<{ id: number }>(
    `INSERT INTO trip_stops (trip_id, city_id, order_index, start_date, end_date, transport_mode, transport_cost, accommodation_cost, meal_cost, notes)
     VALUES ($1, $2, $3, $4, $5, $6::transport_mode, $7, $8, $9, $10) RETURNING id`,
    [tripId, stop.cityId, stop.orderIndex ?? orderResult.rows[0].next_order, stop.startDate, stop.endDate, stop.transportMode ?? null, stop.transportCost ?? 0, stop.accommodationCost ?? 0, stop.mealCost ?? 0, stop.notes ?? null],
  );
  const stopResult = await query<StopRow>(`${stopsQuery} WHERE s.id = $1`, [inserted.rows[0].id]);
  return toStop(stopResult.rows[0]);
}

export async function updateStop(userId: number, tripId: number, stopId: number, input: Partial<StopInput>) {
  if (!(await findOwnedTrip(userId, tripId))) return null;
  const candidates: Array<[string, unknown | undefined]> = [
    ["city_id", input.cityId], ["order_index", input.orderIndex], ["start_date", input.startDate], ["end_date", input.endDate],
    ["transport_mode", input.transportMode], ["transport_cost", input.transportCost], ["accommodation_cost", input.accommodationCost],
    ["meal_cost", input.mealCost], ["notes", input.notes],
  ];
  const fields = candidates.filter((entry): entry is [string, unknown] => entry[1] !== undefined);
  if (fields.length) {
    const values = fields.map(([, value]) => value);
    values.push(stopId, tripId);
    const set = fields.map(([field], index) => `${field} = $${index + 1}${field === "transport_mode" ? "::transport_mode" : ""}`).join(", ");
    const updated = await query(`UPDATE trip_stops SET ${set} WHERE id = $${values.length - 1} AND trip_id = $${values.length}`, values);
    if (!(updated.rowCount ?? 0)) return null;
  }
  const stopResult = await query<StopRow>(`${stopsQuery} WHERE s.id = $1 AND s.trip_id = $2`, [stopId, tripId]);
  return stopResult.rows[0] ? toStop(stopResult.rows[0]) : null;
}

export async function deleteStop(userId: number, tripId: number, stopId: number) {
  if (!(await findOwnedTrip(userId, tripId))) return false;
  const result = await query(`DELETE FROM trip_stops WHERE id = $1 AND trip_id = $2`, [stopId, tripId]);
  return (result.rowCount ?? 0) > 0;
}

export async function reorderStops(userId: number, tripId: number, stopIds: number[]) {
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    const owned = await client.query(`SELECT id FROM trips WHERE id = $1 AND user_id = $2`, [tripId, userId]);
    if (!owned.rowCount) {
      await client.query("ROLLBACK");
      return false;
    }
    const current = await client.query<{ id: number }>(`SELECT id FROM trip_stops WHERE trip_id = $1 ORDER BY order_index`, [tripId]);
    if (current.rows.length !== stopIds.length || current.rows.some((row) => !stopIds.includes(row.id))) {
      await client.query("ROLLBACK");
      return false;
    }
    await client.query(`UPDATE trip_stops SET order_index = order_index + 10000 WHERE trip_id = $1`, [tripId]);
    for (const [index, stopId] of stopIds.entries()) await client.query(`UPDATE trip_stops SET order_index = $1 WHERE id = $2`, [index, stopId]);
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function ownedStop(userId: number, tripId: number, stopId: number) {
  const result = await query(`SELECT s.id FROM trip_stops s JOIN trips t ON t.id = s.trip_id WHERE s.id = $1 AND s.trip_id = $2 AND t.user_id = $3`, [stopId, tripId, userId]);
  return Boolean(result.rows[0]);
}

export async function addItineraryItem(userId: number, tripId: number, stopId: number, item: ItineraryInput) {
  if (!(await ownedStop(userId, tripId, stopId))) return null;
  const order = item.orderIndex ?? 0;
  const result = await query<{ id: number }>(
    `INSERT INTO itinerary_items (trip_stop_id, activity_id, custom_title, scheduled_date, start_time, duration_mins, cost, notes, order_index)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [stopId, item.activityId ?? null, item.customTitle ?? null, item.scheduledDate, item.startTime ?? null, item.durationMins ?? 60, item.cost ?? 0, item.notes ?? null, order],
  );
  return findItineraryItem(userId, tripId, stopId, result.rows[0].id);
}

export async function findItineraryItem(userId: number, tripId: number, stopId: number, itemId: number) {
  if (!(await ownedStop(userId, tripId, stopId))) return null;
  const result = await query<ItemRow>(
    `SELECT i.id, i.trip_stop_id, i.activity_id, a.name AS activity_name, i.custom_title, i.scheduled_date, i.start_time, i.duration_mins, i.cost, i.notes, i.order_index
     FROM itinerary_items i LEFT JOIN activities a ON a.id = i.activity_id WHERE i.id = $1 AND i.trip_stop_id = $2`, [itemId, stopId],
  );
  return result.rows[0] ? toItineraryItem(result.rows[0]) : null;
}

export async function updateItineraryItem(userId: number, tripId: number, stopId: number, itemId: number, input: Partial<ItineraryInput>) {
  if (!(await ownedStop(userId, tripId, stopId))) return null;
  const candidates: Array<[string, unknown | undefined]> = [
    ["activity_id", input.activityId], ["custom_title", input.customTitle], ["scheduled_date", input.scheduledDate], ["start_time", input.startTime],
    ["duration_mins", input.durationMins], ["cost", input.cost], ["notes", input.notes], ["order_index", input.orderIndex],
  ];
  const fields = candidates.filter((entry): entry is [string, unknown] => entry[1] !== undefined);
  if (fields.length) {
    const values = fields.map(([, value]) => value);
    values.push(itemId, stopId);
    const set = fields.map(([field], index) => `${field} = $${index + 1}`).join(", ");
    const updated = await query(`UPDATE itinerary_items SET ${set} WHERE id = $${values.length - 1} AND trip_stop_id = $${values.length}`, values);
    if (!(updated.rowCount ?? 0)) return null;
  }
  return findItineraryItem(userId, tripId, stopId, itemId);
}

export async function deleteItineraryItem(userId: number, tripId: number, stopId: number, itemId: number) {
  if (!(await ownedStop(userId, tripId, stopId))) return false;
  const result = await query(`DELETE FROM itinerary_items WHERE id = $1 AND trip_stop_id = $2`, [itemId, stopId]);
  return (result.rowCount ?? 0) > 0;
}

export async function getTripBudget(userId: number, tripId: number) {
  if (!(await findOwnedTrip(userId, tripId))) return null;
  const result = await query<{ transport: string; stay: string; meals: string; activities: string; days: string; total_budget: string | number | null }>(
    `SELECT
       COALESCE(SUM(s.transport_cost), 0) AS transport,
       COALESCE(SUM(s.accommodation_cost), 0) AS stay,
       COALESCE(SUM(s.meal_cost), 0) AS meals,
       COALESCE((SELECT SUM(i.cost) FROM itinerary_items i JOIN trip_stops its ON its.id = i.trip_stop_id WHERE its.trip_id = $1), 0) AS activities,
       GREATEST((SELECT end_date - start_date + 1 FROM trips WHERE id = $1), 1) AS days,
       (SELECT total_budget FROM trips WHERE id = $1) AS total_budget
     FROM trip_stops s WHERE s.trip_id = $1`, [tripId],
  );
  const row = result.rows[0];
  const transport = Number(row.transport);
  const stay = Number(row.stay);
  const meals = Number(row.meals);
  const activities = Number(row.activities);
  const total = transport + stay + meals + activities;
  const target = row.total_budget === null ? null : Number(row.total_budget);
  const remaining = target === null ? null : target - total;
  return {
    transport,
    stay,
    meals,
    activities,
    total,
    days: Number(row.days),
    averageDaily: total / Number(row.days),
    target,
    remaining,
    isOverBudget: remaining !== null && remaining < 0,
    overBy: remaining !== null && remaining < 0 ? Math.abs(remaining) : 0,
  };
}

export async function findTripCalendar(userId: number, tripId: number, from?: string, to?: string) {
  if (!(await findOwnedTrip(userId, tripId))) return null;
  const values: unknown[] = [tripId];
  const conditions = ["s.trip_id = $1"];
  if (from) {
    values.push(from);
    conditions.push(`i.scheduled_date >= $${values.length}`);
  }
  if (to) {
    values.push(to);
    conditions.push(`i.scheduled_date <= $${values.length}`);
  }
  const result = await query<{
    id: number;
    trip_stop_id: number;
    scheduled_date: string;
    start_time: string | null;
    duration_mins: number | null;
    order_index: number;
    activity_id: number | null;
    activity_name: string | null;
    custom_title: string | null;
    city_name: string;
    city_country: string;
  }>(
    `SELECT i.id, i.trip_stop_id, i.scheduled_date, i.start_time, i.duration_mins, i.order_index,
            i.activity_id, a.name AS activity_name, i.custom_title, c.name AS city_name, c.country AS city_country
     FROM itinerary_items i
     JOIN trip_stops s ON s.id = i.trip_stop_id
     JOIN cities c ON c.id = s.city_id
     LEFT JOIN activities a ON a.id = i.activity_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY i.scheduled_date, i.start_time NULLS LAST, i.order_index`,
    values,
  );
  return result.rows.map((row) => ({
    id: row.id,
    tripStopId: row.trip_stop_id,
    scheduledDate: row.scheduled_date,
    startTime: row.start_time,
    durationMins: row.duration_mins,
    orderIndex: row.order_index,
    activityId: row.activity_id,
    title: row.activity_name ?? row.custom_title ?? "Untitled activity",
    cityName: row.city_name,
    cityCountry: row.city_country,
  }));
}

export async function setTripSharing(userId: number, tripId: number, isPublic: boolean) {
  const existing = await findOwnedTrip(userId, tripId);
  if (!existing) return null;
  const slug = isPublic ? existing.publicSlug ?? randomBytes(9).toString("base64url") : null;
  const result = await query<TripRow>(
    `UPDATE trips SET is_public = $1, public_slug = $2 WHERE id = $3 AND user_id = $4 RETURNING ${tripFields}`,
    [isPublic, slug, tripId, userId],
  );
  return toTrip(result.rows[0]);
}

export async function copyPublicTrip(userId: number, slug: string) {
  const publicTrip = await findPublicTripDetails(slug);
  if (!publicTrip) return null;
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    const tripResult = await client.query<{ id: number }>(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_photo_url, total_budget)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [userId, `${publicTrip.name} (Copy)`, publicTrip.description, publicTrip.startDate, publicTrip.endDate, publicTrip.coverPhotoUrl, publicTrip.totalBudget],
    );
    const newTripId = tripResult.rows[0].id;
    for (const stop of publicTrip.stops) {
      const stopResult = await client.query<{ id: number }>(
        `INSERT INTO trip_stops (trip_id, city_id, order_index, start_date, end_date, transport_mode, transport_cost, accommodation_cost, meal_cost, notes)
         VALUES ($1, $2, $3, $4, $5, $6::transport_mode, $7, $8, $9, $10) RETURNING id`,
        [newTripId, stop.cityId, stop.orderIndex, stop.startDate, stop.endDate, stop.transportMode, stop.transportCost, stop.accommodationCost, stop.mealCost, stop.notes],
      );
      for (const item of stop.itineraryItems) {
        await client.query(
          `INSERT INTO itinerary_items (trip_stop_id, activity_id, custom_title, scheduled_date, start_time, duration_mins, cost, notes, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [stopResult.rows[0].id, item.activityId, item.customTitle, item.scheduledDate, item.startTime, item.durationMins, item.cost, item.notes, item.orderIndex],
        );
      }
    }
    await client.query("COMMIT");
    return findOwnedTripDetails(userId, newTripId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
