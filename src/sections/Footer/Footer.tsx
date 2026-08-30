import { footer, profile } from "../../data/portfolioData";
import { SocialLinks } from "../../components/ui/SocialLinks";
import "./Footer.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" aria-label="Site footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <a href="#home" className="footer__name">
            <span className="footer__logo" aria-hidden="true">
              <span style={{ color: "var(--amber)" }}>&lt;</span>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <span style={{ color: "var(--cyan)" }}>&gt;</span>
            </span>
            {footer.name}
          </a>
          <p className="footer__role">{profile.role}</p>
        </div>

        <SocialLinks size="sm" showEmail />

        <div className="footer__meta">
          <p>
            &copy; {year} {footer.name}. All rights reserved.
          </p>
          <p className="footer__built">{footer.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}
