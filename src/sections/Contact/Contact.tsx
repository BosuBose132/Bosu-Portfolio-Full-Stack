import { lazy, Suspense } from "react";
import { contact, profile } from "../../data/portfolioData";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Reveal } from "../../components/ui/Reveal";
import { ContactForm } from "./ContactForm";
import "./Contact.css";

const ContactNetworkScene = lazy(() =>
  import("../../components/three/ContactNetworkScene").then((m) => ({
    default: m.ContactNetworkScene,
  }))
);

const CARDS = [
  {
    key: "email",
    label: "Email",
    value: contact.email,
    href: `mailto:${contact.email}`,
    external: false,
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
  {
    key: "github",
    label: "GitHub",
    value: contact.githubLabel,
    href: contact.github,
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z" />
      </svg>
    ),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    value: contact.linkedinLabel,
    href: contact.linkedin,
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
      </svg>
    ),
  },
  {
    key: "location",
    label: "Location",
    value: contact.location,
    href: null,
    external: false,
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
];

export function Contact() {
  return (
    <section id="contact" className="section contact" aria-label="Contact">
      <div className="container">
        <SectionHeader label="Contact" title="Let's connect" align="center" />

        <div className="contact__availability">
          {profile.openToWork && <StatusBadge />}
          <p>{contact.availability}</p>
        </div>

        <div className="contact__grid">
          {/* ---------- Left: info + form ---------- */}
          <Reveal className="contact__left">
            <div className="contact__cards">
              {CARDS.map((c) =>
                c.href ? (
                  <a
                    key={c.key}
                    href={c.href}
                    className="contact__card"
                    {...(c.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    <span className="contact__card-icon">{c.icon}</span>
                    <span className="contact__card-text">
                      <span className="contact__card-label">{c.label}</span>
                      <span className="contact__card-value">{c.value}</span>
                    </span>
                  </a>
                ) : (
                  <div key={c.key} className="contact__card">
                    <span className="contact__card-icon">{c.icon}</span>
                    <span className="contact__card-text">
                      <span className="contact__card-label">{c.label}</span>
                      <span className="contact__card-value">{c.value}</span>
                    </span>
                  </div>
                )
              )}
            </div>

            <a
              href={profile.resumeUrl}
              download
              className="btn btn--secondary contact__resume"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
              </svg>
              Download Resume
            </a>

            <ContactForm />
          </Reveal>

          {/* ---------- Right: network scene ---------- */}
          <div className="contact__visual">
            <div className="contact__visual-frame">
              <Suspense
                fallback={
                  <div className="contact__visual-fallback" aria-hidden="true">
                    <span>Let&rsquo;s build together</span>
                  </div>
                }
              >
                <ContactNetworkScene />
              </Suspense>
            </div>
            <p className="sr-only">
              A collaboration network connecting you with recruiters, teams, and
              cloud infrastructure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
