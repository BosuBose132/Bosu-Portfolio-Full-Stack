import { about, profile } from "../../data/portfolioData";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { Reveal } from "../../components/ui/Reveal";
import "./About.css";

export function About() {
  return (
    <section id="about" className="section about" aria-label="About Bosu">
      <div className="container">
        <SectionHeader label="About Me" title="Engineer behind the systems" />

        <div className="about__grid">
          {/* ---------- Portrait ---------- */}
          <Reveal className="about__portrait-col">
            <div className="about__portrait">
              <div className="about__portrait-ring" aria-hidden="true" />
              <img
                src={profile.profileImage}
                alt={profile.profileAlt}
                className="about__portrait-img"
                width={360}
                height={360}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about__portrait-caption">
              <span className="about__caption-name">{profile.fullName}</span>
              <span className="about__caption-role">{profile.role}</span>
            </div>
          </Reveal>

          {/* ---------- Text ---------- */}
          <Reveal className="about__text" delay={0.1}>
            <p className="about__intro">{about.intro}</p>

            {about.paragraphs.map((p, i) => (
              <p key={i} className="about__para">
                {p}
              </p>
            ))}

            <div className="about__specialties">
              <p className="about__specialties-label">What I focus on</p>
              <ul className="about__specialties-list">
                {about.specialties.map((s) => (
                  <li key={s} className="about__specialty">
                    <span className="about__specialty-dot" aria-hidden="true" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
