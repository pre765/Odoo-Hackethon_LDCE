import { Clock3, MapPin, Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import { getActivities } from "../services/activityApi";
import { addItineraryItem } from "../services/tripApi";
import type { Activity, ActivityCategory } from "../types";

const categories: ActivityCategory[] = ["sightseeing", "food", "adventure", "culture", "nature", "nightlife", "shopping", "relaxation"];

function routeContext() {
  const query = window.location.hash.split("?")[1] ?? "";
  const params = new URLSearchParams(query);
  const tripId = Number(params.get("tripId"));
  const stopId = Number(params.get("stopId"));
  return { tripId: Number.isInteger(tripId) && tripId > 0 ? tripId : null, stopId: Number.isInteger(stopId) && stopId > 0 ? stopId : null, cityId: params.get("cityId") ? Number(params.get("cityId")) : undefined };
}

export default function ActivitySearch() {
  const context = routeContext();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const delay = window.setTimeout(() => {
      setLoading(true); setError(null);
      void getActivities({ q: query || undefined, cityId: context.cityId, category: category || undefined }, controller.signal)
        .then(setActivities)
        .catch((requestError: unknown) => {
          if (!(requestError instanceof DOMException && requestError.name === "AbortError")) setError(requestError instanceof Error ? requestError.message : "Unable to load activities.");
        })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 250);
    return () => { window.clearTimeout(delay); controller.abort(); };
  }, [category, context.cityId, query]);

  async function add(activity: Activity) {
    if (!context.tripId || !context.stopId) {
      setNotice("Open an itinerary stop first, then choose activities to add.");
      return;
    }
    try {
      await addItineraryItem(context.tripId, context.stopId, { activityId: activity.id, scheduledDate: new Date().toISOString().slice(0, 10), durationMins: activity.durationMins, cost: activity.cost });
      setNotice(`${activity.name} was added to this itinerary stop.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to add this activity.");
    }
  }

  return <main className="workspace-page"><Navbar />
    <section className="workspace-hero shell"><div><p className="eyebrow">MAKE EACH DAY MEMORABLE</p><h1>Activity search</h1><p>{context.tripId ? "Choose experiences for your selected itinerary stop." : "Browse experiences, then add them from an itinerary stop."}</p></div></section>
    <section className="workspace-controls shell"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activities..." /><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</select></section>
    {notice && <p className="shell page-notice">{notice}</p>}
    <section className="workspace-grid shell">{loading ? <Loading label="Finding activities..." /> : error ? <div className="page-status page-error">{error}</div> : activities.length === 0 ? <div className="page-status">No activities match these filters.</div> : activities.map((activity) => <article className="activity-workspace-card" key={activity.id}><div><p className="eyebrow"><MapPin size={12} /> {activity.cityName}, {activity.cityCountry}</p><h2>{activity.name}</h2><p>{activity.description || "A memorable experience for your trip."}</p><p className="activity-meta"><Clock3 size={13} /> {activity.durationMins} min · ${activity.cost.toFixed(2)} · {activity.rating?.toFixed(1) ?? "—"}<Star size={12} fill="currentColor" /></p><button className="workspace-primary" type="button" onClick={() => void add(activity)}><Plus size={15} /> Add to itinerary</button></div></article>)}</section>
  </main>;
}
