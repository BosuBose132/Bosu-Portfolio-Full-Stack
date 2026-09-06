import { about, profile } from "../../data/portfolioData";
import { Reveal } from "../../components/ui/Reveal";
import "./About.css";

export function About() {
  return (
    <section id="about" className="section about" aria-label="About Bosu">
      <div className="container">
        <div className="about__grid">
          {/* ---------- Portrait ---------- */}
          <Reveal className="about__portrait-col">
            <div className="about__portrait-frame">
              <span className="about__frame-index" aria-hidden="true">PROFILE / 02</span>
              <span className="about__frame-corner about__frame-corner--top" aria-hidden="true" />
              <span className="about__frame-corner about__frame-corner--bottom" aria-hidden="true" />
              <img
                src={profile.profileImage}
                alt={profile.profileAlt}
                className="about__portrait-img"
                width={520}
                height={650}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about__portrait-caption">
              <span className="about__caption-line" aria-hidden="true" />
              <div>
                <span className="about__caption-name">{profile.fullName}</span>
                <span className="about__caption-role">{profile.role}</span>
              </div>
            </div>
          </Reveal>

          {/* ---------- Text ---------- */}
          <Reveal className="about__text" delay={0.1}>
            <p className="about__eyebrow">
              <span aria-hidden="true" />
              02 // About
            </p>
            <h2 className="about__title">Engineer behind the systems</h2>
            <p className="about__intro">{about.intro}</p>

            {about.paragraphs.map((p, i) => (
              <p key={i} className="about__para">
                {p}
              </p>
            ))}

            <div className="about__specialties">
              <p className="about__specialties-label">What I focus on</p>
              <ul className="about__specialties-list">
                {about.specialties.map((s, index) => (
                  <li key={s} className="about__specialty">
                    <span className="about__specialty-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <span>{s}</span>
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
