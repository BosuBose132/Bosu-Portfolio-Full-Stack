import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}

/**
 * A semantic <section> with an anchor id and the shared container.
 * Every page section uses this for consistent width + scroll offset.
 */
export function Section({ id, className, children, ariaLabel }: SectionProps) {
  return (
    <section
      id={id}
      className={`section ${className ?? ""}`}
      aria-label={ariaLabel}
    >
      <div className="container">{children}</div>
    </section>
  );
}
