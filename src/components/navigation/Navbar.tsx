import { useEffect, useState, type ReactNode } from "react";
import { navItems, profile } from "../../data/portfolioData";
import { useScrollSpy } from "../../hooks/useScrollSpy";
import { StatusBadge } from "../ui/StatusBadge";
import "./Navbar.css";

const sectionIds = navItems.map((n) => n.id);

const dockIconNames = {
  home: "home",
  about: "user",
  experience: "briefcase",
  skills: "terminal",
  education: "graduation",
  projects: "layers",
  contact: "mail",
} as const;

type DockIconName = (typeof dockIconNames)[keyof typeof dockIconNames];

const compactLabels: Record<keyof typeof dockIconNames, string> = {
  home: "Home",
  about: "About",
  experience: "Work",
  skills: "Skills",
  education: "Learn",
  projects: "Projects",
  contact: "Contact",
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const activeId = useScrollSpy(sectionIds);

  /* Elevate the bar once the user scrolls past the hero fold */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <nav className="navbar__inner" aria-label="Primary">
        <a href="#home" className="navbar__brand">
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

        <a href={profile.resumeUrl} download className="navbar__resume">
          <span>Resume</span>
          <span aria-hidden="true">↗</span>
        </a>
      </nav>

      <nav className="nav-dock" aria-label="Section navigation">
        <ul className="nav-dock__list">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`nav-dock__item ${activeId === item.id ? "nav-dock__item--active" : ""}`}
                aria-current={activeId === item.id ? "true" : undefined}
              >
                <NavDockIcon name={dockIconNames[item.id as keyof typeof dockIconNames]} />
                <span className="nav-dock__label nav-dock__label--full">{item.label}</span>
                <span className="nav-dock__label nav-dock__label--compact">{compactLabels[item.id as keyof typeof dockIconNames]}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function NavDockIcon({ name }: { name: DockIconName }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<DockIconName, ReactNode> = {
    home: <><path {...common} d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" /><path {...common} d="M9 21v-6h6v6" /></>,
    user: <><circle {...common} cx="12" cy="8" r="3.5" /><path {...common} d="M4.5 21c.7-4 3.2-6 7.5-6s6.8 2 7.5 6" /></>,
    briefcase: <><rect {...common} x="3" y="7" width="18" height="13" rx="2" /><path {...common} d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12h18M10 12v2h4v-2" /></>,
    terminal: <><rect {...common} x="3" y="4" width="18" height="16" rx="2" /><path {...common} d="m7 9 3 3-3 3M13 15h4" /></>,
    graduation: <><path {...common} d="m3 9 9-5 9 5-9 5-9-5Z" /><path {...common} d="M7 12v4c2.7 2 7.3 2 10 0v-4M21 9v6" /></>,
    layers: <><path {...common} d="m12 3 9 5-9 5-9-5 9-5Z" /><path {...common} d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    mail: <><rect {...common} x="3" y="5" width="18" height="14" rx="2" /><path {...common} d="m3 7 9 6 9-6" /></>,
  };
  return <svg className="nav-dock__icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}
