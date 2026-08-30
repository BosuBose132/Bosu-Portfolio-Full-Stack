import { education } from "../../data/portfolioData";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { EducationItem } from "../../components/ui/EducationItem";
import "./Education.css";

export function Education() {
  return (
    <section id="education" className="section education" aria-label="Education">
      <div className="container">
        <SectionHeader label="Education" title="Academic journey" />

        <div className="education__track">
          <div className="education__line" aria-hidden="true" />
          <div className="education__grid">
            {education.map((entry, i) => (
              <EducationItem key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
