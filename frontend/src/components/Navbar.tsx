import { Menu, Plane, X } from "lucide-react";
import { useState } from "react";
import { getAuthToken } from "../services/apiClient";
import { logout } from "../services/authApi";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const signedIn = Boolean(getAuthToken());

  function close() {
    setOpen(false);
  }

  return (
    <header className="workspace-header">
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="#dashboard" onClick={close}>
          <Plane size={20} fill="currentColor" />
          <span>GlobeTrotter<small>travel beyond</small></span>
        </a>
        <div className={open ? "nav-links open" : "nav-links"}>
          <a href="#dashboard" onClick={close}>Dashboard</a>
          <a href="#trips" onClick={close}>My trips</a>
          <a href="#cities" onClick={close}>Cities</a>
          <a href="#activities" onClick={close}>Activities</a>
          <a href="#calendar" onClick={close}>Calendar</a>
          {signedIn ? <a href="#profile" onClick={close}>Profile</a> : <a href="#login" onClick={close}>Log in</a>}
        </div>
        <div className="nav-actions">
          {signedIn ? (
            <button
              className="contact"
              type="button"
              onClick={() => {
                logout();
                close();
                window.location.hash = "#dashboard";
              }}
            >
              Log out
            </button>
          ) : (
            <a className="contact nav-contact-link" href="#login" onClick={close}>Log in</a>
          )}
          <button className="menu" type="button" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
    </header>
  );
}
