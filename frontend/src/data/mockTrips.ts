import type { Trip } from "../types";

function dateInCurrentMonth(day: number) {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const date = new Date(today.getFullYear(), today.getMonth(), Math.min(day, lastDay), 12);

  return date.toISOString().slice(0, 10);
}

/**
 * Temporary data for the Calendar page. Replace this export with a trip API
 * response once `/api/trips` is available on the backend.
 */
export const mockTrips: Trip[] = [
  {
    id: 1,
    name: "Paris Trip",
    destinations: ["Paris, France"],
    startDate: dateInCurrentMonth(4),
    endDate: dateInCurrentMonth(7),
    stops: ["Le Marais", "Montmartre", "Saint-Germain-des-Prés"],
    description: "A long weekend of galleries, cafés, and an evening by the Seine.",
    accent: "gold",
  },
  {
    id: 2,
    name: "Japan Adventure",
    destinations: ["Tokyo & Kyoto, Japan"],
    startDate: dateInCurrentMonth(15),
    endDate: dateInCurrentMonth(19),
    stops: ["Tokyo", "Hakone", "Kyoto"],
    description: "A food-and-culture route from Tokyo's neighbourhoods to Kyoto's temples.",
    accent: "terracotta",
  },
  {
    id: 3,
    name: "NYC Getaway",
    destinations: ["New York City, USA"],
    startDate: dateInCurrentMonth(23),
    endDate: dateInCurrentMonth(26),
    stops: ["SoHo", "Central Park", "Brooklyn"],
    description: "A city break built around neighbourhood walks, museums, and great food.",
    accent: "ocean",
  },
  {
    id: 4,
    name: "Coastal Escape",
    destinations: ["Amalfi Coast, Italy"],
    startDate: dateInCurrentMonth(28),
    endDate: dateInCurrentMonth(30),
    stops: ["Positano", "Ravello", "Amalfi"],
    description: "A relaxed coastal itinerary through cliffside villages and local trattorias.",
    accent: "sage",
  },
];
