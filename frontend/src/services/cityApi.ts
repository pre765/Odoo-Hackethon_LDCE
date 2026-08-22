import type { Destination, DestinationQuery } from "../types";

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");

interface DestinationListResponse {
  data: Destination[];
}

interface DestinationResponse {
  data: Destination;
}

interface ApiErrorBody {
  error?: string;
}

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new Error(body.error ?? "Unable to load destinations. Please try again.");
  }

  return response.json() as Promise<T>;
}

export async function getDestinations(
  query: DestinationQuery = {},
  signal?: AbortSignal,
) {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.filter && query.filter !== "all") params.set("filter", query.filter);
  if (query.sort) params.set("sort", query.sort);
  if (query.groupBy) params.set("groupBy", query.groupBy);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.all) params.set("all", "true");

  const suffix = params.size ? `?${params.toString()}` : "";
  const response = await fetch(`${apiBaseUrl}/cities${suffix}`, { signal });
  return (await readResponse<DestinationListResponse>(response)).data;
}

export async function getDestination(id: string, signal?: AbortSignal) {
  const response = await fetch(`${apiBaseUrl}/cities/${encodeURIComponent(id)}`, { signal });
  return (await readResponse<DestinationResponse>(response)).data;
}
