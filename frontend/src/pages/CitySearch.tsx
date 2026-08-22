import { Heart, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import { getDestinations } from "../services/cityApi";
import { saveDestination } from "../services/authApi";
import type { Destination, DestinationFilter, DestinationSort } from "../types";

export default function CitySearch() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DestinationFilter>("all");
  const [sort, setSort] = useState<DestinationSort>("popular");
  const [cities, setCities] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const delay = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void getDestinations({ q: query || undefined, filter, sort, all: true }, controller.signal)
        .then(setCities)
        .catch((requestError: unknown) => {
          if (!(requestError instanceof DOMException && requestError.name === "AbortError")) setError(requestError instanceof Error ? requestError.message : "Unable to load cities.");
        })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 250);
    return () => { window.clearTimeout(delay); controller.abort(); };
  }, [filter, query, sort]);

  async function save(city: Destination) {
    try {
      await saveDestination(city.id);
      setNotice(`${city.name} is saved to your profile.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Sign in to save destinations.");
    }
  }

  return <main className="workspace-page"><Navbar />
    <section className="workspace-hero shell"><div><p className="eyebrow">DISCOVER YOUR NEXT STOP</p><h1>City search</h1><p>Search destinations and save the places you want to return to.</p></div></section>
    <section className="workspace-controls shell"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a city, country, or region..." /><select value={filter} onChange={(event) => setFilter(event.target.value as DestinationFilter)}><option value="all">All destinations</option><option value="popular">Popular</option><option value="highly-rated">Highly rated</option></select><select value={sort} onChange={(event) => setSort(event.target.value as DestinationSort)}><option value="popular">Popular first</option><option value="rating">Highest rated</option><option value="name">Name A–Z</option></select></section>
    {notice && <p className="shell page-notice" role="status">{notice}</p>}
    <section className="workspace-grid shell" aria-live="polite">
      {loading ? <Loading label="Searching destinations..." /> : error ? <div className="page-status page-error">{error}</div> : cities.length === 0 ? <div className="page-status">No cities match your search.</div> : cities.map((city) => <article className="destination-workspace-card" key={city.id}>
        <img src={city.imageUrl ?? "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=700&q=85"} alt="" />
        <div><p className="eyebrow"><MapPin size={12} /> {city.country}{city.region ? ` · ${city.region}` : ""}</p><h2>{city.name}</h2><p>{city.description || "Explore this memorable destination."}</p><p className="rating">{city.rating?.toFixed(1) ?? "—"} <Star size={13} fill="currentColor" /></p><div className="card-actions"><a href={`#cities/${city.id}`}>Details</a><button type="button" onClick={() => void save(city)}><Heart size={14} /> Save</button></div></div>
      </article>)}</section>
  </main>;
}
