import type { EducationEntry } from "../../data/portfolioData";
import { Reveal } from "./Reveal";

function GradIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M12 4 2 9l10 5 10-5-10-5Z" strokeLinejoin="round" />
      <path d="M6 11v4c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-4" />
      <path d="M22 9v5" strokeLinecap="round" />
    </svg>
  );
}

interface EducationItemProps {
  entry: EducationEntry;
  index: number;
}

export function EducationItem({ entry, index }: EducationItemProps) {
  return (
    <Reveal as="article" className="edu-card" delay={index * 0.08} y={22}>
      <div className="edu-card__node" aria-hidden="true">
        <GradIcon />
      </div>

      <span className="edu-card__period">{entry.period}</span>
      <h3 className="edu-card__degree">{entry.degree}</h3>
      <p className="edu-card__school">
        {entry.school}
        <span className="edu-card__location"> · {entry.location}</span>
      </p>
      <p className="edu-card__desc">{entry.description}</p>

      <div className="edu-card__coursework">
        <p className="edu-card__coursework-label">Relevant coursework</p>
        <ul className="edu-card__coursework-list">
          {entry.coursework.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
