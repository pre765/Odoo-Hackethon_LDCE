import { Router } from "express";
import { getCities, getCityById } from "../controller/cityController.js";

const cityRouter = Router();

cityRouter.get("/", getCities);
cityRouter.get("/:id", getCityById);

export default cityRouter;
