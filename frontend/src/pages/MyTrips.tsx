import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import { deleteTrip, getTrips } from "../services/tripApi";
import type { Trip } from "../types";

function tripState(trip: Trip) {
  const today = new Date().toISOString().slice(0, 10);
  if (trip.endDate < today) return "Completed";
  if (trip.startDate <= today) return "Ongoing";
  return "Upcoming";
}

export default function MyTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    void getTrips()
      .then(setTrips)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load trips."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const visibleTrips = useMemo(() => {
    const term = search.trim().toLowerCase();
    return trips.filter((trip) => {
      const matchesTerm = !term || [trip.name, trip.description, ...trip.destinations].join(" ").toLowerCase().includes(term);
      return matchesTerm && (filter === "all" || tripState(trip).toLowerCase() === filter);
    });
  }, [filter, search, trips]);

  async function remove(trip: Trip) {
    if (!window.confirm(`Delete “${trip.name}”? This cannot be undone.`)) return;
    try {
      await deleteTrip(trip.id);
      setTrips((current) => current.filter((currentTrip) => currentTrip.id !== trip.id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete trip.");
    }
  }

  return (
    <main className="workspace-page">
      <Navbar />
      <section className="workspace-hero shell">
        <div><p className="eyebrow">YOUR ADVENTURES</p><h1>My trips</h1><p>Keep every route, stop, and experience in one place.</p></div>
        <a className="workspace-primary" href="#trips/new"><Plus size={16} /> Plan a trip</a>
      </section>
      <section className="workspace-controls shell">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your trips..." aria-label="Search trips" />
        <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter trips">
          <option value="all">All trips</option><option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
        </select>
      </section>
      <section className="workspace-grid shell" aria-live="polite">
        {loading ? <Loading label="Loading your trips..." /> : error ? <div className="page-status page-error"><p>{error}</p><button onClick={load}>Try again</button></div> : visibleTrips.length === 0 ? <div className="page-status">No trips match yet. Start planning your next adventure.</div> : visibleTrips.map((trip) => (
          <article className="trip-workspace-card" key={trip.id}>
            <span className={`trip-status ${tripState(trip).toLowerCase()}`}>{tripState(trip)}</span>
            <h2>{trip.name}</h2>
            <p className="trip-dates">{trip.startDate} — {trip.endDate}</p>
            <p>{trip.destinations.join(" · ") || "No stops added yet"}</p>
            <p>{trip.description || "Build your route, activities, and budget."}</p>
            <div className="card-actions">
              <a href={`#trips/${trip.id}`}>View itinerary <ChevronRight size={15} /></a>
              <a href={`#trips/${trip.id}/edit`}>Edit</a>
              <button type="button" aria-label={`Delete ${trip.name}`} onClick={() => void remove(trip)}><Trash2 size={15} /></button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
