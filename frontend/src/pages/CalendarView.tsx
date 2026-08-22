import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  List,
  Menu,
  Plane,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { mockTrips } from "../data/mockTrips";
import type { Trip } from "../types";
import "./CalendarView.css";

type CalendarMode = "calendar" | "timeline";
type TripFilter = "all" | "upcoming" | "completed";
type TripGroup = "none" | "destination";
type TripSort = "start" | "name" | "duration";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function getMonthWeeks(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = addDays(firstDay, -firstDay.getDay());

  return Array.from({ length: 6 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => addDays(gridStart, weekIndex * 7 + dayIndex)),
  );
}

function numberOfDays(trip: Trip) {
  return Math.round((parseDate(trip.endDate).getTime() - parseDate(trip.startDate).getTime()) / 86_400_000) + 1;
}

function getTripSegments(trips: Trip[], week: Date[]) {
  const weekStart = toDateKey(week[0]);
  const weekEnd = toDateKey(week[6]);
  const occupiedRows: boolean[][] = [];

  return trips
    .filter((trip) => trip.startDate <= weekEnd && trip.endDate >= weekStart)
    .map((trip) => {
      const segmentStart = trip.startDate > weekStart ? trip.startDate : weekStart;
      const segmentEnd = trip.endDate < weekEnd ? trip.endDate : weekEnd;
      const startIndex = week.findIndex((day) => toDateKey(day) === segmentStart);
      const endIndex = week.findIndex((day) => toDateKey(day) === segmentEnd);
      let row = 0;

      while (
        occupiedRows[row]?.slice(startIndex, endIndex + 1).some(Boolean)
      ) {
        row += 1;
      }

      if (!occupiedRows[row]) occupiedRows[row] = Array(7).fill(false);
      occupiedRows[row].fill(true, startIndex, endIndex + 1);

      return { trip, startIndex, endIndex, row };
    });
}

function formatTripDates(trip: Trip) {
  const start = parseDate(trip.startDate);
  const end = parseDate(trip.endDate);
  const monthFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

  return `${monthFormat.format(start)} – ${monthFormat.format(end)}`;
}

