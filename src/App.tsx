import { lazy, Suspense } from "react";
import { Navbar } from "./components/navigation/Navbar";
import { Hero } from "./sections/Hero/Hero";
import { About } from "./sections/About/About";
import { Experience } from "./sections/Experience/Experience";
import { Skills } from "./sections/Skills/Skills";
import { Education } from "./sections/Education/Education";
import { Projects } from "./sections/Projects/Projects";
import { Contact } from "./sections/Contact/Contact";
import { Footer } from "./sections/Footer/Footer";

/* Heavy 3D background is code-split and lazy-loaded so it never blocks
   first paint. It renders behind all content. */
const DataFlowBackground = lazy(() =>
  import("./components/three/DataFlowBackground").then((m) => ({
    default: m.DataFlowBackground,
  }))
);

export default function App() {
  return (
    <>
      <a href="#home" className="skip-link">
        Skip to content
      </a>

      <Suspense fallback={null}>
        <DataFlowBackground />
      </Suspense>

      <div className="app-shell">
        <Navbar />
        <main>
          <Hero />
          <About />
          <Experience />
          <Skills />
          <Education />
          <Projects />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
