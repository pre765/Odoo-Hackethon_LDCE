import {
  addItineraryItem,
  copyPublicTrip,
  createStop,
  createTrip,
  deleteItineraryItem,
  deleteStop,
  deleteTrip,
  findOwnedTripDetails,
  findTripCalendar,
  findPublicTripDetails,
  findTripsForUser,
  getTripBudget,
  reorderStops,
  setTripSharing,
  updateItineraryItem,
  updateStop,
  updateTrip,
  type ItineraryInput,
  type StopInput,
  type TripInput,
} from "../models/tripModel.js";

export const listTrips = findTripsForUser;
export const getTrip = findOwnedTripDetails;
export const getPublicTrip = findPublicTripDetails;
export const createUserTrip = (userId: number, trip: TripInput, stops: StopInput[]) => createTrip(userId, trip, stops);
export const updateUserTrip = updateTrip;
export const removeUserTrip = deleteTrip;
export const addTripStop = createStop;
export const updateTripStop = updateStop;
export const removeTripStop = deleteStop;
export const orderTripStops = reorderStops;
export const addTripItineraryItem = (userId: number, tripId: number, stopId: number, item: ItineraryInput) => addItineraryItem(userId, tripId, stopId, item);
export const updateTripItineraryItem = updateItineraryItem;
export const removeTripItineraryItem = deleteItineraryItem;
export const calculateTripBudget = getTripBudget;
export const getTripCalendar = findTripCalendar;
export const updateTripSharing = setTripSharing;
export const clonePublicTrip = copyPublicTrip;
