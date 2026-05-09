//mobile toggle
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const typedText = document.querySelector("#typed-text");
const projectsToggleBtn = document.querySelector("#projects-toggle-btn");
const moreProjects = document.querySelector("#more-projects");

const typingPhrases = [
  "a Full Stack Developer",
  "a Software Engineer",
  "a problem solver",
  "a quick learner",
  "an observer",
];

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  navItems.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });
}
//Typewriting part in hero section
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
if (projectsToggleBtn && moreProjects) {
  projectsToggleBtn.addEventListener("click", () => {
    moreProjects.classList.toggle("show-projects");
    projectsToggleBtn.classList.toggle("open");

    if (moreProjects.classList.contains("show-projects")) {
      projectsToggleBtn.textContent = "Show less";
    } else {
      projectsToggleBtn.textContent = "View all projects";
    }
  });
}
function typeEffect() {
  if (!typedText) return;

  const currentPhrase = typingPhrases[phraseIndex];

  if (isDeleting) {
    typedText.textContent = currentPhrase.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typedText.textContent = currentPhrase.substring(0, charIndex + 1);
    charIndex++;
  }

  let typingSpeed = isDeleting ? 28 : 55;

  if (!isDeleting && charIndex === currentPhrase.length) {
    typingSpeed = 900;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % typingPhrases.length;
    typingSpeed = 140;
  }

  setTimeout(typeEffect, typingSpeed);
}

typeEffect();
