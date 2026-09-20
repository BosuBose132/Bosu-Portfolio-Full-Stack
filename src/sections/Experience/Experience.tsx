import { experience } from "../../data/portfolioData";
import { ExperienceItem } from "../../components/ui/ExperienceItem";
import "./Experience.css";

export function Experience() {
  return (
    <section
      id="experience"
      className="section experience"
      aria-label="Work experience"
    >
      {/* Restrained cosmic ambience — same universe as Hero, much lower intensity */}
      <div className="experience__field" aria-hidden="true">
        <span className="experience__arc" />
        <span className="experience__coord experience__coord--1">38.06&deg; N · ORBIT-02</span>
        <span className="experience__coord experience__coord--2">TRAJECTORY / LOG</span>
      </div>

      <div className="container">
        <div className="experience__heading">
          <p className="experience__eyebrow">
            <span aria-hidden="true" />
            03 // Experience
          </p>
          <h2 className="experience__title">Professional Experience</h2>
          <p className="experience__subtitle">
            Building production systems across full-stack, enterprise, healthcare, and AI applications.
          </p>
        </div>

        <div className="experience__timeline">
          {/* Central orbital trajectory line */}
          <div className="experience__track" aria-hidden="true" />

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
