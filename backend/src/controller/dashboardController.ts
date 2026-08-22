import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { getUserDashboard } from "../services/dashboardService.js";

export async function getDashboard(request: AuthenticatedRequest, response: Response) {
  return response.json({ data: await getUserDashboard(request.userId!) });
}
