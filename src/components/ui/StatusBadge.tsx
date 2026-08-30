import "./StatusBadge.css";

interface StatusBadgeProps {
  label?: string;
}

/** "Open to Work" availability pill with a pulsing green dot. */
export function StatusBadge({ label = "Open to Work" }: StatusBadgeProps) {
  return (
    <span className="status-badge">
      <span className="status-badge__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
