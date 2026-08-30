/* =====================================================================
   PORTFOLIO DATA — single source of truth
   All content is drawn from Bosu's resume + existing portfolio.
   Nothing here is invented. Update this file to update the whole site.
   ===================================================================== */

import profileImg from "../assets/images/profile-picture.webp";
import vistamateImg from "../assets/images/vistamate.webp";
import vidasanaImg from "../assets/images/vidasana.webp";
import shvasaImg from "../assets/images/shvasa.webp";
import guessNumberImg from "../assets/images/guess-my-number.webp";
import pigGameImg from "../assets/images/pig-game.webp";

export interface NavItem {
  id: string;
  label: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  period: string;
  summary: string;
  bullets: string[];
  metrics: { value: string; label: string }[];
  tech: string[];
  icon: "hospital" | "building";
}

export interface EducationEntry {
  id: string;
  degree: string;
  school: string;
  location: string;
  period: string;
  description: string;
  coursework: string[];
}

export interface SkillCategory {
  id: string;
  title: string;
  accent: "amber" | "cyan" | "blue" | "green" | "orange";
  skills: string[];
}

export interface ProjectLink {
  type: "github" | "demo" | "caseStudy";
  url: string;
}

export interface Project {
  id: string;
  index: string;
  name: string;
  tagline: string;
  description: string;
  tech: string[];
  image?: string;
  links: ProjectLink[];
  flagship?: boolean;
  group: "featured" | "fundamentals";
  /* Architecture flow shown for flagship projects (problem -> production) */
  architecture?: string[];
}

/* ------------------------------------------------------------------ */
/*  IDENTITY                                                          */
/* ------------------------------------------------------------------ */

export const profile = {
  firstName: "Bosu",
  fullName: "Bosu Babu Bade",
  brand: "Bosu",
  role: "Full Stack Software Engineer",
  location: "Fort Wayne, IN",
  relocate: "Open to relocate",
  openToWork: true,
  theme: "From problem to production.",
  summary:
    "Full Stack Software Engineer with 3+ years building scalable frontend and backend systems in Java and JavaScript across healthcare and enterprise environments. Strong foundation in data structures, algorithms, and system design, with hands-on experience deploying distributed applications on AWS and managing database-driven services with SQL and MongoDB.",
  heroDescription:
    "I build scalable web applications, AI-powered systems, and responsive user experiences using React, Java, Node.js, and cloud technologies.",
  profileImage: profileImg,
  profileAlt: "Portrait of Bosu Babu Bade, Full Stack Software Engineer",
  resumeUrl: "/BosuBabuBade.pdf",
};

export const contact = {
  email: "badebosubabu@gmail.com",
  phone: "+1 571-546-9200",
  github: "https://github.com/BosuBose132",
  githubLabel: "github.com/BosuBose132",
  linkedin: "https://www.linkedin.com/in/bosu-babu-bade/",
  linkedinLabel: "linkedin.com/in/bosu-babu-bade",
  location: "Fort Wayne, IN · Open to relocate",
  availability:
    "I'm open to full-time software engineering roles, internships, and collaborations. The fastest way to reach me is email.",
};

/* ------------------------------------------------------------------ */
/*  NAVIGATION                                                        */
/* ------------------------------------------------------------------ */

export const navItems: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

/* ------------------------------------------------------------------ */
/*  HERO STATS — only verifiable facts                               */
/* ------------------------------------------------------------------ */

export const heroStats: Stat[] = [
  { value: "3+", label: "Years Experience" },
  { value: "Full-Stack", label: "Frontend & Backend" },
  { value: "Java · JS", label: "Core Languages" },
  { value: "AWS", label: "Cloud Deployment" },
];

/* ------------------------------------------------------------------ */
/*  ABOUT                                                             */
/* ------------------------------------------------------------------ */

export const about = {
  intro:
    "I'm a Full Stack Software Engineer and graduate student in Information Systems at Indiana Institute of Technology, focused on building modern, reliable, and meaningful web applications.",
  paragraphs: [
    "My work spans frontend and backend development with JavaScript, React, Node.js, Java, and Spring Boot, backed by relational and NoSQL databases. I enjoy pairing solid engineering with clean interface design so applications are both dependable and intuitive.",
    "I've worked as a Software Development Intern at Medical Informatics Engineering and as a Software Engineer at Virtusa, gaining hands-on experience with distributed systems, AI-powered workflows, cloud deployment on AWS, and professional collaboration on real products.",
  ],
  specialties: [
    "Full-Stack Engineering",
    "Backend Systems",
    "AI-Powered Applications",
    "Cloud Deployment",
    "Database-Driven Applications",
    "Responsive Web Development",
  ],
};

/* ------------------------------------------------------------------ */
/*  EXPERIENCE                                                        */
/* ------------------------------------------------------------------ */

