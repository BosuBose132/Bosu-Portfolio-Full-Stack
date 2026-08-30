import { useEffect, useState } from "react";
import { navItems, profile } from "../../data/portfolioData";
import { useScrollSpy } from "../../hooks/useScrollSpy";
import { StatusBadge } from "../ui/StatusBadge";
import "./Navbar.css";

const sectionIds = navItems.map((n) => n.id);

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeId = useScrollSpy(sectionIds);

  /* Elevate the bar once the user scrolls past the hero fold */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Lock body scroll + allow Esc to close the mobile menu */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <nav className="navbar__inner" aria-label="Primary">
        <a href="#home" className="navbar__brand" onClick={close}>
          <span className="navbar__logo" aria-hidden="true">
            <span className="navbar__logo-bracket navbar__logo-bracket--amber">
              &lt;
            </span>
            <span className="navbar__logo-slash">/</span>
            <span className="navbar__logo-bracket navbar__logo-bracket--cyan">
              &gt;
            </span>
          </span>
          <span className="navbar__brand-name">{profile.brand}</span>
          {profile.openToWork && (
            <span className="navbar__brand-badge">
              <StatusBadge />
            </span>
          )}
        </a>

        <ul className="navbar__links" id="primary-menu">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`navbar__link ${
                  activeId === item.id ? "navbar__link--active" : ""
                }`}
                aria-current={activeId === item.id ? "true" : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a href={profile.resumeUrl} download className="navbar__resume">
              Resume
            </a>
          </li>
        </ul>

        <button
          type="button"
          className={`navbar__toggle ${menuOpen ? "navbar__toggle--open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`navbar__mobile ${menuOpen ? "navbar__mobile--open" : ""}`}
        hidden={!menuOpen}
      >
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={close}
                className={activeId === item.id ? "is-active" : ""}
                aria-current={activeId === item.id ? "true" : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a href={profile.resumeUrl} download onClick={close} className="navbar__mobile-resume">
              Download Resume
            </a>
          </li>
        </ul>
      </div>

      {menuOpen && (
        <button
          className="navbar__scrim"
          aria-label="Close menu"
          onClick={close}
        />
      )}
    </header>
  );
}
