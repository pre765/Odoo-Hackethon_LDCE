import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import { getDestinations } from "../services/cityApi";
import { addStop, deleteItineraryItem, deleteStop, getTrip, reorderStops, updateStop } from "../services/tripApi";
import type { Destination, Trip, TripStop } from "../types";

export default function ItineraryBuilder({ tripId }: { tripId: number }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [cities, setCities] = useState<Destination[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setError(null);
    void getTrip(tripId).then(setTrip).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load this trip."));
  };
  useEffect(load, [tripId]);
  useEffect(() => { void getDestinations({ all: true, sort: "name" }).then(setCities).catch(() => undefined); }, []);

  async function createStop(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const startDate = String(form.get("startDate"));
    const endDate = String(form.get("endDate"));
    if (endDate < startDate) { setError("Stop end date must be on or after its start date."); return; }
    setBusy(true); setError(null);
    try {
      await addStop(tripId, { cityId: Number(form.get("cityId")), startDate, endDate, transportMode: String(form.get("transportMode") || "other") as TripStop["transportMode"], transportCost: Number(form.get("transportCost") || 0), accommodationCost: Number(form.get("accommodationCost") || 0), mealCost: Number(form.get("mealCost") || 0) });
      event.currentTarget.reset(); load();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to add this stop."); } finally { setBusy(false); }
  }

  async function removeStopFromTrip(stop: TripStop) {
    if (!window.confirm(`Remove ${stop.cityName} and its activities?`)) return;
    try { await deleteStop(tripId, stop.id); load(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to remove stop."); }
  }

  async function move(stop: TripStop, direction: -1 | 1) {
    if (!trip?.stops) return;
    const index = trip.stops.findIndex((candidate) => candidate.id === stop.id);
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= trip.stops.length) return;
    const ids = [...trip.stops]; [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];
    try { await reorderStops(tripId, ids.map((item) => item.id)); load(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to reorder stops."); }
  }

  async function updateDates(event: FormEvent<HTMLFormElement>, stop: TripStop) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    try { await updateStop(tripId, stop.id, { startDate: String(form.get("startDate")), endDate: String(form.get("endDate")) }); load(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to update stop dates."); }
  }

  async function removeItem(stop: TripStop, itemId: number) {
    try { await deleteItineraryItem(tripId, stop.id, itemId); load(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to remove activity."); }
  }

  return <main className="workspace-page"><Navbar />
    <section className="workspace-hero shell"><div><p className="eyebrow">CREATE A NEW ADVENTURE</p><h1>Build your itinerary</h1><p>{trip ? `${trip.name} · ${trip.startDate} — ${trip.endDate}` : "Loading your route..."}</p></div><a className="workspace-primary" href={`#trips/${tripId}`}>View itinerary</a></section>
    {error && <p className="shell form-error" role="alert">{error}</p>}
    {!trip ? <Loading label="Loading itinerary..." /> : <>
      <form className="workspace-form shell compact-form" onSubmit={createStop}><h2>Add a city stop</h2><div className="form-row"><label>City<select name="cityId" required><option value="">Choose city</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.name}, {city.country}</option>)}</select></label><label>Transport<select name="transportMode"><option value="other">Other</option><option value="flight">Flight</option><option value="train">Train</option><option value="bus">Bus</option><option value="car">Car</option><option value="ferry">Ferry</option></select></label></div><div className="form-row"><label>Start date<input name="startDate" type="date" defaultValue={trip.startDate} required /></label><label>End date<input name="endDate" type="date" defaultValue={trip.endDate} required /></label></div><div className="form-row"><label>Transport cost<input name="transportCost" type="number" min="0" step="0.01" defaultValue="0" /></label><label>Stay cost<input name="accommodationCost" type="number" min="0" step="0.01" defaultValue="0" /></label><label>Meals cost<input name="mealCost" type="number" min="0" step="0.01" defaultValue="0" /></label></div><button className="workspace-primary" disabled={busy}><Plus size={15} /> {busy ? "Adding..." : "Add stop"}</button></form>
      <section className="itinerary-builder shell">{!trip.stops?.length ? <div className="page-status">No stops yet. Add your first destination above.</div> : trip.stops.map((stop, index) => <article className="itinerary-stop" key={stop.id}><div className="stop-head"><div><span className="stop-number">{index + 1}</span><h2>{stop.cityName}, {stop.cityCountry}</h2></div><div className="stop-actions"><button type="button" aria-label="Move stop earlier" onClick={() => void move(stop, -1)} disabled={index === 0}><ArrowUp size={15} /></button><button type="button" aria-label="Move stop later" onClick={() => void move(stop, 1)} disabled={index === (trip.stops?.length ?? 1) - 1}><ArrowDown size={15} /></button><button type="button" aria-label="Remove stop" onClick={() => void removeStopFromTrip(stop)}><Trash2 size={15} /></button></div></div><form className="inline-form" onSubmit={(event) => void updateDates(event, stop)}><label>Start<input name="startDate" type="date" defaultValue={stop.startDate} /></label><label>End<input name="endDate" type="date" defaultValue={stop.endDate} /></label><button>Save dates</button></form><div className="itinerary-items">{stop.itineraryItems.length === 0 ? <p>No activities yet.</p> : stop.itineraryItems.map((item) => <div key={item.id} className="itinerary-item"><span>{item.scheduledDate}{item.startTime ? ` · ${item.startTime.slice(0, 5)}` : ""}</span><b>{item.activityName ?? item.customTitle}</b><span>${item.cost.toFixed(2)}</span><button type="button" aria-label="Remove activity" onClick={() => void removeItem(stop, item.id)}><Trash2 size={14} /></button></div>)}</div><a className="text-action" href={`#activities?tripId=${tripId}&stopId=${stop.id}&cityId=${stop.cityId}`}>+ Add activity</a></article>)}</section>
    </>}
  </main>;
}
