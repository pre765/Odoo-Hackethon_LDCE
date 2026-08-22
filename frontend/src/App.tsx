import {
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Headphones,
  MapPin,
  Menu,
  Plane,
  Search,
  Star,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const places = [
  {
    name: "Santorini",
    country: "Greece",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=700&q=85",
    text: "A whitewashed dream in the Aegean Sea.",
  },
  {
    name: "Bali",
    country: "Indonesia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=700&q=85",
    text: "Lush, peaceful, and full of wonder.",
  },
  {
    name: "Swiss Alps",
    country: "Switzerland",
    image:
      "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=700&q=85",
    text: "Snow-capped peaks and mountain railways.",
  },
  {
    name: "Maldives",
    country: "Maldives",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=700&q=85",
    text: "Turquoise lagoons made for slowing down.",
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searched, setSearched] = useState(false);

  return (
    <main>
      <section className="hero">
        <nav className="nav shell">
          <a className="brand" href="#top">
            <Plane size={20} fill="currentColor" />
            <span>
              GlobeTrotter<small>travel beyond</small>
            </span>
          </a>
          <div className={menuOpen ? "nav-links open" : "nav-links"}>
            {[
              "Destinations",
              "Experiences",
              "Hotels",
              "Tours",
              "Deals",
              "About Us",
            ].map((link) => (
              <a href={"#" + link.toLowerCase().replace(" ", "-")} key={link}>
                {link}
              </a>
            ))}
          </div>
          <div className="nav-actions">
            <button className="contact">Contact Us</button>
            <button
              className="menu"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen(!menuOpen)}
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
            Discover breathtaking destinations, unforgettable experiences that
            last a lifetime.
          </p>
          <a className="dark-button" href="#destinations">
            Explore Now{" "}
            <span>
              <ChevronRight size={15} />
            </span>
          </a>
        </div>
        <p className="photo-credit">Hallstatt, Austria</p>
      </section>

      <section className="booking shell" aria-label="Travel search">
        <label className="destination-search">
          <Search size={16} />
          <input placeholder="Search destinations..." />
        </label>
        <button className="filter-button">
          Group by <ChevronRight size={13} />
        </button>
        <button className="filter-button">Filter</button>
        <button className="filter-button">
          Sort by <ChevronRight size={13} />
        </button>
        {searched && (
          <p className="search-message">
            Choose a destination to begin your journey.
          </p>
        )}
      </section>

      <section className="benefits shell">
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

      <section id="destinations" className="destinations shell">
        <div className="section-title">
          <div>
            <p className="eyebrow">EXPLORE THE BEST</p>
            <h2>Popular Destinations</h2>
          </div>
          <a href="#all">
            View all destinations <ChevronRight size={15} />
          </a>
        </div>
        <div className="cards">
          {places.map((place, index) => (
            <article
              className="place-card"
              key={place.name}
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(6,23,22,.88), rgba(6,23,22,0) 66%), url(${place.image})`,
              }}
            >
              <span className="badge">
                <MapPin size={11} /> {place.country}
              </span>
              <div>
                <h3>{place.name}</h3>
                <p>{place.text}</p>
                <b>
                  4.{9 - index} <Star size={12} fill="currentColor" />
                </b>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="offer shell">
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

      <footer className="shell">
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
            <a href="#experiences">Experiences</a>
            <a href="#hotels">Hotels</a>
            <a href="#tours">Tours</a>
          </div>
          <div>
            <b>Support</b>
            <a href="#faqs">FAQs</a>
            <a href="#policy">Privacy Policy</a>
            <a href="#contact">Terms & Conditions</a>
            <a href="#contact">Contact Us</a>
          </div>
          <div>
            <b>Newsletter</b>
            <p>
              Subscribe to get exclusive travel
              <br />
              deals and updates.
            </p>
            <div className="email">
              <input
                aria-label="Email address"
                placeholder="Enter your email"
              />
              <button>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
        <div className="copyright">
          © 2025 GlobeTrotter. All rights reserved.
        </div>
      </footer>
      <button className="chat" aria-label="Chat with us">
        <CircleUserRound />
      </button>
      <a className="plan-trip" href="/new-trip.html">
        +&nbsp; Plan a trip
      </a>
    </main>
  );
}

export default App;
