import { lazy, Suspense } from "react";
import { skillCategories } from "../../data/portfolioData";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { TechTag } from "../../components/ui/TechTag";
import { Reveal } from "../../components/ui/Reveal";
import "./Skills.css";

const StackLayersScene = lazy(() =>
  import("../../components/three/StackLayersScene").then((m) => ({
    default: m.StackLayersScene,
  }))
);

export function Skills() {
  return (
    <section id="skills" className="section skills" aria-label="Skills and technologies">
      <div className="container">
        <SectionHeader
          label="Skills"
          title="The stack I build with"
        />

        <div className="skills__grid">
          {/* ---------- Categories ---------- */}
          <div className="skills__categories">
            {skillCategories.map((cat, i) => (
              <Reveal
                as="article"
                key={cat.id}
                className="skills__card"
                delay={i * 0.05}
                y={18}
              >
                <h3 className="skills__card-title">
                  <span className={`skills__card-bar skills__card-bar--${cat.accent}`} aria-hidden="true" />
                  {cat.title}
                </h3>
                <div className="skills__card-tags">
                  {cat.skills.map((s) => (
                    <TechTag key={s} label={s} accent={cat.accent} />
                  ))}
                </div>
              </Reveal>
            ))}
          </div>

          {/* ---------- 3D layered architecture ---------- */}
          <div className="skills__visual">
            <div className="skills__visual-frame">
              <Suspense
                fallback={
                  <div className="skills__visual-fallback" aria-hidden="true">
                    <span>Frontend</span>
                    <span>Service</span>
                    <span>Backend</span>
                    <span>Database</span>
                    <span>Cloud</span>
                  </div>
                }
              >
                <StackLayersScene />
              </Suspense>
            </div>
            <p className="skills__visual-note">
              A request flows top-to-bottom: <strong>Frontend → Service → Backend → Database → Cloud</strong>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
