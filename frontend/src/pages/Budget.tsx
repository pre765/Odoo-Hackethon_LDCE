import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import { getTripBudget, getTrips } from "../services/tripApi";
import type { BudgetSummary, Trip } from "../types";

function initialTripId() {
  const value = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("tripId");
  return value ? Number(value) : 0;
}

export default function Budget() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripId, setTripId] = useState(initialTripId);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { void getTrips().then((data) => { setTrips(data); setTripId((current) => current || data[0]?.id || 0); }).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load trips.")).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!tripId) return; setLoading(true); void getTripBudget(tripId).then(setBudget).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load budget.")).finally(() => setLoading(false)); }, [tripId]);
  const categories = budget ? [["Transport", budget.transport], ["Stay", budget.stay], ["Meals", budget.meals], ["Activities", budget.activities]] : [];
  return <main className="workspace-page"><Navbar /><section className="workspace-hero shell"><div><p className="eyebrow">TRAVEL WITH CLARITY</p><h1>Trip budget</h1><p>See estimated costs, daily averages, and any budget overrun in one place.</p></div></section><section className="workspace-controls shell"><select value={tripId} onChange={(event) => setTripId(Number(event.target.value))}><option value="0">Choose a trip</option>{trips.map((trip) => <option value={trip.id} key={trip.id}>{trip.name}</option>)}</select></section>{loading ? <Loading label="Calculating budget..." /> : error ? <div className="shell page-status page-error">{error}</div> : !budget ? <div className="shell page-status">Create a trip to see its budget.</div> : <section className="budget-layout shell"><article className="budget-total"><p className="eyebrow">ESTIMATED TOTAL</p><h2>${budget.total.toFixed(2)}</h2><p>${budget.averageDaily.toFixed(2)} daily average across {budget.days} days</p>{budget.target !== null && <p>Budget target: ${budget.target.toFixed(2)} · {budget.remaining !== null && `${budget.remaining >= 0 ? "$" : "-$"}${Math.abs(budget.remaining).toFixed(2)} ${budget.remaining >= 0 ? "remaining" : "over"}`}</p>}{budget.isOverBudget && <p className="budget-alert"><AlertTriangle size={15} /> Over budget by ${budget.overBy.toFixed(2)}</p>}</article><article className="budget-breakdown"><h2>Cost breakdown</h2>{categories.map(([label, amount]) => <div className="budget-row" key={String(label)}><span>{label}</span><div><i style={{ width: `${budget.total ? (Number(amount) / budget.total) * 100 : 0}%` }} /></div><b>${Number(amount).toFixed(2)}</b></div>)}</article></section>}</main>;
}
