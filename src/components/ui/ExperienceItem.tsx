import type { ExperienceEntry } from "../../data/portfolioData";
import { TechTag } from "./TechTag";
import { Reveal } from "./Reveal";

/* First tech tag per entry gets a cyan highlight; the rest stay neutral */
const HIGHLIGHT_TECH: Record<string, string> = {
  ocg: "React",
  mie: "JavaScript",
  virtusa: "Java",
};

interface ExperienceItemProps {
  entry: ExperienceEntry;
  side: "left" | "right";
  index: number;
}

export function ExperienceItem({ entry, side, index }: ExperienceItemProps) {
  const startYear = entry.start.split(" ").pop();

  return (
    <li className={`xp-item xp-item--${side}`}>
      {/* Orbital node on the central trajectory line */}
      <span className="xp-item__node" aria-hidden="true">
        <span className="xp-item__node-ring" />
        <span className="xp-item__node-core" />
      </span>
      <span className="xp-item__year" aria-hidden="true">{startYear}</span>

      <Reveal as="article" className="xp-card" y={24} delay={index * 0.05}>
        <div className="xp-card__head">
          <span className="xp-card__monogram" aria-hidden="true">{entry.monogram}</span>
          <div className="xp-card__heading">
            <p className="xp-card__company">{entry.company}</p>
            <h3 className="xp-card__role">{entry.role}</h3>
          </div>
        </div>

        <div className="xp-card__meta">
          <span className="xp-card__period">{entry.period}</span>
          <span className="xp-card__dot" aria-hidden="true" />
          <span className="xp-card__location">{entry.location}</span>
        </div>

        <p className="xp-card__summary">{entry.summary}</p>

        <ul className="xp-card__bullets">
          {entry.bullets.map((b, i) => (
            <li key={i}>
              <span className="xp-card__bullet-mark" aria-hidden="true" />
              {b}
            </li>
          ))}
        </ul>

        <div className="xp-card__tags">
          {entry.tech.map((t) => (
            <TechTag key={t} label={t} accent={HIGHLIGHT_TECH[entry.id] === t ? "cyan" : "neutral"} />
          ))}
        </div>

        <div className="xp-card__metrics">
          {entry.metrics.map((m) => (
            <span key={m.label} className="xp-card__metric">
              <span className="xp-card__metric-value">{m.value}</span>
              <span className="xp-card__metric-label">{m.label}</span>
            </span>
          ))}
        </div>
      </Reveal>
    </li>
  );
}
