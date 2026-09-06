import { lazy, Suspense, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { heroStats, profile } from "../../data/portfolioData";
import { SocialLinks } from "../../components/ui/SocialLinks";
import "./Hero.css";

const SystemArchitectureScene = lazy(() =>
  import("../../components/three/SystemArchitectureScene").then((m) => ({
    default: m.SystemArchitectureScene,
  }))
);

export function Hero() {
  const pointerRef = useRef({ x: 0, y: 0 });

  const updatePointer = (event: ReactPointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerRef.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointerRef.current.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  };

  return (
    <section id="home" className="hero" aria-label="Introduction" onPointerMove={updatePointer} onPointerLeave={() => { pointerRef.current = { x: 0, y: 0 }; }}>
      <div className="hero__universe" aria-hidden="true">
        <Suspense fallback={null}>
          <SystemArchitectureScene pointerRef={pointerRef} />
        </Suspense>
      </div>

      <div className="hero__hud hero__hud--top" aria-hidden="true">
        <span>FULL STACK SYSTEMS</span>
        <i />
        <span>PRODUCTION READY</span>
      </div>

      <div className="container hero__inner">
        {/* ---------------- Left: intro ---------------- */}
        <div className="hero__content">
          <p className="hero__status">
            <span aria-hidden="true" />
            Full Stack Software Engineer
          </p>
          <h1 className="hero__title">
            <span className="hero__greeting">Hi, I&rsquo;m</span>
            <span className="hero__name">{profile.fullName}</span>
          </h1>

          <p className="hero__role">{profile.role}</p>

          <p className="hero__desc">{profile.heroDescription}</p>

          <div className="hero__actions">
            <a href="#projects" className="btn btn--primary hero__cta hero__cta--primary">
              <span>View Projects</span>
              <span aria-hidden="true">↗</span>
            </a>
            <a href={profile.resumeUrl} download className="btn btn--secondary hero__cta hero__cta--secondary">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
              </svg>
              <span>Download Resume</span>
            </a>
            <SocialLinks size="sm" className="hero__socials" />
          </div>

          <dl className="hero__stats" aria-label="Engineering highlights">
            {heroStats.map((stat) => (
              <div className="hero__stat" key={stat.label}>
                <dt className="hero__stat-label">{stat.label}</dt>
                <dd className="hero__stat-value">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Reserved visual space keeps the architecture cluster on the right. */}
        <div className="hero__visual">
          <p className="sr-only">
            System architecture: Frontend requests move through an API Gateway
            to Backend services, which work with Database, AI/OCR, Cloud,
            Monitoring, and CI/CD systems.
          </p>
        </div>
      </div>
    </section>
  );
}
