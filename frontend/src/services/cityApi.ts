import type { Destination, DestinationQuery } from "../types";
import { apiRequest } from "./apiClient";

interface DestinationListResponse {
  data: Destination[];
}

interface DestinationResponse {
  data: Destination;
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
  return (await apiRequest<DestinationListResponse>(`/cities${suffix}`, { signal })).data;
}

export async function getDestination(id: string, signal?: AbortSignal) {
  return (await apiRequest<DestinationResponse>(`/cities/${encodeURIComponent(id)}`, { signal })).data;
}

export async function getRecommendedDestinations(limit = 8, signal?: AbortSignal) {
  return (await apiRequest<DestinationListResponse>(`/cities/recommended?limit=${limit}`, { signal })).data;
}
