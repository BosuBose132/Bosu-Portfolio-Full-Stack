import { useMemo, useState } from "react";
import { projects } from "../../data/portfolioData";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { ProjectRow } from "../../components/ui/ProjectRow";
import { ProjectPreview } from "../../components/ui/ProjectPreview";
import { Reveal } from "../../components/ui/Reveal";
import "./Projects.css";

export function Projects() {
  const featured = useMemo(
    () => projects.filter((p) => p.group === "featured"),
    []
  );
  const fundamentals = useMemo(
    () => projects.filter((p) => p.group === "fundamentals"),
    []
  );

  const [selectedId, setSelectedId] = useState(projects[0].id);
  const selected = projects.find((p) => p.id === selectedId) ?? projects[0];

  return (
    <section id="projects" className="section projects" aria-label="Projects">
      <div className="container">
        <SectionHeader label="Projects" title="Selected work" />

        <div className="projects__layout">
          {/* ---------- Directory ---------- */}
          <Reveal className="projects__directory">
            <div className="projects__dir-group">
              <p className="projects__dir-label">
                <span aria-hidden="true">/</span> featured
              </p>
              <ul className="projects__dir-list">
                {featured.map((p) => (
                  <ProjectRow
                    key={p.id}
                    project={p}
                    active={p.id === selectedId}
                    onSelect={setSelectedId}
                  />
                ))}
              </ul>
            </div>

            <div className="projects__dir-group">
              <p className="projects__dir-label">
                <span aria-hidden="true">/</span> fundamentals
              </p>
              <ul className="projects__dir-list">
                {fundamentals.map((p) => (
                  <ProjectRow
                    key={p.id}
                    project={p}
                    active={p.id === selectedId}
                    onSelect={setSelectedId}
                  />
                ))}
              </ul>
            </div>
          </Reveal>

          {/* ---------- Preview ---------- */}
          <div className="projects__preview">
            <ProjectPreview key={selected.id} project={selected} />
          </div>
        </div>
      </div>
    </section>
  );
}