function CalendarView() {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [mode, setMode] = useState<CalendarMode>("calendar");
  const [searchTerm, setSearchTerm] = useState("");
  const [groupBy, setGroupBy] = useState<TripGroup>("none");
  const [filter, setFilter] = useState<TripFilter>("all");
  const [sortBy, setSortBy] = useState<TripSort>("start");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const todayKey = toDateKey(new Date());
  const weeks = useMemo(() => getMonthWeeks(month), [month]);
  const selectedMonthLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(month);

  const trips = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredTrips = mockTrips.filter((trip) => {
      const matchesSearch =
        !normalizedSearch ||
        [trip.name, trip.destination, ...(trip.stops ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      const isUpcoming = trip.endDate >= todayKey;
      const matchesFilter =
        filter === "all" || (filter === "upcoming" ? isUpcoming : !isUpcoming);

      return matchesSearch && matchesFilter;
    });

    return filteredTrips.sort((firstTrip, secondTrip) => {
      if (sortBy === "name") return firstTrip.name.localeCompare(secondTrip.name);
      if (sortBy === "duration") return numberOfDays(secondTrip) - numberOfDays(firstTrip);
      if (groupBy === "destination") {
        return firstTrip.destination.localeCompare(secondTrip.destination);
      }
      return firstTrip.startDate.localeCompare(secondTrip.startDate);
    });
  }, [filter, groupBy, searchTerm, sortBy, todayKey]);

  const tripsInSelectedMonth = trips.filter((trip) => {
    const firstMonthDay = toDateKey(month);
    const lastMonthDay = toDateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0));
    return trip.startDate <= lastMonthDay && trip.endDate >= firstMonthDay;
  });

  function changeMonth(amount: number) {
    setMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + amount, 1));
  }

  function navigateToToday() {
    const today = new Date();
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  const groupedTimelineTrips = tripsInSelectedMonth.reduce<Record<string, Trip[]>>((groups, trip) => {
    const groupName = groupBy === "destination" ? trip.destination : "Your trips";
    (groups[groupName] ??= []).push(trip);
    return groups;
  }, {});

  return (
    <main className="calendar-page">
      <header className="calendar-header">
        <nav className="nav shell" aria-label="Main navigation">
          <a className="brand" href="#top" onClick={() => setMenuOpen(false)}>
            <Plane size={20} fill="currentColor" />
            <span>
              GlobeTrotter<small>travel beyond</small>
            </span>
          </a>
          <div className={menuOpen ? "nav-links open" : "nav-links"}>
            <a href="#destinations" onClick={() => setMenuOpen(false)}>Destinations</a>
            <a href="#benefits" onClick={() => setMenuOpen(false)}>Experiences</a>
            <a href="#benefits" onClick={() => setMenuOpen(false)}>Hotels</a>
            <a href="#destinations" onClick={() => setMenuOpen(false)}>Tours</a>
            <a className="calendar-nav-link" href="#calendar" onClick={() => setMenuOpen(false)}>
              Calendar
            </a>
            <a href="#deals" onClick={() => setMenuOpen(false)}>Deals</a>
            <a href="#about-us" onClick={() => setMenuOpen(false)}>About Us</a>
          </div>
          <div className="nav-actions">
            <button className="contact" type="button" onClick={() => setContactOpen(true)}>
              Contact Us
            </button>
            <button
              className="menu"
              type="button"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((isOpen) => !isOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
      </header>

      <section className="calendar-hero shell">
        <div>
          <p className="eyebrow">PLAN WITH CLARITY</p>
          <h1>Calendar View</h1>
          <p>Keep every city, stay, and experience in one beautiful travel timeline.</p>
        </div>
        <div className="calendar-mode-toggle" role="group" aria-label="Choose calendar display">
          <button
            className={mode === "calendar" ? "active" : ""}
            type="button"
            onClick={() => setMode("calendar")}
          >
            <CalendarDays size={15} /> Calendar
          </button>
          <button
            className={mode === "timeline" ? "active" : ""}
            type="button"
            onClick={() => setMode("timeline")}
          >
            <List size={15} /> Timeline
          </button>
        </div>
      </section>

      <section className="calendar-toolbar shell" aria-label="Trip search and controls">
        <label className="destination-search">
          <Search size={16} />
          <input
            aria-label="Search trips"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search trips, cities, or stops..."
          />
        </label>
        <select
          className="filter-button filter-select"
          aria-label="Group trips"
          value={groupBy}
          onChange={(event) => setGroupBy(event.target.value as TripGroup)}
        >
          <option value="none">Group by</option>
          <option value="destination">Destination</option>
        </select>
        <select
          className="filter-button filter-select"
          aria-label="Filter trips"
          value={filter}
          onChange={(event) => setFilter(event.target.value as TripFilter)}
        >
          <option value="all">Filter: All trips</option>
          <option value="upcoming">Upcoming trips</option>
          <option value="completed">Completed trips</option>
        </select>
        <select
          className="filter-button filter-select"
          aria-label="Sort trips"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as TripSort)}
        >
          <option value="start">Sort by: Start date</option>
          <option value="name">Sort by: Name</option>
          <option value="duration">Sort by: Duration</option>
        </select>
      </section>

      <section className="calendar-workspace shell" aria-live="polite">
        <div className="calendar-month-bar">
          <div>
            <p className="eyebrow">YOUR TRAVEL SCHEDULE</p>
            <h2>{selectedMonthLabel}</h2>
          </div>
          <div className="month-actions">
            <button className="today-button" type="button" onClick={navigateToToday}>Today</button>
            <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)}>
              <ChevronLeft size={18} />
            </button>
            <button type="button" aria-label="Next month" onClick={() => changeMonth(1)}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {mode === "calendar" ? (
          <div className="calendar-frame" aria-label={`${selectedMonthLabel} calendar`}>
            <div className="calendar-weekdays">
              {weekDays.map((weekDay) => <span key={weekDay}>{weekDay}</span>)}
            </div>
            <div className="calendar-weeks">
              {weeks.map((week, weekIndex) => {
                const segments = getTripSegments(trips, week);
                return (
                  <div className="calendar-week" key={toDateKey(week[0])}>
                    {week.map((day) => {
                      const dateKey = toDateKey(day);
                      const isCurrentMonth = day.getMonth() === month.getMonth();
                      const isToday = dateKey === todayKey;
                      return (
                        <div
                          className={`calendar-day${isCurrentMonth ? "" : " outside-month"}${isToday ? " today" : ""}`}
                          key={dateKey}
                        >
                          <time dateTime={dateKey}>{day.getDate()}</time>
                        </div>
                      );
                    })}
                    {segments.map(({ trip, startIndex, endIndex, row }) => (
                      <button
                        className={`trip-event trip-event-${trip.accent ?? "sage"}`}
                        key={`${trip.id}-${weekIndex}`}
                        type="button"
                        style={{ gridColumn: `${startIndex + 1} / ${endIndex + 2}`, gridRow: row + 2 }}
                        onClick={() => setSelectedTrip(trip)}
                        title={`${trip.name}: ${formatTripDates(trip)}`}
                      >
                        <span>{trip.name}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
            {tripsInSelectedMonth.length === 0 && (
              <div className="calendar-empty">No trips match these controls for {selectedMonthLabel}.</div>
            )}
          </div>
        ) : (
          <div className="timeline-view">
            {Object.entries(groupedTimelineTrips).map(([groupName, groupedTrips]) => (
              <section className="timeline-group" key={groupName}>
                <h3>{groupName}</h3>
                {groupedTrips.map((trip) => (
                  <button className="timeline-card" type="button" key={trip.id} onClick={() => setSelectedTrip(trip)}>
                    <span className={`timeline-accent trip-event-${trip.accent ?? "sage"}`} />
                    <div>
                      <p>{formatTripDates(trip)} · {numberOfDays(trip)} days</p>
                      <h4>{trip.name}</h4>
                      <span>{trip.destination}</span>
                    </div>
                    <ChevronRight size={18} />
                  </button>
                ))}
              </section>
            ))}
            {tripsInSelectedMonth.length === 0 && (
              <div className="timeline-empty">No trips match these controls for {selectedMonthLabel}.</div>
            )}
          </div>
        )}
      </section>

      <section className="calendar-note shell">
        <div>
          <span>✦</span>
          <p><b>Travel, beautifully organised</b><small>Your trips are shown across every day they span. Select one to see the itinerary details.</small></p>
        </div>
      </section>

      <button className="chat" type="button" aria-label="Chat with us" onClick={() => setContactOpen(true)}>
        <CircleUserRound />
      </button>

      {selectedTrip && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedTrip(null);
        }}>
          <section className="modal calendar-trip-modal" role="dialog" aria-modal="true" aria-label={`${selectedTrip.name} details`}>
            <button className="modal-close" type="button" aria-label="Close trip details" onClick={() => setSelectedTrip(null)}>
              <X size={18} />
            </button>
            <p className="eyebrow">TRIP DETAILS</p>
            <p className="modal-title">{selectedTrip.name}</p>
            <p className="calendar-trip-dates">{formatTripDates(selectedTrip)} · {numberOfDays(selectedTrip)} days</p>
            <p className="modal-location">{selectedTrip.destination}</p>
            <p>{selectedTrip.description}</p>
            {selectedTrip.stops && (
              <div className="trip-stops">
                <b>Stops</b>
                <span>{selectedTrip.stops.join(" · ")}</span>
              </div>
            )}
          </section>
        </div>
      )}

      {contactOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setContactOpen(false);
        }}>
          <section className="modal contact-modal" role="dialog" aria-modal="true" aria-label="Contact GlobeTrotter">
            <button className="modal-close" type="button" aria-label="Close contact form" onClick={() => setContactOpen(false)}>
              <X size={18} />
            </button>
            <p className="eyebrow">WE'D LOVE TO HELP</p>
            <p className="modal-title">Contact Us</p>
            <p>Tell us where you want to go, and our travel team will help you plan the next step.</p>
            <a className="dark-button modal-contact-link" href="mailto:hello@globetrotter.travel">
              Email our travel team <ChevronRight size={15} />
            </a>
          </section>
        </div>
      )}
    </main>
  );
}

export default CalendarView;
