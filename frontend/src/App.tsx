import {
  ChevronRight,
  CircleUserRound,
  Headphones,
  MapPin,
  Menu,
  Plane,
  Search,
  Star,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import CalendarView from "./pages/CalendarView";
import { getDestinations } from "./services/cityApi";
import type {
  Destination,
  DestinationFilter,
  DestinationGroup,
  DestinationSort,
} from "./types";

const navigationLinks = [
  { label: "Destinations", target: "destinations" },
  { label: "Experiences", target: "benefits" },
  { label: "Hotels", target: "benefits" },
  { label: "Tours", target: "destinations" },
  { label: "Calendar", target: "calendar" },
  { label: "Deals", target: "deals" },
  { label: "About Us", target: "about-us" },
];

const fallbackImages: Record<string, string> = {
  Santorini:
    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=700&q=85",
  Bali:
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=700&q=85",
  "Swiss Alps":
    "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=700&q=85",
  Maldives:
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=700&q=85",
};

const defaultDestinationImage =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=700&q=85";

function destinationImage(destination: Destination) {
  return destination.imageUrl ?? fallbackImages[destination.name] ?? defaultDestinationImage;
}

function App() {
  const [isCalendarPage, setIsCalendarPage] = useState(() => window.location.hash === "#calendar");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupBy, setGroupBy] = useState<DestinationGroup>("none");
  const [filter, setFilter] = useState<DestinationFilter>("all");
  const [sort, setSort] = useState<DestinationSort>("popular");
  const [showAll, setShowAll] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const hasActiveQuery = Boolean(
    searchTerm.trim() || groupBy !== "none" || filter !== "all" || sort !== "popular",
  );
  const resultLimit = hasActiveQuery ? 48 : 4;

  useEffect(() => {
    function syncPageWithHash() {
      setIsCalendarPage(window.location.hash === "#calendar");
    }

    window.addEventListener("hashchange", syncPageWithHash);
    return () => window.removeEventListener("hashchange", syncPageWithHash);
  }, []);

  useEffect(() => {
    if (isCalendarPage) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setError(null);

      void getDestinations(
        {
          q: searchTerm.trim() || undefined,
          filter,
          sort,
          groupBy: groupBy === "none" ? undefined : groupBy,
          all: showAll,
          limit: showAll ? undefined : resultLimit,
        },
        controller.signal,
      )
        .then(setDestinations)
        .catch((requestError: unknown) => {
          if (requestError instanceof DOMException && requestError.name === "AbortError") {
            return;
          }
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load destinations. Please try again.",
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [filter, groupBy, isCalendarPage, reloadKey, resultLimit, searchTerm, showAll, sort]);

  function scrollToDestinations() {
    document
      .getElementById("destinations")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showAllDestinations() {
    setShowAll(true);
    scrollToDestinations();
  }

  if (isCalendarPage) {
    return <CalendarView />;
  }

  return (
    <main>
      <section className="hero">
        <nav className="nav shell" aria-label="Main navigation">
          <a className="brand" href="#top" onClick={() => setMenuOpen(false)}>
            <Plane size={20} fill="currentColor" />
            <span>
              GlobeTrotter<small>travel beyond</small>
            </span>
          </a>
          <div className={menuOpen ? "nav-links open" : "nav-links"}>
            {navigationLinks.map((link) => (
              <a href={`#${link.target}`} key={link.label} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
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

        <div id="top" className="hero-copy shell">
          <p className="eyebrow">
            It's time to <span>✧</span>
          </p>
          <h1>
            Explore
            <br />
            the <em>World</em>
          </h1>
          <p className="intro">
            Discover breathtaking destinations, unforgettable experiences that last a lifetime.
          </p>
          <button className="dark-button" type="button" onClick={scrollToDestinations}>
            Explore Now{" "}
            <span>
              <ChevronRight size={15} />
            </span>
          </button>
        </div>
        <p className="photo-credit">Hallstatt, Austria</p>
      </section>

      <section className="booking shell" aria-label="Travel search">
        <label className="destination-search">
          <Search size={16} />
          <input
            aria-label="Search destinations"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search destinations..."
          />
        </label>
        <select
          className="filter-button filter-select"
          aria-label="Group destinations"
          value={groupBy}
          onChange={(event) => setGroupBy(event.target.value as DestinationGroup)}
        >
          <option value="none">Group by</option>
          <option value="country">Country</option>
          <option value="region">Region</option>
        </select>
        <select
          className="filter-button filter-select"
          aria-label="Filter destinations"
          value={filter}
          onChange={(event) => setFilter(event.target.value as DestinationFilter)}
        >
          <option value="all">Filter</option>
          <option value="popular">Popular</option>
          <option value="highly-rated">Highest rated</option>
        </select>
        <select
          className="filter-button filter-select"
          aria-label="Sort destinations"
          value={sort}
          onChange={(event) => setSort(event.target.value as DestinationSort)}
        >
          <option value="popular">Sort: Popular</option>
          <option value="rating">Sort: Highest Rated</option>
          <option value="name">Sort: Name A-Z</option>
        </select>
      </section>

      <section id="benefits" className="benefits shell">
        <div>
          <span>♜</span>
          <p>
            <b>Handpicked Hotels</b>
            <small>Stay at the finest places</small>
          </p>
        </div>
        <div>
          <span>♧</span>
          <p>
            <b>Expert Guides</b>
            <small>Local experts to guide your journey.</small>
          </p>
        </div>
        <div>
          <span>✺</span>
          <p>
            <b>Best Price Guarantee</b>
            <small>We match the best price.</small>
          </p>
        </div>
        <div>
          <Headphones />
          <p>
            <b>24/7 Support</b>
            <small>We're here for you anytime, anywhere.</small>
          </p>
        </div>
      </section>

      <section id="destinations" className="destinations shell" aria-live="polite">
        <div className="section-title">
          <div>
            <p className="eyebrow">EXPLORE THE BEST</p>
            <h2>{showAll || hasActiveQuery ? "Destinations" : "Popular Destinations"}</h2>
          </div>
          <button className="view-all" type="button" onClick={showAllDestinations}>
            {showAll ? "Showing all destinations" : "View all destinations"} <ChevronRight size={15} />
          </button>
        </div>
        <div className="cards">
          {isLoading ? (
            <div className="destination-status" role="status">
              Loading destinations...
            </div>
          ) : error ? (
            <div className="destination-status" role="alert">
              <p>{error}</p>
              <button
                type="button"
                className="status-action"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Try again
              </button>
            </div>
          ) : destinations.length === 0 ? (
            <div className="destination-status">
              No destinations match your search or filters.
            </div>
          ) : (
            destinations.map((destination) => (
              <article
                className="place-card"
                key={destination.id}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${destination.name}`}
                onClick={() => setSelectedDestination(destination)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedDestination(destination);
                  }
                }}
                style={{
                  backgroundImage: `linear-gradient(0deg, rgba(6,23,22,.88), rgba(6,23,22,0) 66%), url(${destinationImage(destination)})`,
                }}
              >
                <span className="badge">
                  <MapPin size={11} /> {destination.country}
                </span>
                <div>
                  <h3>{destination.name}</h3>
                  <p>{destination.description ?? "Discover a destination worth remembering."}</p>
                  <b>
                    {destination.rating === null ? "—" : destination.rating.toFixed(1)}{" "}
                    <Star size={12} fill="currentColor" />
                  </b>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section id="deals" className="offer shell">
        <div>
          <p className="eyebrow">Limited Time Offer</p>
          <h2>
            Get up to <em>30%</em> OFF
          </h2>
          <p>on your next adventure</p>
          <a className="light-button" href="#deals">
            Explore Deals <ChevronRight size={14} />
          </a>
        </div>
      </section>

      <section className="partners shell">
        <span>
          Trusted by thousands
          <br />
          of travelers worldwide
        </span>
        <b>Booking.com</b>
        <b>Expedia</b>
        <b>● Tripadvisor</b>
        <b>Skyscanner</b>
        <b className="airbnb">◇ airbnb</b>
      </section>

      <footer id="about-us" className="shell">
        <div className="footer-main">
          <div>
            <a className="brand footer-brand" href="#top">
              <Plane size={20} fill="currentColor" />
              <span>
                GlobeTrotter<small>travel beyond</small>
              </span>
            </a>
            <p>
              We help you discover the world
              <br />
              with unforgettable travel
              <br />
              experiences and exceptional service.
            </p>
            <div className="socials">f　◎　𝕏　▶</div>
          </div>
          <div>
            <b>Quick Links</b>
            <a href="#destinations">Destinations</a>
            <a href="#benefits">Experiences</a>
            <a href="#benefits">Hotels</a>
            <a href="#destinations">Tours</a>
          </div>
          <div>
            <b>Support</b>
            <a href="#about-us">FAQs</a>
            <a href="#about-us">Privacy Policy</a>
            <a href="#about-us">Terms & Conditions</a>
            <a
              href="#contact"
              onClick={(event) => {
                event.preventDefault();
                setContactOpen(true);
              }}
            >
              Contact Us
            </a>
          </div>
          <div>
            <b>Newsletter</b>
            <p>
              Subscribe to get exclusive travel
              <br />
              deals and updates.
            </p>
            <div className="email">
              <input aria-label="Email address" placeholder="Enter your email" />
              <button type="button" aria-label="Subscribe to newsletter">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
        <div className="copyright">© 2025 GlobeTrotter. All rights reserved.</div>
      </footer>
      <button
        className="chat"
        type="button"
        aria-label="Chat with us"
        onClick={() => setContactOpen(true)}
      >
        <CircleUserRound />
      </button>
      <a className="plan-trip" href="/new-trip.html">
        +&nbsp; Plan a trip
      </a>

      {selectedDestination && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedDestination(null);
          }}
        >
          <section className="modal" role="dialog" aria-modal="true" aria-label="Destination details">
            <button
              className="modal-close"
              type="button"
              aria-label="Close details"
              onClick={() => setSelectedDestination(null)}
            >
              <X size={18} />
            </button>
            <p className="eyebrow">DESTINATION DETAILS</p>
            <p className="modal-title">{selectedDestination.name}</p>
            <p className="modal-location">
              <MapPin size={14} /> {selectedDestination.country}
              {selectedDestination.region ? ` · ${selectedDestination.region}` : ""}
            </p>
            <p>{selectedDestination.description ?? "More details about this destination are coming soon."}</p>
            <p className="modal-rating">
              {selectedDestination.rating === null
                ? "Rating not available"
                : `${selectedDestination.rating.toFixed(1)} / 5`} {" "}
              <Star size={14} fill="currentColor" />
            </p>
          </section>
        </div>
      )}

      {contactOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setContactOpen(false);
          }}
        >
          <section className="modal contact-modal" role="dialog" aria-modal="true" aria-label="Contact GlobeTrotter">
            <button
              className="modal-close"
              type="button"
              aria-label="Close contact form"
              onClick={() => setContactOpen(false)}
            >
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

export default App;
