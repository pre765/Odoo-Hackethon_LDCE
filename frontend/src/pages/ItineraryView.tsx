import { CalendarDays, Copy, Edit3, Globe2, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import { getTrip, getTripBudget, updateTripSharing } from "../services/tripApi";
import type { BudgetSummary, Trip } from "../types";

export default function ItineraryView({ tripId }: { tripId: number }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = () => {
    setError(null);
    void Promise.all([getTrip(tripId), getTripBudget(tripId)])
      .then(([loadedTrip, loadedBudget]) => { setTrip(loadedTrip); setBudget(loadedBudget); })
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load itinerary."));
  };
  useEffect(load, [tripId]);

  async function toggleShare() {
    if (!trip) return;
    try {
      const updated = await updateTripSharing(trip.id, !trip.isPublic);
      setTrip(updated);
      if (updated.isPublic && updated.publicSlug) {
        const link = `${window.location.origin}${window.location.pathname}#shared/${updated.publicSlug}`;
        await navigator.clipboard?.writeText(link);
        setNotice("Public itinerary link created and copied to your clipboard.");
      }
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to update sharing."); }
  }

  return <main className="workspace-page"><Navbar />
    {error ? <div className="shell page-status page-error">{error}</div> : !trip ? <Loading label="Loading itinerary..." /> : <>
      <section className="workspace-hero shell"><div><p className="eyebrow">YOUR JOURNEY</p><h1>{trip.name}</h1><p>{trip.description || "Your travel plan, day by day."}</p><p className="trip-dates">{trip.startDate} — {trip.endDate}</p></div><div className="hero-actions"><a className="workspace-primary" href={`#trips/${trip.id}/edit`}><Edit3 size={15} /> Edit itinerary</a><button className="workspace-secondary" onClick={() => void toggleShare()}><Share2 size={15} /> {trip.isPublic ? "Disable sharing" : "Share trip"}</button></div></section>
      {notice && <p className="shell page-notice">{notice}</p>}
      <section className="trip-summary shell"><div><b>{trip.stops?.length ?? 0}</b><span>city stops</span></div><div><b>${budget?.total.toFixed(2) ?? "0.00"}</b><span>estimated total</span></div><a href={`#budget?tripId=${trip.id}`}>View full budget</a><a href="#calendar"><CalendarDays size={15} /> Calendar</a></section>
      <section className="itinerary-view shell">{!trip.stops?.length ? <div className="page-status">This trip has no stops yet. <a href={`#trips/${trip.id}/edit`}>Build itinerary</a></div> : trip.stops.map((stop) => <article className="itinerary-view-stop" key={stop.id}><div className="itinerary-view-city"><p className="eyebrow">{stop.startDate} — {stop.endDate}</p><h2>{stop.cityName}, {stop.cityCountry}</h2><p>Transport: {stop.transportMode || "Not set"} · Stay ${stop.accommodationCost.toFixed(2)} · Meals ${stop.mealCost.toFixed(2)}</p></div><div>{stop.itineraryItems.length ? stop.itineraryItems.map((item) => <div className="itinerary-view-item" key={item.id}><span>{item.scheduledDate} {item.startTime?.slice(0, 5)}</span><b>{item.activityName ?? item.customTitle}</b><span>${item.cost.toFixed(2)}</span></div>) : <p className="empty-copy">No activities added for this stop.</p>}</div></article>)}</section>
      {trip.isPublic && trip.publicSlug && <section className="shell public-link"><Globe2 size={16} /><span>Public link is active.</span><a href={`#shared/${trip.publicSlug}`}>Open shared itinerary</a><button onClick={() => void navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}#shared/${trip.publicSlug}`)}><Copy size={14} /> Copy link</button></section>}
    </>}
  </main>;
}
