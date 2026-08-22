import type { Request, Response } from "express";
import { activityCategories, findActivities, findActivityById, type ActivityCategory } from "../models/activityModel.js";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

function optionalNumber(value: unknown) {
  const valueText = text(value);
  if (valueText === undefined || valueText === "") return undefined;
  const numberValue = Number(valueText);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export async function getActivities(request: Request, response: Response) {
  const cityId = optionalNumber(request.query.cityId);
  const minCost = optionalNumber(request.query.minCost);
  const maxCost = optionalNumber(request.query.maxCost);
  const limit = optionalNumber(request.query.limit) ?? 100;
  const category = text(request.query.category);
  if ([cityId, minCost, maxCost].some((value) => value === null) || !Number.isInteger(limit) || limit < 1 || limit > 100 || (typeof minCost === "number" && typeof maxCost === "number" && minCost > maxCost)) {
    return response.status(400).json({ error: "Invalid activity filter values." });
  }
  if (category && !activityCategories.includes(category as ActivityCategory)) {
    return response.status(400).json({ error: "Unsupported activity category." });
  }
  const data = await findActivities({
    search: text(request.query.q),
    cityId: cityId ?? undefined,
    category: category as ActivityCategory | undefined,
    minCost: minCost ?? undefined,
    maxCost: maxCost ?? undefined,
    limit,
  });
  return response.json({ data });
}

export async function getActivityById(request: Request, response: Response) {
  const activityId = Number(request.params.id);
  if (!Number.isInteger(activityId)) return response.status(400).json({ error: "A valid activity id is required." });
  const activity = await findActivityById(activityId);
  return activity ? response.json({ data: activity }) : response.status(404).json({ error: "Activity not found." });
}
