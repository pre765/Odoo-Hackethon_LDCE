import { Router } from "express";
import { getDashboard } from "../controller/dashboardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const dashboardRouter = Router();
dashboardRouter.get("/", requireAuth, getDashboard);

export default dashboardRouter;
