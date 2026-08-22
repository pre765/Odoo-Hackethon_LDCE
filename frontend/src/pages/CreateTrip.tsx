import { FormEvent, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getDestinations } from "../services/cityApi";
import { createTrip } from "../services/tripApi";
import type { Destination } from "../types";

export default function CreateTrip() {
  const [cities, setCities] = useState<Destination[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getDestinations({ all: true, sort: "name" })
      .then(setCities)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load destinations."));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const startDate = String(form.get("startDate"));
    const endDate = String(form.get("endDate"));
    if (endDate < startDate) {
      setError("End date must be on or after the start date.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const trip = await createTrip({
        name: String(form.get("name") ?? ""),
        description: String(form.get("description") ?? "") || null,
        startDate,
        endDate,
        totalBudget: form.get("totalBudget") ? Number(form.get("totalBudget")) : null,
        stops: selectedCity ? [{ cityId: Number(selectedCity), startDate, endDate }] : [],
      });
      window.location.hash = `#trips/${trip.id}/edit`;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create this trip.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="workspace-page">
      <Navbar />
      <section className="workspace-hero shell"><div><p className="eyebrow">CREATE A NEW ADVENTURE</p><h1>Plan a new trip</h1><p>Start with the essentials, then shape every stop and experience.</p></div></section>
      <form className="workspace-form shell" onSubmit={submit}>
        <label>Trip name<input name="name" required maxLength={160} placeholder="e.g. A slow week in Japan" /></label>
        <label>Description<textarea name="description" maxLength={1000} placeholder="What do you want this journey to feel like?" /></label>
        <div className="form-row"><label>Start date<input name="startDate" type="date" required /></label><label>End date<input name="endDate" type="date" required /></label></div>
        <label>First destination (optional)<select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}><option value="">Choose a destination</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.name}, {city.country}</option>)}</select></label>
        <label>Trip budget (optional)<input name="totalBudget" type="number" min="0" step="0.01" placeholder="0.00" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><a href="#trips">Cancel</a><button className="workspace-primary" disabled={saving}>{saving ? "Creating..." : "Create trip"}</button></div>
      </form>
    </main>
  );
}
