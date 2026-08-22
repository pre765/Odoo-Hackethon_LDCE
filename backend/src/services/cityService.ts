import {
  findDestinationById,
  findDestinations,
  type DestinationQuery,
} from "../models/cityModel.js";

/** Destination business layer. It keeps controllers independent of database access. */
export function getDestinationList(options: DestinationQuery) {
  return findDestinations(options);
}

export function getDestinationDetails(id: string) {
  return findDestinationById(id);
}
