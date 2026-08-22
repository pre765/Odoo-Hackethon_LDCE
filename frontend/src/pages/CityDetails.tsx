import { ArrowLeft, Heart, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import { getDestination } from "../services/cityApi";
import { saveDestination } from "../services/authApi";
import type { Destination } from "../types";

export default function CityDetails({ cityId }: { cityId: string }) {
  const [city, setCity] = useState<Destination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    void getDestination(cityId).then(setCity).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load this city."));
  }, [cityId]);
  return <main className="workspace-page"><Navbar /><section className="shell workspace-detail">
    <a className="back-link" href="#cities"><ArrowLeft size={15} /> Back to cities</a>
    {error ? <div className="page-status page-error">{error}</div> : !city ? <Loading label="Loading destination..." /> : <article className="city-detail-card">
      <img src={city.imageUrl ?? "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=85"} alt="" />
      <div><p className="eyebrow"><MapPin size={13} /> {city.country}{city.region ? ` · ${city.region}` : ""}</p><h1>{city.name}</h1><p>{city.description || "A destination ready for your own story."}</p><p className="rating">{city.rating?.toFixed(1) ?? "—"} <Star size={14} fill="currentColor" /></p><div className="form-actions"><button className="workspace-primary" onClick={() => void saveDestination(city.id).then(() => setNotice("Saved to your profile.")).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Sign in to save this destination."))}><Heart size={15} /> Save destination</button><a href={`#activities?cityId=${city.id}`}>Explore activities</a></div>{notice && <p className="page-notice">{notice}</p>}</div>
    </article>}
  </section></main>;
}
