import { findDestinations } from "../models/cityModel.js";

/** A lightweight recommendation source based on the existing city popularity data. */
export function getRecommendedDestinations(limit = 8) {
  return findDestinations({ filter: "popular", sort: "popular", limit });
}
