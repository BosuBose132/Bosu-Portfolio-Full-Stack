import "./SectionHeader.css";

interface SectionHeaderProps {
  label: string;
  title: string;
  align?: "left" | "center";
}

/**
 * Reusable eyebrow label + heading used at the top of each section.
 */
export function SectionHeader({
  label,
  title,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div className={`section-header section-header--${align}`}>
      <p className="section-header__label">
        <span className="section-header__tick" aria-hidden="true" />
        {label}
      </p>
      <h2 className="section-header__title">{title}</h2>
    </div>
  );
}
