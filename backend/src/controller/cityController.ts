import type { Request, Response } from "express";
import type {
  DestinationFilter,
  DestinationGroup,
  DestinationSort,
} from "../models/cityModel.js";
import {
  getDestinationDetails,
  getDestinationList,
} from "../services/cityService.js";

const validFilters = new Set<DestinationFilter>(["all", "popular", "highly-rated"]);
const validSorts = new Set<DestinationSort>(["popular", "rating", "name"]);
const validGroups = new Set<DestinationGroup>([undefined, "country", "region"]);

function firstQueryValue(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

export async function getCities(request: Request, response: Response) {
  const search = firstQueryValue(request.query.q);
  const requestedFilter = firstQueryValue(request.query.filter) ?? "all";
  const requestedSort = firstQueryValue(request.query.sort) ?? "popular";
  const requestedGroup = firstQueryValue(request.query.groupBy);
  const requestedAll = firstQueryValue(request.query.all);
  const requestedLimit = Number(firstQueryValue(request.query.limit) ?? 4);

  if (!validFilters.has(requestedFilter as DestinationFilter)) {
    return response.status(400).json({ error: "Unsupported destination filter." });
  }
  if (!validSorts.has(requestedSort as DestinationSort)) {
    return response.status(400).json({ error: "Unsupported destination sort." });
  }
  if (!validGroups.has(requestedGroup as DestinationGroup)) {
    return response.status(400).json({ error: "Unsupported destination group." });
  }
  if (requestedAll !== undefined && requestedAll !== "true") {
    return response.status(400).json({ error: "all must be true when provided." });
  }
  if (requestedAll !== "true" && (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 100)) {
    return response.status(400).json({ error: "limit must be an integer from 1 to 100." });
  }

  const cities = await getDestinationList({
    search: search || undefined,
    filter: requestedFilter as DestinationFilter,
    sort: requestedSort as DestinationSort,
    groupBy: requestedGroup as DestinationGroup,
    limit: requestedAll === "true" ? undefined : requestedLimit,
  });

  return response.json({
    data: cities,
    meta: {
      count: cities.length,
      search: search ?? "",
      filter: requestedFilter,
      sort: requestedSort,
      groupBy: requestedGroup ?? null,
      all: requestedAll === "true",
    },
  });
}

export async function getCityById(request: Request, response: Response) {
  const cityId = firstQueryValue(request.params.id);
  const city = cityId ? await getDestinationDetails(cityId) : null;

  if (!city) {
    return response.status(404).json({ error: "Destination not found." });
  }

  return response.json({ data: city });
}
