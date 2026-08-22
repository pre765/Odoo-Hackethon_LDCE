export type DestinationFilter = "all" | "popular" | "highly-rated";
export type DestinationGroup = "none" | "country" | "region";
export type DestinationSort = "popular" | "rating" | "name";
export type ActivityCategory =
  | "sightseeing"
  | "food"
  | "adventure"
  | "culture"
  | "nature"
  | "nightlife"
  | "shopping"
  | "relaxation";
export type TransportMode = "flight" | "train" | "bus" | "car" | "ferry" | "other";

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

export interface User {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  photoUrl: string | null;
  languagePref: string | null;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: number;
  cityId: number;
  cityName: string;
  cityCountry: string;
  name: string;
  category: ActivityCategory;
  description: string | null;
  cost: number;
  durationMins: number;
  imageUrl: string | null;
  rating: number | null;
}

export interface ItineraryItem {
  id: number;
  tripStopId: number;
  activityId: number | null;
  activityName: string | null;
  customTitle: string | null;
  scheduledDate: string;
  startTime: string | null;
  durationMins: number | null;
  cost: number;
  notes: string | null;
  orderIndex: number;
}

export interface TripStop {
  id: number;
  tripId: number;
  cityId: number;
  cityName: string;
  cityCountry: string;
  cityImageUrl: string | null;
  orderIndex: number;
  startDate: string;
  endDate: string;
  transportMode: TransportMode | null;
  transportCost: number;
  accommodationCost: number;
  mealCost: number;
  notes: string | null;
  itineraryItems: ItineraryItem[];
}

export interface Trip {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  coverPhotoUrl: string | null;
  totalBudget: number | null;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  destinations: string[];
  stops?: TripStop[];
  accent?: "gold" | "sage" | "terracotta" | "ocean";
}

export interface BudgetSummary {
  transport: number;
  stay: number;
  meals: number;
  activities: number;
  total: number;
  days: number;
  averageDaily: number;
  target: number | null;
  remaining: number | null;
  isOverBudget: boolean;
  overBy: number;
}

export interface CalendarItem {
  id: number;
  tripStopId: number;
  scheduledDate: string;
  startTime: string | null;
  durationMins: number | null;
  orderIndex: number;
  activityId: number | null;
  title: string;
  cityName: string;
  cityCountry: string;
}

export interface DashboardData {
  upcomingTrips: Trip[];
  recentTrips: Trip[];
  recommendations: Destination[];
  budgetSummary: {
    totalPlanned: number;
    totalBudget: number;
    remaining: number;
    overBudgetTrips: number;
  };
}
