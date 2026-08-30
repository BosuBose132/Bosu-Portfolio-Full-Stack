import type { Project, ProjectLink } from "../../data/portfolioData";
import { TechTag } from "./TechTag";
import { ArchitectureFlow } from "./ArchitectureFlow";
import "./ProjectPreview.css";

const LINK_META: Record<
  ProjectLink["type"],
  { label: string; icon: JSX.Element }
> = {
  github: {
    label: "View Code",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z" />
      </svg>
    ),
  },
  demo: {
    label: "Live Demo",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M14 3h7v7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 3 11 13" strokeLinecap="round" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" />
      </svg>
    ),
  },
  caseStudy: {
    label: "Case Study",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path d="M14 3v6h6M9 13h6M9 17h6" strokeLinecap="round" />
      </svg>
    ),
  },
};

export function ProjectPreview({ project }: { project: Project }) {
  return (
    <div className="ppreview" aria-live="polite">
      {/* --- Media --- */}
      <div className="ppreview__media">
        {project.image ? (
          <img
            src={project.image}
            alt={`${project.name} — ${project.tagline}`}
            className="ppreview__img"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="ppreview__fallback" aria-hidden="true">
            <span className="ppreview__fallback-mono">{project.name.charAt(0)}</span>
            <span className="ppreview__fallback-tag">{project.tagline}</span>
          </div>
        )}
        {project.flagship && <span className="ppreview__flag">Flagship</span>}
      </div>

      {/* --- Body --- */}
      <div className="ppreview__body">
        <div className="ppreview__head">
          <div>
            <h3 className="ppreview__name">{project.name}</h3>
            <p className="ppreview__tagline">{project.tagline}</p>
          </div>
          <span className="ppreview__index">{project.index}</span>
        </div>

        <p className="ppreview__desc">{project.description}</p>

        <div className="ppreview__tags">
          {project.tech.map((t) => (
            <TechTag key={t} label={t} />
          ))}
        </div>

        {project.architecture && <ArchitectureFlow steps={project.architecture} />}

        <div className="ppreview__links">
          {project.links.map((link) => {
            const meta = LINK_META[link.type];
            return (
              <a
                key={link.type}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn ${link.type === "demo" ? "btn--primary" : "btn--secondary"}`}
              >
                {meta.icon}
                {meta.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
