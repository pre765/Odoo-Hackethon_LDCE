import { Copy, Globe2 } from "lucide-react";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import { copyPublicTrip, getPublicTrip } from "../services/tripApi";
import type { Trip } from "../types";

export default function SharedTrip({ slug }: { slug: string }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => { void getPublicTrip(slug).then(setTrip).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load this shared trip.")); }, [slug]);
  async function copy() {
    try { const copied = await copyPublicTrip(slug); setNotice(`“${copied.name}” was added to your trips.`); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Sign in to copy this itinerary."); }
  }
  return <main className="workspace-page"><Navbar />{error ? <div className="shell page-status page-error">{error}</div> : !trip ? <Loading label="Loading shared itinerary..." /> : <><section className="workspace-hero shell"><div><p className="eyebrow"><Globe2 size={13} /> PUBLIC ITINERARY</p><h1>{trip.name}</h1><p>{trip.description || "A shared GlobeTrotter journey."}</p><p className="trip-dates">{trip.startDate} — {trip.endDate}</p></div><button className="workspace-primary" onClick={() => void copy()}><Copy size={15} /> Copy to my trips</button></section>{notice && <p className="shell page-notice">{notice}</p>}<section className="itinerary-view shell">{trip.stops?.map((stop) => <article className="itinerary-view-stop" key={stop.id}><div className="itinerary-view-city"><p className="eyebrow">{stop.startDate} — {stop.endDate}</p><h2>{stop.cityName}, {stop.cityCountry}</h2></div><div>{stop.itineraryItems.map((item) => <div className="itinerary-view-item" key={item.id}><span>{item.scheduledDate} {item.startTime?.slice(0, 5)}</span><b>{item.activityName ?? item.customTitle}</b><span>${item.cost.toFixed(2)}</span></div>)}</div></article>)}</section></>}</main>;
}
