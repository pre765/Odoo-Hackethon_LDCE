export type DestinationFilter = "all" | "popular" | "highly-rated";
export type DestinationGroup = "none" | "country" | "region";
export type DestinationSort = "popular" | "rating" | "name";

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string | null;
  description: string | null;
  imageUrl: string | null;
  rating: number | null;
  popularityScore: number | null;
}

export interface DestinationQuery {
  q?: string;
  filter?: DestinationFilter;
  sort?: DestinationSort;
  groupBy?: Exclude<DestinationGroup, "none">;
  limit?: number;
  all?: boolean;
}

/**
 * Calendar-ready trip shape.
 *
 * The backend does not currently expose trips, so this is deliberately small
 * and can be mapped directly from the future trip endpoint.
 */
export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  stops?: string[];
  description?: string;
  accent?: "gold" | "sage" | "terracotta" | "ocean";
}
