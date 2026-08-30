import { lazy, Suspense } from "react";
import { profile } from "../../data/portfolioData";
import { SocialLinks } from "../../components/ui/SocialLinks";
import { useTypewriter } from "../../hooks/useTypewriter";
import "./Hero.css";

const SystemArchitectureScene = lazy(() =>
  import("../../components/three/SystemArchitectureScene").then((m) => ({
    default: m.SystemArchitectureScene,
  }))
);

const ROLE_PHRASES = [
  "Full Stack Software Engineer",
  "Backend & API Developer",
  "AI-Powered App Builder",
  "Cloud & DevOps Practitioner",
];

export function Hero() {
  const typed = useTypewriter(ROLE_PHRASES);

  return (
    <section id="home" className="hero" aria-label="Introduction">
      <div className="container hero__inner">
        {/* ---------------- Left: intro ---------------- */}
        <div className="hero__content">
          <h1 className="hero__title">
            <span className="hero__greeting">Hi, I&rsquo;m</span>
            <span className="hero__name">{profile.fullName}</span>
          </h1>

          <p className="hero__role" aria-label={profile.role}>
            <span className="hero__role-static">I&rsquo;m a </span>
            <span className="hero__role-typed">
              {typed}
              <span className="hero__cursor" aria-hidden="true" />
            </span>
          </p>

          <p className="hero__desc">{profile.heroDescription}</p>

          <div className="hero__actions">
            <a href="#projects" className="btn btn--primary">
              View Projects
            </a>
            <a href={profile.resumeUrl} download className="btn btn--secondary">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
              </svg>
              Download Resume
            </a>
            <SocialLinks size="sm" />
          </div>
        </div>

        {/* ---------------- Right: 3D system scene ---------------- */}
        <div className="hero__visual">
          <div className="hero__visual-frame">
            <Suspense
              fallback={
                <div className="hero__visual-fallback" aria-hidden="true">
                  <span className="hero__visual-fallback-label">
                    Build → Test → Deploy
                  </span>
                </div>
              }
            >
              <SystemArchitectureScene />
            </Suspense>
          </div>

          {/* Accessible, non-canvas description of the architecture */}
          <p className="sr-only">
            System architecture: a Frontend connects through an API Gateway to a
            Backend, which reads and writes a Database, calls AI/OCR services,
            and deploys to the Cloud. Monitoring and CI/CD close the loop back to
            the Frontend, forming a Build, Test, Deploy pipeline.
          </p>
        </div>
      </div>
    </section>
  );
}
