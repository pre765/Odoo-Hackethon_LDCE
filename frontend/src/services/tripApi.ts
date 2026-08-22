import type {
  BudgetSummary,
  CalendarItem,
  ItineraryItem,
  TransportMode,
  Trip,
  TripStop,
} from "../types";
import { apiRequest } from "./apiClient";

export interface TripStopInput {
  cityId: number;
  orderIndex?: number;
  startDate: string;
  endDate: string;
  transportMode?: TransportMode | null;
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

export interface TripInput {
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  coverPhotoUrl?: string | null;
  totalBudget?: number | null;
  stops?: TripStopInput[];
  travelers?: number;
}

export async function getTrips(signal?: AbortSignal) {
  return (await apiRequest<{ data: Trip[] }>("/trips", { authenticated: true, signal })).data;
}

export async function getTrip(id: number, signal?: AbortSignal) {
  return (await apiRequest<{ data: Trip }>(`/trips/${id}`, { authenticated: true, signal })).data;
}

export async function createTrip(input: TripInput) {
  return (await apiRequest<{ data: Trip }>("/trips", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(input),
  })).data;
}

export async function updateTrip(id: number, input: Partial<TripInput>) {
  return (await apiRequest<{ data: Trip }>(`/trips/${id}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(input),
  })).data;
}

export function deleteTrip(id: number) {
  return apiRequest<void>(`/trips/${id}`, { method: "DELETE", authenticated: true });
}

export async function getTripBudget(id: number, signal?: AbortSignal) {
  return (await apiRequest<{ data: BudgetSummary }>(`/trips/${id}/budget`, {
    authenticated: true,
    signal,
  })).data;
}

export async function getTripCalendar(id: number, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const suffix = params.size ? `?${params.toString()}` : "";
  return (await apiRequest<{ data: CalendarItem[] }>(`/trips/${id}/calendar${suffix}`, {
    authenticated: true,
  })).data;
}

export async function addStop(tripId: number, input: TripStopInput) {
  return (await apiRequest<{ data: TripStop }>(`/trips/${tripId}/stops`, {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(input),
  })).data;
}

export async function updateStop(tripId: number, stopId: number, input: Partial<TripStopInput>) {
  return (await apiRequest<{ data: TripStop }>(`/trips/${tripId}/stops/${stopId}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(input),
  })).data;
}

export function deleteStop(tripId: number, stopId: number) {
  return apiRequest<void>(`/trips/${tripId}/stops/${stopId}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export function reorderStops(tripId: number, stopIds: number[]) {
  return apiRequest<void>(`/trips/${tripId}/stops/order`, {
    method: "PUT",
    authenticated: true,
    body: JSON.stringify({ stopIds }),
  });
}

export async function addItineraryItem(tripId: number, stopId: number, input: ItineraryInput) {
  return (await apiRequest<{ data: ItineraryItem }>(`/trips/${tripId}/stops/${stopId}/itinerary`, {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(input),
  })).data;
}

export async function updateItineraryItem(
  tripId: number,
  stopId: number,
  itemId: number,
  input: Partial<ItineraryInput>,
) {
  return (await apiRequest<{ data: ItineraryItem }>(`/trips/${tripId}/stops/${stopId}/itinerary/${itemId}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(input),
  })).data;
}

export function deleteItineraryItem(tripId: number, stopId: number, itemId: number) {
  return apiRequest<void>(`/trips/${tripId}/stops/${stopId}/itinerary/${itemId}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export async function updateTripSharing(id: number, isPublic: boolean) {
  return (await apiRequest<{ data: Trip }>(`/trips/${id}/sharing`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify({ isPublic }),
  })).data;
}

export async function getPublicTrip(slug: string, signal?: AbortSignal) {
  return (await apiRequest<{ data: Trip }>(`/trips/public/${encodeURIComponent(slug)}`, { signal })).data;
}

export async function copyPublicTrip(slug: string) {
  return (await apiRequest<{ data: Trip }>(`/trips/public/${encodeURIComponent(slug)}/copy`, {
    method: "POST",
    authenticated: true,
  })).data;
}
