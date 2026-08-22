import { getRecommendedDestinations } from "./recommendationService.js";
import { calculateTripBudget, listTrips } from "./tripService.js";

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Aggregates existing trip and city data for the authenticated dashboard. */
export async function getUserDashboard(userId: number) {
  const trips = await listTrips(userId);
  const todayValue = today();
  const upcomingTrips = trips
    .filter((trip) => trip.endDate >= todayValue)
    .sort((first, second) => first.startDate.localeCompare(second.startDate))
    .slice(0, 3);
  const recentTrips = [...trips]
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .slice(0, 3);
  const budgets = await Promise.all(
    upcomingTrips.map(async (trip) => ({
      tripId: trip.id,
      budget: await calculateTripBudget(userId, trip.id),
    })),
  );
  const budgetSummary = budgets.reduce(
    (summary, entry) => {
      if (!entry.budget) return summary;
      summary.totalPlanned += entry.budget.total;
      summary.totalBudget += entry.budget.target ?? 0;
      summary.overBudgetTrips += entry.budget.isOverBudget ? 1 : 0;
      return summary;
    },
    { totalPlanned: 0, totalBudget: 0, overBudgetTrips: 0 },
  );

  return {
    upcomingTrips,
    recentTrips,
    recommendations: await getRecommendedDestinations(6),
    budgetSummary: {
      ...budgetSummary,
      remaining: budgetSummary.totalBudget - budgetSummary.totalPlanned,
    },
  };
}
