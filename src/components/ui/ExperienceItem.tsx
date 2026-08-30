import type { ExperienceEntry } from "../../data/portfolioData";
import { TechTag } from "./TechTag";
import { Reveal } from "./Reveal";

/* Company icons keyed by the entry's icon field */
function CompanyIcon({ icon }: { icon: ExperienceEntry["icon"] }) {
  if (icon === "hospital") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M4 21V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14" />
        <path d="M2 21h20" strokeLinecap="round" />
        <path d="M12 8v6m-3-3h6" strokeLinecap="round" />
        <path d="M9 21v-3h6v3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M3 21V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v15" />
      <path d="M15 21V10h4a2 2 0 0 1 2 2v9" />
      <path d="M2 21h20" strokeLinecap="round" />
      <path d="M6.5 8h3m-3 3.5h3m-3 3.5h3" strokeLinecap="round" />
    </svg>
  );
}

interface ExperienceItemProps {
  entry: ExperienceEntry;
  side: "left" | "right";
  index: number;
}

export function ExperienceItem({ entry, side, index }: ExperienceItemProps) {
  return (
    <li className={`xp-item xp-item--${side}`}>
      {/* Node on the central pipeline */}
      <span className="xp-item__node" aria-hidden="true">
        <span className="xp-item__node-icon">
          <CompanyIcon icon={entry.icon} />
        </span>
      </span>

      <Reveal
        as="article"
        className="xp-card"
        y={24}
        delay={index * 0.05}
      >
        <div className="xp-card__head">
          <div>
            <h3 className="xp-card__role">{entry.role}</h3>
            <p className="xp-card__company">{entry.company}</p>
          </div>
          <span className="xp-card__period">{entry.period}</span>
        </div>

        <p className="xp-card__location">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {entry.location}
        </p>

        <p className="xp-card__summary">{entry.summary}</p>

        <ul className="xp-card__bullets">
          {entry.bullets.map((b, i) => (
            <li key={i}>
              <span className="xp-card__bullet-mark" aria-hidden="true" />
              {b}
            </li>
          ))}
        </ul>

        <div className="xp-card__metrics">
          {entry.metrics.map((m) => (
            <div key={m.label} className="xp-card__metric">
              <span className="xp-card__metric-value">{m.value}</span>
              <span className="xp-card__metric-label">{m.label}</span>
            </div>
          ))}
        </div>

        <div className="xp-card__tags">
          {entry.tech.map((t) => (
            <TechTag key={t} label={t} />
          ))}
        </div>
      </Reveal>
    </li>
  );
}
