import { Router } from "express";
import { getActivities, getActivityById } from "../controller/activityController.js";

const activityRouter = Router();
activityRouter.get("/", getActivities);
activityRouter.get("/:id", getActivityById);

export default activityRouter;
