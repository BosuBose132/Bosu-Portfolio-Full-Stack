import { profile } from "../../data/portfolioData";
import "./Button.css";

interface ResumeButtonProps {
  variant?: "primary" | "ghost";
  className?: string;
}

/** Downloads the resume PDF. Reused in hero, nav, and contact. */
export function ResumeButton({
  variant = "primary",
  className = "",
}: ResumeButtonProps) {
  return (
    <a
      href={profile.resumeUrl}
      download
      className={`btn btn--${variant} ${className}`}
    >
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M12 3v12m0 0 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
      </svg>
      Download Resume
    </a>
  );
}
