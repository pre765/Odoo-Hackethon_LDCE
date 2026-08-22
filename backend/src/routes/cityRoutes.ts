import { Router } from "express";
import { getCities, getCityById, getRecommendedCities } from "../controller/cityController.js";

const cityRouter = Router();

cityRouter.get("/", getCities);
cityRouter.get("/recommended", getRecommendedCities);
cityRouter.get("/:id", getCityById);

export default cityRouter;
