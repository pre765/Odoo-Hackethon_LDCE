import { Router } from "express";
import {
  getBudget,
  getCalendar,
  getPublicTrip,
  getTripDetails,
  getTrips,
  patchItineraryItem,
  patchSharing,
  patchStop,
  patchTrip,
  postCopyPublicTrip,
  postItineraryItem,
  postStop,
  postTrip,
  putStopOrder,
  removeItineraryItem,
  removeStop,
  removeTrip,
} from "../controller/tripController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const tripRouter = Router();

tripRouter.get("/public/:slug", getPublicTrip);
tripRouter.post("/public/:slug/copy", requireAuth, postCopyPublicTrip);

tripRouter.use(requireAuth);
tripRouter.get("/", getTrips);
tripRouter.post("/", postTrip);
tripRouter.get("/:tripId/calendar", getCalendar);
tripRouter.get("/:tripId", getTripDetails);
tripRouter.patch("/:tripId", patchTrip);
tripRouter.delete("/:tripId", removeTrip);
tripRouter.get("/:tripId/budget", getBudget);
tripRouter.patch("/:tripId/sharing", patchSharing);
tripRouter.post("/:tripId/stops", postStop);
tripRouter.put("/:tripId/stops/order", putStopOrder);
tripRouter.patch("/:tripId/stops/:stopId", patchStop);
tripRouter.delete("/:tripId/stops/:stopId", removeStop);
tripRouter.post("/:tripId/stops/:stopId/itinerary", postItineraryItem);
tripRouter.patch("/:tripId/stops/:stopId/itinerary/:itemId", patchItineraryItem);
tripRouter.delete("/:tripId/stops/:stopId/itinerary/:itemId", removeItineraryItem);

export default tripRouter;
