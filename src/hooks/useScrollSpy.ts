import { useEffect, useState } from "react";

/**
 * Tracks which section is currently in view and returns its id.
 * Uses IntersectionObserver for performance (no scroll listeners).
 */
export function useScrollSpy(
  sectionIds: string[],
  options?: { rootMargin?: string }
): string {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? "");

  useEffect(() => {
    const rootMargin = options?.rootMargin ?? "-45% 0px -50% 0px";

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin, threshold: [0, 0.25, 0.5, 1] }
    );

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds.join(",")]);

  return activeId;
}
