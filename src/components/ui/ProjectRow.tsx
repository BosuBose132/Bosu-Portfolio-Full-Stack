import type { Project } from "../../data/portfolioData";

interface ProjectRowProps {
  project: Project;
  active: boolean;
  onSelect: (id: string) => void;
}

/** A selectable row in the numbered project directory. */
export function ProjectRow({ project, active, onSelect }: ProjectRowProps) {
  return (
    <li>
      <button
        type="button"
        className={`prow ${active ? "prow--active" : ""}`}
        onClick={() => onSelect(project.id)}
        aria-pressed={active}
      >
        <span className="prow__index">{project.index}</span>
        <span className="prow__main">
          <span className="prow__name">
            {project.name}
            {project.flagship && <span className="prow__flag">★</span>}
          </span>
          <span className="prow__tagline">{project.tagline}</span>
        </span>
        <span className="prow__chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </li>
  );
}
