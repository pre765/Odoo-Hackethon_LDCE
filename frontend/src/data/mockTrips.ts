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
    id: "paris-trip",
    name: "Paris Trip",
    destination: "Paris, France",
    startDate: dateInCurrentMonth(4),
    endDate: dateInCurrentMonth(7),
    stops: ["Le Marais", "Montmartre", "Saint-Germain-des-Prés"],
    description: "A long weekend of galleries, cafés, and an evening by the Seine.",
    accent: "gold",
  },
  {
    id: "japan-adventure",
    name: "Japan Adventure",
    destination: "Tokyo & Kyoto, Japan",
    startDate: dateInCurrentMonth(15),
    endDate: dateInCurrentMonth(19),
    stops: ["Tokyo", "Hakone", "Kyoto"],
    description: "A food-and-culture route from Tokyo's neighbourhoods to Kyoto's temples.",
    accent: "terracotta",
  },
  {
    id: "nyc-getaway",
    name: "NYC Getaway",
    destination: "New York City, USA",
    startDate: dateInCurrentMonth(23),
    endDate: dateInCurrentMonth(26),
    stops: ["SoHo", "Central Park", "Brooklyn"],
    description: "A city break built around neighbourhood walks, museums, and great food.",
    accent: "ocean",
  },
  {
    id: "coastal-escape",
    name: "Coastal Escape",
    destination: "Amalfi Coast, Italy",
    startDate: dateInCurrentMonth(28),
    endDate: dateInCurrentMonth(30),
    stops: ["Positano", "Ravello", "Amalfi"],
    description: "A relaxed coastal itinerary through cliffside villages and local trattorias.",
    accent: "sage",
  },
];
