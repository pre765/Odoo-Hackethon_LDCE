import type { Destination, User } from "../types";
import { apiRequest, setAuthToken } from "./apiClient";

interface AuthResponse {
  data: { user: User; token: string };
}

export async function signup(input: { firstName: string; lastName?: string; email: string; password: string }) {
  const response = await apiRequest<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(input) });
  setAuthToken(response.data.token);
  return response.data.user;
}

export async function login(input: { email: string; password: string }) {
  const response = await apiRequest<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(input) });
  setAuthToken(response.data.token);
  return response.data.user;
}

export async function getCurrentUser() {
  return (await apiRequest<{ data: User }>("/auth/me", { authenticated: true })).data;
}

export async function updateProfile(input: Partial<Omit<User, "id" | "email" | "createdAt" | "updatedAt">>) {
  return (await apiRequest<{ data: User }>("/auth/me", { method: "PATCH", authenticated: true, body: JSON.stringify(input) })).data;
}

export async function forgotPassword(email: string) {
  return (await apiRequest<{ data: { message: string; resetToken?: string } }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })).data;
}

export async function resetPassword(token: string, password: string) {
  const response = await apiRequest<AuthResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
  setAuthToken(response.data.token);
  return response.data.user;
}

export async function getSavedDestinations() {
  return (await apiRequest<{ data: Destination[] }>("/auth/me/saved-destinations", { authenticated: true })).data;
}

export function saveDestination(cityId: string | number) {
  return apiRequest<{ data: { cityId: number } }>(`/auth/me/saved-destinations/${cityId}`, {
    method: "POST",
    authenticated: true,
  });
}

export function removeSavedDestination(cityId: string | number) {
  return apiRequest<void>(`/auth/me/saved-destinations/${cityId}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export function deleteAccount() {
  return apiRequest<void>("/auth/me", { method: "DELETE", authenticated: true });
}

export function logout() {
  setAuthToken(null);
}
