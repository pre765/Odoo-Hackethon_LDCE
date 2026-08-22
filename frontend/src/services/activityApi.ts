import type { Activity } from "../types";
import { apiRequest } from "./apiClient";

export interface ActivityQuery {
  q?: string;
  cityId?: number;
  category?: string;
  minCost?: number;
  maxCost?: number;
}

export async function getActivities(query: ActivityQuery = {}, signal?: AbortSignal) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  const suffix = params.size ? `?${params.toString()}` : "";
  return (await apiRequest<{ data: Activity[] }>(`/activities${suffix}`, { signal })).data;
}

export async function getActivity(id: number, signal?: AbortSignal) {
  return (await apiRequest<{ data: Activity }>(`/activities/${id}`, { signal })).data;
}
