import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import { getDashboard } from "../services/dashboardApi";
import type { DashboardData } from "../types";

export default function AdminPanel() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void getDashboard().then(setData).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load dashboard data.")); }, []);

  return <main className="workspace-page"><Navbar />
    <section className="workspace-hero shell"><div><p className="eyebrow">ADMIN OVERVIEW</p><h1>Travel workspace overview</h1><p>Review trip and budget data available to the signed-in account.</p></div></section>
    {error ? <div className="shell page-status page-error">{error}</div> : !data ? <Loading label="Loading overview..." /> : <section className="trip-summary shell"><div><b>{data.upcomingTrips.length}</b><span>upcoming trips</span></div><div><b>${data.budgetSummary.totalPlanned.toFixed(2)}</b><span>planned spend</span></div><div><b>{data.budgetSummary.overBudgetTrips}</b><span>trips over budget</span></div><a href="#trips">Manage trips</a></section>}
  </main>;
}
