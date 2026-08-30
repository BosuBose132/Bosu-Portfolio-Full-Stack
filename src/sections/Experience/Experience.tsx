import { experience } from "../../data/portfolioData";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { ExperienceItem } from "../../components/ui/ExperienceItem";
import "./Experience.css";

export function Experience() {
  return (
    <section
      id="experience"
      className="section experience"
      aria-label="Work experience"
    >
      <div className="container">
        <SectionHeader label="Experience" title="Professional journey" />

        <div className="experience__timeline">
          {/* Central pipeline with a flowing packet */}
          <div className="experience__pipeline" aria-hidden="true">
            <span className="experience__packet experience__packet--1" />
            <span className="experience__packet experience__packet--2" />
          </div>

          <ol className="experience__list">
            {experience.map((entry, i) => (
              <ExperienceItem
                key={entry.id}
                entry={entry}
                side={i % 2 === 0 ? "left" : "right"}
                index={i}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
