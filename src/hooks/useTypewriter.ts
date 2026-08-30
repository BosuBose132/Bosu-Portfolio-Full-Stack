import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * Cycles through phrases with a type/delete effect.
 * Under prefers-reduced-motion it simply returns the first phrase,
 * fully typed, with no animation.
 */
export function useTypewriter(
  phrases: string[],
  opts?: { typeSpeed?: number; deleteSpeed?: number; pause?: number }
): string {
  const reduced = usePrefersReducedMotion();
  const [text, setText] = useState(reduced ? phrases[0] ?? "" : "");

  useEffect(() => {
    if (reduced) {
      setText(phrases[0] ?? "");
      return;
    }

    const typeSpeed = opts?.typeSpeed ?? 60;
    const deleteSpeed = opts?.deleteSpeed ?? 30;
    const pause = opts?.pause ?? 1400;

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = phrases[phraseIndex];
      if (deleting) {
        charIndex--;
        setText(current.substring(0, charIndex));
      } else {
        charIndex++;
        setText(current.substring(0, charIndex));
      }

      let delay = deleting ? deleteSpeed : typeSpeed;

      if (!deleting && charIndex === current.length) {
        delay = pause;
        deleting = true;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = typeSpeed * 4;
      }

      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, opts?.typeSpeed ?? 60);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, phrases.join("|")]);

  return text;
}