export const experience: ExperienceEntry[] = [
  {
    id: "mie",
    role: "Software Development Intern",
    company: "Medical Informatics Engineering",
    location: "Fort Wayne, IN",
    start: "May 2025",
    end: "Dec 2025",
    period: "May 2025 – Dec 2025",
    icon: "hospital",
    summary:
      "Built an AI-powered visitor registration system that automates check-in across multiple locations using OCR, real-time processing, and responsive kiosk experiences.",
    bullets: [
      "Designed a distributed visitor registration system in JavaScript and Meteor.js processing 10,000+ monthly records, integrating AI-powered OCR to cut manual verification by 45% across multi-location deployments.",
      "Structured backend validation workflows and optimized MongoDB query execution, reducing peak concurrency latency by 30% while strengthening data consistency under simultaneous kiosk submissions.",
      "Managed cloud deployment on AWS EC2 with CI/CD automation, monitoring pipelines, and structured rollback strategies that improved release stability by 50%.",
    ],
    metrics: [
      { value: "10,000+", label: "Monthly visitor records" },
      { value: "45%", label: "Less manual verification" },
      { value: "50%", label: "Better release stability" },
    ],
    tech: [
      "JavaScript",
      "Meteor.js",
      "React",
      "MongoDB",
      "OCR",
      "AWS EC2",
      "CI/CD",
    ],
  },
  {
    id: "virtusa",
    role: "Software Engineer",
    company: "Virtusa Consulting Services",
    location: "Hyderabad, India",
    start: "Mar 2021",
    end: "May 2024",
    period: "Mar 2021 – May 2024",
    icon: "building",
    summary:
      "Developed scalable enterprise backend services and RESTful APIs for healthcare and banking workflows while improving performance, database efficiency, and release quality.",
    bullets: [
      "Developed scalable backend services using Java, Spring Boot, and MVC design principles for healthcare and banking workflows, supporting 3+ business units and improving operational efficiency by 35%.",
      "Engineered and optimized RESTful APIs for concurrent enterprise workflows, improving response time by 40% while reducing integration bottlenecks across dependent services.",
      "Tuned relational schemas and MySQL query performance, decreasing reporting latency by 40%, and performed root-cause analysis that reduced regression defects by 20%.",
    ],
    metrics: [
      { value: "40%", label: "Faster API response" },
      { value: "35%", label: "Higher workflow efficiency" },
      { value: "20%", label: "Fewer regression defects" },
    ],
    tech: [
      "Java",
      "Spring Boot",
      "REST APIs",
      "MySQL",
      "MVC",
      "AWS",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  SKILLS — resume-backed only. No percentages, no bars.            */
/* ------------------------------------------------------------------ */

export const skillCategories: SkillCategory[] = [
  {
    id: "languages",
    title: "Programming Languages",
    accent: "amber",
    skills: ["Java", "JavaScript", "Python"],
  },
  {
    id: "frontend",
    title: "Frontend",
    accent: "cyan",
    skills: ["React", "Angular", "HTML", "CSS", "Meteor.js", "Tailwind CSS"],
  },
  {
    id: "backend",
    title: "Backend",
    accent: "blue",
    skills: ["Node.js", "Express.js", "Spring Boot", "REST APIs"],
  },
  {
    id: "databases",
    title: "Databases",
    accent: "green",
    skills: ["SQL", "MySQL", "PostgreSQL", "MongoDB"],
  },
  {
    id: "cloud",
    title: "Cloud & DevOps",
    accent: "orange",
    skills: [
      "AWS EC2",
      "AWS S3",
      "AWS Lambda",
      "Docker",
      "GitHub Actions",
      "CI/CD",
      "Linux",
    ],
  },
  {
    id: "practices",
    title: "Tools & Engineering Practices",
    accent: "cyan",
    skills: [
      "Git",
      "GitHub",
      "System Design",
      "Data Structures",
      "OOP",
      "Debugging",
      "Monitoring",
    ],
  },
];

/* Architecture stack layers used by the Skills 3D scene */
export const stackLayers = [
  { id: "frontend", label: "Frontend", tech: "React · Angular", accent: "cyan" },
  { id: "service", label: "Service", tech: "REST APIs · Gateway", accent: "blue" },
  { id: "backend", label: "Backend", tech: "Java · Node · Spring", accent: "amber" },
  { id: "database", label: "Database", tech: "SQL · MongoDB", accent: "green" },
  { id: "cloud", label: "Cloud", tech: "AWS · Docker · CI/CD", accent: "orange" },
] as const;

/* ------------------------------------------------------------------ */
/*  EDUCATION                                                         */
/* ------------------------------------------------------------------ */

export const education: EducationEntry[] = [
  {
    id: "masters",
    degree: "Master of Science, Information Systems",
    school: "Indiana Institute of Technology",
    location: "Indiana",
    period: "Aug 2024 – May 2026",
    description:
      "Focused on scalable software systems, database management, system design, and modern web technologies while building real-world full-stack applications.",
    coursework: [
      "System Design & Analysis",
      "Database Management",
      "Project Management",
      "Data Visualization",
    ],
  },
  {
    id: "bachelors",
    degree: "Bachelor of Engineering, Computer Engineering",
    school: "Pydah College of Engineering and Technology",
    location: "Visakhapatnam",
    period: "Jul 2015 – Nov 2019",
    description:
      "Built strong foundations in programming, networking, operating systems, and data structures that shaped my software engineering journey.",
    coursework: [
      "Data Structures",
      "Computer Networking",
      "Network Analysis",
      "Fundamentals of Unix & C",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  PROJECTS                                                          */
/* ------------------------------------------------------------------ */

export const projects: Project[] = [
  {
    id: "vistamate",
    index: "01",
    name: "VistaMate",
    tagline: "AI-powered visitor management",
    flagship: true,
    group: "featured",
    description:
      "A smart visitor management system that streamlines check-in, tracking, and administrative workflows. A kiosk front end captures visitor documents, AI-powered OCR extracts details in real time, and an admin dashboard manages records across multiple locations.",
    tech: ["React", "Meteor.js", "MongoDB", "OCR", "OpenCV", "AWS"],
    image: vistamateImg,
    links: [{ type: "github", url: contact.github }],
    architecture: [
      "Kiosk",
      "React / Meteor",
      "OCR / OpenCV",
      "MongoDB",
      "Admin Dashboard",
      "AWS",
    ],
  },
  {
    id: "vidasana",
    index: "02",
    name: "Vida Sana",
    tagline: "Vegan nutrition guidance",
    group: "featured",
    description:
      "A vegan nutrition guidance web application that helps users transition to a plant-based lifestyle through personalized nutrition support, calorie tracking, nutrient awareness, and vegan food replacements.",
    tech: [
      "HTML",
      "CSS",
      "Bootstrap",
      "JavaScript",
      "Node.js",
      "Express.js",
      "MySQL",
    ],
    image: vidasanaImg,
    links: [{ type: "github", url: contact.github }],
  },
  {
    id: "shvasa",
    index: "03",
    name: "Shvasa",
    tagline: "Anxiety relief, mobile-first",
    group: "featured",
    description:
      "A mobile-first anxiety relief application designed for emotional first aid, helping users calm down quickly through guided breathing, grounding exercises, support prompts, and interactive calming flows.",
    tech: [
      "JavaScript",
      "Tailwind CSS",
      "Three.js",
      "Vite",
      "Node.js",
      "Express.js",
      "MongoDB",
    ],
    image: shvasaImg,
    links: [{ type: "github", url: contact.github }],
  },
  {
    id: "bankist",
    index: "04",
    name: "Bankist",
    tagline: "Secure banking SPA",
    group: "featured",
    description:
      "A secure, high-performance banking single-page application built with modular JavaScript, implementing robust client-side state management and strict session controls such as auto-logout and authentication to ensure data integrity across financial workflows.",
    tech: ["HTML", "CSS", "JavaScript"],
    links: [{ type: "github", url: contact.github }],
  },
  {
    id: "firstcry",
    index: "05",
    name: "First Cry",
    tagline: "E-commerce backend",
    group: "featured",
    description:
      "A scalable e-commerce backend built with Java and RESTful APIs, using a decoupled service-layer design and strategic caching to reduce database load and enforce transactional consistency across concurrent sessions.",
    tech: ["Java", "SQL", "REST APIs"],
    links: [{ type: "github", url: contact.github }],
  },
  {
    id: "guess-my-number",
    index: "06",
    name: "Guess My Number",
    tagline: "DOM & game logic",
    group: "fundamentals",
    description:
      "An interactive number-guessing game built with vanilla JavaScript, focused on DOM manipulation, event handling, and game state logic.",
    tech: ["HTML", "CSS", "JavaScript"],
    image: guessNumberImg,
    links: [{ type: "github", url: contact.github }],
  },
  {
    id: "pig-game",
    index: "07",
    name: "Pig Game",
    tagline: "Event-driven dice game",
    group: "fundamentals",
    description:
      "A JavaScript dice game demonstrating score handling, event-driven interaction, and dynamic UI updates.",
    tech: ["HTML", "CSS", "JavaScript"],
    image: pigGameImg,
    links: [{ type: "github", url: contact.github }],
  },
];

/* ------------------------------------------------------------------ */
/*  HERO ARCHITECTURE NODES (labels for the 3D system scene)         */
/* ------------------------------------------------------------------ */

export const architectureNodes = [
  "Frontend",
  "API Gateway",
  "Backend",
  "Database",
  "Cloud",
  "AI / OCR",
  "Monitoring",
  "CI/CD",
] as const;

export const footer = {
  name: profile.fullName,
  builtWith: "Built with Vite, React, and Three.js",
};
