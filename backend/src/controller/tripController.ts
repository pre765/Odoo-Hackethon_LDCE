import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import type { ItineraryInput, StopInput, TripInput } from "../models/tripModel.js";
import {
  addTripItineraryItem,
  addTripStop,
  calculateTripBudget,
  clonePublicTrip,
  createUserTrip,
  getPublicTrip as getSharedTrip,
  getTripCalendar,
  getTrip,
  listTrips,
  orderTripStops,
  removeTripItineraryItem,
  removeTripStop,
  removeUserTrip,
  updateTripItineraryItem,
  updateTripSharing,
  updateTripStop,
  updateUserTrip,
} from "../services/tripService.js";

const validTransportModes = new Set(["flight", "train", "bus", "car", "ferry", "other"]);

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

function nullableString(value: unknown) {
  if (value === null) return null;
  return stringValue(value);
}

function numericValue(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function routeId(value: string | string[] | undefined) {
  if (Array.isArray(value)) return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00`));
}

function validDateRange(startDate: unknown, endDate: unknown) {
  return isIsoDate(startDate) && isIsoDate(endDate) && startDate <= endDate;
}

function validPartialDates(startDate: unknown, endDate: unknown) {
  if (startDate !== undefined && !isIsoDate(startDate)) return false;
  if (endDate !== undefined && !isIsoDate(endDate)) return false;
  return startDate === undefined || endDate === undefined || startDate <= endDate;
}

function tripInput(body: Record<string, unknown>, partial = false): TripInput | null {
  const name = stringValue(body.name);
  const startDate = body.startDate;
  const endDate = body.endDate;
  if (!partial && (!name || !validDateRange(startDate, endDate))) return null;
  if (partial && !validPartialDates(startDate, endDate)) return null;
  const totalBudget = numericValue(body.totalBudget);
  if (totalBudget === null || totalBudget !== undefined && totalBudget < 0) return null;
  return {
    ...(name !== undefined ? { name } : {}),
    ...(body.description !== undefined ? { description: nullableString(body.description) } : {}),
    ...(startDate !== undefined ? { startDate } : {}),
    ...(endDate !== undefined ? { endDate } : {}),
    ...(body.coverPhotoUrl !== undefined ? { coverPhotoUrl: nullableString(body.coverPhotoUrl) } : {}),
    ...(totalBudget !== undefined ? { totalBudget } : {}),
  } as TripInput;
}

function stopInput(body: Record<string, unknown>, partial = false): StopInput | null {
  const cityId = body.cityId === undefined ? undefined : numericValue(body.cityId);
  const startDate = body.startDate;
  const endDate = body.endDate;
  const transportMode = nullableString(body.transportMode);
  const moneyFields = ["transportCost", "accommodationCost", "mealCost"] as const;
  const money = Object.fromEntries(moneyFields.map((field) => [field, numericValue(body[field])])) as Record<typeof moneyFields[number], number | null | undefined>;
  if ((!partial && (!Number.isInteger(cityId) || !validDateRange(startDate, endDate))) || cityId === null || Object.values(money).some((value) => value === null || value !== undefined && value < 0)) return null;
  if (partial && !validPartialDates(startDate, endDate)) return null;
  if (transportMode !== undefined && transportMode !== null && !validTransportModes.has(transportMode)) return null;
  const orderIndex = body.orderIndex === undefined ? undefined : numericValue(body.orderIndex);
  if (orderIndex === null || orderIndex !== undefined && (!Number.isInteger(orderIndex) || orderIndex < 0)) return null;
  return {
    ...(cityId !== undefined ? { cityId: cityId as number } : {}),
    ...(startDate !== undefined ? { startDate: startDate as string } : {}),
    ...(endDate !== undefined ? { endDate: endDate as string } : {}),
    ...(transportMode !== undefined ? { transportMode } : {}),
    ...(orderIndex !== undefined ? { orderIndex } : {}),
    ...(money.transportCost !== undefined ? { transportCost: money.transportCost as number } : {}),
    ...(money.accommodationCost !== undefined ? { accommodationCost: money.accommodationCost as number } : {}),
    ...(money.mealCost !== undefined ? { mealCost: money.mealCost as number } : {}),
    ...(body.notes !== undefined ? { notes: nullableString(body.notes) } : {}),
  } as StopInput;
}

function itineraryInput(body: Record<string, unknown>, partial = false): ItineraryInput | null {
  const activityId = body.activityId === undefined ? undefined : numericValue(body.activityId);
  const cost = body.cost === undefined ? undefined : numericValue(body.cost);
  const durationMins = body.durationMins === undefined ? undefined : numericValue(body.durationMins);
  const orderIndex = body.orderIndex === undefined ? undefined : numericValue(body.orderIndex);
  const customTitle = nullableString(body.customTitle);
  if (!partial && (!isIsoDate(body.scheduledDate) || (activityId === undefined && !customTitle))) return null;
  if (body.scheduledDate !== undefined && !isIsoDate(body.scheduledDate)) return null;
  if (activityId === null || cost === null || durationMins === null || orderIndex === null) return null;
  if ((cost !== undefined && cost < 0) || (durationMins !== undefined && (!Number.isInteger(durationMins) || durationMins < 1)) || (orderIndex !== undefined && (!Number.isInteger(orderIndex) || orderIndex < 0))) return null;
  return {
    ...(activityId !== undefined ? { activityId: activityId as number } : {}),
    ...(body.customTitle !== undefined ? { customTitle } : {}),
    ...(body.scheduledDate !== undefined ? { scheduledDate: body.scheduledDate as string } : {}),
    ...(body.startTime !== undefined ? { startTime: nullableString(body.startTime) } : {}),
    ...(durationMins !== undefined ? { durationMins } : {}),
    ...(cost !== undefined ? { cost } : {}),
    ...(body.notes !== undefined ? { notes: nullableString(body.notes) } : {}),
    ...(orderIndex !== undefined ? { orderIndex } : {}),
  } as ItineraryInput;
}

export async function getTrips(request: AuthenticatedRequest, response: Response) {
  return response.json({ data: await listTrips(request.userId!) });
}

export async function getTripDetails(request: AuthenticatedRequest, response: Response) {
  const tripId = routeId(request.params.tripId);
  if (!tripId) return response.status(400).json({ error: "A valid trip id is required." });
  const trip = await getTrip(request.userId!, tripId);
  return trip ? response.json({ data: trip }) : response.status(404).json({ error: "Trip not found." });
}

export async function postTrip(request: AuthenticatedRequest, response: Response) {
  const input = tripInput(request.body);
  const stops = Array.isArray(request.body.stops) ? request.body.stops.map((stop: unknown) => stopInput(stop as Record<string, unknown>)).filter(Boolean) as StopInput[] : [];
  if (!input || stops.length !== (Array.isArray(request.body.stops) ? request.body.stops.length : 0)) return response.status(400).json({ error: "A trip name, valid dates, and valid stops are required." });
  const trip = await createUserTrip(request.userId!, input, stops);
  return response.status(201).json({ data: trip });
}

export async function patchTrip(request: AuthenticatedRequest, response: Response) {
  const tripId = routeId(request.params.tripId);
  const input = tripInput(request.body, true);
  if (!tripId || !input) return response.status(400).json({ error: "Invalid trip update." });
  const trip = await updateUserTrip(request.userId!, tripId, input);
  return trip ? response.json({ data: trip }) : response.status(404).json({ error: "Trip not found." });
}

export async function removeTrip(request: AuthenticatedRequest, response: Response) {
  const tripId = routeId(request.params.tripId);
  if (!tripId) return response.status(400).json({ error: "A valid trip id is required." });
  return await removeUserTrip(request.userId!, tripId) ? response.status(204).send() : response.status(404).json({ error: "Trip not found." });
}

export async function postStop(request: AuthenticatedRequest, response: Response) {
  const tripId = routeId(request.params.tripId);
  const input = stopInput(request.body);
  if (!tripId || !input) return response.status(400).json({ error: "Invalid trip stop." });
  const stop = await addTripStop(request.userId!, tripId, input);
  return stop ? response.status(201).json({ data: stop }) : response.status(404).json({ error: "Trip not found." });
}

export async function patchStop(request: AuthenticatedRequest, response: Response) {
  const tripId = routeId(request.params.tripId); const stopId = routeId(request.params.stopId); const input = stopInput(request.body, true);
  if (!tripId || !stopId || !input) return response.status(400).json({ error: "Invalid trip stop update." });
  const stop = await updateTripStop(request.userId!, tripId, stopId, input);
  return stop ? response.json({ data: stop }) : response.status(404).json({ error: "Trip stop not found." });
}

export async function removeStop(request: AuthenticatedRequest, response: Response) {
  const tripId = routeId(request.params.tripId); const stopId = routeId(request.params.stopId);
  if (!tripId || !stopId) return response.status(400).json({ error: "A valid trip and stop id are required." });
  return await removeTripStop(request.userId!, tripId, stopId) ? response.status(204).send() : response.status(404).json({ error: "Trip stop not found." });
}

export async function putStopOrder(request: AuthenticatedRequest, response: Response) {
  const tripId = routeId(request.params.tripId);
  const stopIds = request.body.stopIds;
  if (!tripId || !Array.isArray(stopIds) || stopIds.some((id) => !Number.isInteger(id))) return response.status(400).json({ error: "A complete ordered stop id list is required." });
  return await orderTripStops(request.userId!, tripId, stopIds) ? response.status(204).send() : response.status(400).json({ error: "The stop ids do not match this trip." });
}

export async function postItineraryItem(request: AuthenticatedRequest, response: Response) {
  const tripId = routeId(request.params.tripId); const stopId = routeId(request.params.stopId); const input = itineraryInput(request.body);
  if (!tripId || !stopId || !input) return response.status(400).json({ error: "Invalid itinerary item." });
  const item = await addTripItineraryItem(request.userId!, tripId, stopId, input);
  return item ? response.status(201).json({ data: item }) : response.status(404).json({ error: "Trip stop not found." });
}

export async function patchItineraryItem(request: AuthenticatedRequest, response: Response) {
  const tripId = routeId(request.params.tripId); const stopId = routeId(request.params.stopId); const itemId = routeId(request.params.itemId); const input = itineraryInput(request.body, true);
  if (!tripId || !stopId || !itemId || !input) return response.status(400).json({ error: "Invalid itinerary item update." });
  const item = await updateTripItineraryItem(request.userId!, tripId, stopId, itemId, input);
  return item ? response.json({ data: item }) : response.status(404).json({ error: "Itinerary item not found." });
}

export async function removeItineraryItem(request: AuthenticatedRequest, response: Response) {
  const tripId = routeId(request.params.tripId); const stopId = routeId(request.params.stopId); const itemId = routeId(request.params.itemId);
  if (!tripId || !stopId || !itemId) return response.status(400).json({ error: "A valid trip, stop, and item id are required." });
  return await removeTripItineraryItem(request.userId!, tripId, stopId, itemId) ? response.status(204).send() : response.status(404).json({ error: "Itinerary item not found." });
}

export async function getBudget(request: AuthenticatedRequest, response: Response) {
  const tripId = routeId(request.params.tripId);
  if (!tripId) return response.status(400).json({ error: "A valid trip id is required." });
  const budget = await calculateTripBudget(request.userId!, tripId);
  return budget ? response.json({ data: budget }) : response.status(404).json({ error: "Trip not found." });
}

export async function getCalendar(request: AuthenticatedRequest, response: Response) {
  const tripId = routeId(request.params.tripId);
  const from = stringValue(request.query.from);
  const to = stringValue(request.query.to);
  if (!tripId || (from !== undefined && !isIsoDate(from)) || (to !== undefined && !isIsoDate(to)) || (from && to && from > to)) {
    return response.status(400).json({ error: "A valid trip id and optional YYYY-MM-DD date range are required." });
  }
  const calendar = await getTripCalendar(request.userId!, tripId, from, to);
  return calendar ? response.json({ data: calendar }) : response.status(404).json({ error: "Trip not found." });
}

export async function patchSharing(request: AuthenticatedRequest, response: Response) {
  const tripId = routeId(request.params.tripId);
  if (!tripId || typeof request.body.isPublic !== "boolean") return response.status(400).json({ error: "isPublic must be a boolean." });
  const trip = await updateTripSharing(request.userId!, tripId, request.body.isPublic);
  return trip ? response.json({ data: trip }) : response.status(404).json({ error: "Trip not found." });
}

export async function getPublicTrip(request: AuthenticatedRequest, response: Response) {
  const trip = await getSharedTrip(stringValue(request.params.slug) ?? "");
  return trip ? response.json({ data: trip }) : response.status(404).json({ error: "Public trip not found." });
}

export async function postCopyPublicTrip(request: AuthenticatedRequest, response: Response) {
  const trip = await clonePublicTrip(request.userId!, stringValue(request.params.slug) ?? "");
  return trip ? response.status(201).json({ data: trip }) : response.status(404).json({ error: "Public trip not found." });
}
