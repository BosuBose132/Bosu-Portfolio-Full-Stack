import "./TechTag.css";

interface TechTagProps {
  label: string;
  accent?: "amber" | "cyan" | "blue" | "green" | "orange" | "neutral";
}

/** Small pill used for technology tags across the site. */
export function TechTag({ label, accent = "neutral" }: TechTagProps) {
  return <span className={`tech-tag tech-tag--${accent}`}>{label}</span>;
}
