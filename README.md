# Bosu Babu Bade — Portfolio (v2)

A cinematic, software-engineering-themed portfolio built with **Vite + React + TypeScript + Three.js**.
Theme: _"From problem to production."_

Live sections: Hero (3D system architecture), About, Experience timeline, Skills
(3D layered stack), Education, Projects (interactive directory + flagship
architecture flow), Contact (working form + 3D collaboration network), Footer.

---

## Tech stack

- **Vite** — build tool & dev server
- **React 18 + TypeScript** — UI and type safety
- **Three.js** via **@react-three/fiber** + **@react-three/drei** — the 3D scenes
- **framer-motion** — scroll reveals
- **Web3Forms** — contact form delivery
- Hand-written modern CSS (CSS variables, no framework)

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev

# 3. Type-check + production build (outputs to /dist)
npm run build

# 4. Preview the production build locally
npm run preview
```

---

## Contact form setup (Web3Forms)

The contact form uses [Web3Forms](https://web3forms.com) — free, no backend needed.

1. Go to https://web3forms.com and enter your email to get an **access key**.
2. Copy `.env.example` to `.env`.
3. Paste your key: `VITE_WEB3FORMS_KEY=your-key-here`
4. Restart the dev server.

Until a key is set, the form still validates input but will politely ask
visitors to email directly instead of faking a successful send.

---

## Project structure

```
src/
  assets/images/        Portrait + project screenshots (WebP)
  components/
    layout/             Section wrapper
    navigation/         Navbar (scroll-spy, mobile menu)
    three/              DataFlowBackground, SystemArchitectureScene,
                        StackLayersScene, ContactNetworkScene
    ui/                 SectionHeader, TechTag, SocialLinks, ResumeButton,
                        StatusBadge, Reveal, ExperienceItem, EducationItem,
                        ProjectRow, ProjectPreview, ArchitectureFlow
  sections/             Hero, About, Experience, Skills, Education,
                        Projects, Contact, Footer
  data/portfolioData.ts Single source of truth for ALL content
  hooks/                useScrollSpy, usePrefersReducedMotion,
                        useMediaQuery, useTypewriter
  styles/               theme.css (design tokens) + global.css
```

**All content lives in `src/data/portfolioData.ts`.** Edit that one file to
update text, roles, projects, skills, or links across the whole site.

---

## Deploying

The app is a static site — deploy the `dist/` folder anywhere.

**Vercel** (recommended): import the repo; `vercel.json` is already configured.
Add `VITE_WEB3FORMS_KEY` in Project → Settings → Environment Variables.

**Netlify**: import the repo; `netlify.toml` is already configured.
Add `VITE_WEB3FORMS_KEY` in Site settings → Environment variables.

**Manual / any static host**: run `npm run build` and upload the `dist/` folder.

---

## Accessibility & performance

- Semantic HTML, proper heading hierarchy, visible focus states, skip link
- All portfolio content lives in real HTML — never only inside a canvas
- Respects `prefers-reduced-motion` (3D auto-rotation and reveals disabled)
- 3D scenes are lazy-loaded and code-split; reduced complexity on mobile
- Images are compressed WebP and lazy-loaded
