import type { DashboardData } from "../types";
import { apiRequest } from "./apiClient";

export async function getDashboard(signal?: AbortSignal) {
  return (await apiRequest<{ data: DashboardData }>("/dashboard", {
    authenticated: true,
    signal,
  })).data;
}
