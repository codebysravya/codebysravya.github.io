/* =========================================================
   ask-me.sh — a lightweight, client-side "chat" about Sravya.
   Rule-based keyword matcher with a typing effect. No backend.
   Edit the KNOWLEDGE + PROFILE below to personalize.
   ========================================================= */

const PROFILE = {
  name: "Sravya KP",
  role: "ERP Developer, WordPress Developer, Frontend Developer & Digital Marketing Strategist",
  email: "sravyakp1@gmail.com",
  linkedin: "https://www.linkedin.com/in/sravya-kp-bb6726203",
  location: "Kerala, Bangalore",
  available: true,
};

/* Each entry: keywords that trigger it + the reply.
   Most keyword hits wins. */
const KNOWLEDGE = [
  {
    keys: ["stack", "tech", "technologies", "tools", "languages", "use", "skill", "skills"],
    reply:
      "My core skills: WordPress (custom themes, Elementor, Gutenberg, Divi, WooCommerce), frontend with HTML5, CSS3, Bootstrap, JavaScript, jQuery and React.js, plus PHP & MySQL on the backend. I also handle SEO, Google Analytics/Search Console, and design in Figma & Canva.",
  },
  {
    keys: ["available", "availability", "hire", "hiring", "job", "role", "position", "open", "looking", "interview", "notice", "join"],
    reply:
      PROFILE.available
        ? "Yes — I'm actively looking for a full-time role and open to interviewing now. Best way to reach me is " + PROFILE.email + " (I reply within 24h)."
        : "I've just started a new role, but I'm always happy to connect — reach me at " + PROFILE.email + ".",
  },
  {
    keys: ["experience", "years", "background", "long", "worked", "company", "companies", "career"],
    reply:
      "3 years of experience across four companies:\n• Technoprix Pvt. Ltd. — WordPress Dev & Digital Presence Strategist (Aug 2024–now)\n• QBS — WordPress Developer (2024)\n• Sprintisle Digital Solutions — WordPress Developer (2022–23)\n• Cloudspring Technologies — Web Dev Intern (2022)",
  },
  {
    keys: ["project", "projects", "portfolio", "built", "made", "site", "sites", "website", "websites", "work", "done"],
    reply:
      "A few sites I've built:\n• GetSkillsOnline — learning platform (WordPress)\n• Academy — Taxscan — course site (WordPress)\n• Future Fantastic — marketing site (WordPress)\n• Cloud AI — React.js frontend with CRUD\n• Employee Management System — PHP & MySQL\nScroll to the projects section for links.",
  },
  {
    keys: ["wordpress", "elementor", "gutenberg", "woocommerce", "divi", "theme", "plugin", "cms"],
    reply:
      "WordPress is my main craft — I build custom themes in PHP, use Elementor/Gutenberg/Divi for page building, set up WooCommerce stores, and convert Figma designs into pixel-perfect, responsive sites.",
  },
  {
    keys: ["seo", "marketing", "analytics", "search", "console", "pagespeed", "rank", "speed", "performance", "optimize", "optimise"],
    reply:
      "SEO & performance are a big part of my work: on-page SEO, keyword research, Core Web Vitals via Google PageSpeed Insights, and monitoring with Google Analytics & Search Console. I also plan digital marketing campaigns and design creatives in Canva.",
  },
  {
    keys: ["react", "frontend", "javascript", "php", "mysql", "crud"],
    reply:
      "On the frontend I work with HTML5, CSS3, Bootstrap, JavaScript, jQuery, AJAX and React.js. On the backend I use PHP & MySQL — for example, a React CRUD frontend (Cloud AI) and an Employee Management System in PHP/MySQL.",
  },
  {
    keys: ["education", "study", "degree", "college", "qualification", "graduate"],
    reply:
      "I hold a B.Sc. in Computer Science from IHRD College, Nadapuram (2017–2020), plus certifications in WordPress Development, Web Development, and Digital Marketing Strategist Fundamentals.",
  },
  {
    keys: ["linkedin", "connect", "profile"],
    reply: "Let's connect on LinkedIn: " + PROFILE.linkedin,
  },
  {
    keys: ["contact", "email", "reach", "message", "talk", "hire me"],
    reply:
      "Email me at " + PROFILE.email + ", or connect on LinkedIn — links are up top. I usually reply within a day.",
  },
  {
    keys: ["location", "where", "based", "remote", "relocate", "live", "kerala"],
    reply: "I'm based in " + PROFILE.location + ", and open to remote or on-site roles.",
  },
  {
    keys: ["language", "speak", "malayalam", "hindi", "tamil", "english"],
    reply: "I speak English, Malayalam, Hindi and Tamil.",
  },
  {
    keys: ["hello", "hi", "hey", "yo", "sup", "greetings", "namaste"],
    reply: "Hey! 👋 I'm " + PROFILE.name + "'s assistant. Ask me about my skills, experience, projects, or availability.",
  },
  {
    keys: ["name", "who", "you"],
    reply: "I'm the assistant for " + PROFILE.name + " — " + PROFILE.role + ".",
  },
  {
    keys: ["thanks", "thank", "cool", "nice", "awesome", "great"],
    reply: "Anytime! Feel free to reach out at " + PROFILE.email + " if you'd like to chat for real.",
  },
];

const FALLBACK =
  "Good question — I'm a simple bot, so try asking about my skills, WordPress work, experience, projects, SEO, or how to get in touch. Or just email " +
  PROFILE.email + ".";

const SUGGESTION_POOL = [
  "What are your skills?",
  "Are you available?",
  "Show me projects",
  "How do I contact you?",
  "What's your LinkedIn?",
  "Tell me about your experience",
  "Do you do SEO & marketing?",
  "Where are you based?",
];
const SUGGEST_COUNT = 4;
let sugStart = 0;

/* ===================== Chat engine ===================== */
const chat = document.getElementById("chat");
const log = document.getElementById("chat-log");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-text");
const suggestionsEl = document.getElementById("chat-suggestions");
let greeted = false;

function greet() {
  if (greeted) return;
  greeted = true;
  botSay(
    "Hi! I'm " + PROFILE.name + "'s assistant 🤖\nAsk me anything about my work, or tap a suggestion below."
  );
  renderSuggestions();
}

/* The chat is always visible inline. Nav / hero buttons just
   scroll it into view and focus the input. */
function openChat() {
  chat.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => input.focus(), 300);
}

document.querySelectorAll("[data-open-chat]").forEach((el) =>
  el.addEventListener("click", (e) => { e.preventDefault(); openChat(); })
);

function scrollLog() { log.scrollTop = log.scrollHeight; }

function userSay(text) {
  const el = document.createElement("div");
  el.className = "msg msg--user";
  el.textContent = text;
  log.appendChild(el);
  scrollLog();
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Turn URLs and emails in bot replies into orange clickable links.
// Only ever called with trusted bot text (never raw user input).
function linkify(text) {
  let html = escapeHtml(text);
  html = html.replace(/(https?:\/\/[^\s]+)/g,
    '<a class="msg__link" href="$1" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g,
    '<a class="msg__link" href="mailto:$1">$1</a>');
  return html;
}

function botSay(text) {
  const typing = document.createElement("div");
  typing.className = "msg msg--bot typing";
  typing.innerHTML = "<i></i><i></i><i></i>";
  log.appendChild(typing);
  scrollLog();

  const delay = Math.min(500 + text.length * 8, 1200);
  setTimeout(() => {
    typing.remove();
    const el = document.createElement("div");
    el.className = "msg msg--bot";
    el.innerHTML = linkify(text);
    log.appendChild(el);
    scrollLog();
  }, delay);
}

function renderSuggestions() {
  suggestionsEl.innerHTML = "";
  for (let i = 0; i < SUGGEST_COUNT; i++) {
    const s = SUGGESTION_POOL[(sugStart + i) % SUGGESTION_POOL.length];
    const b = document.createElement("button");
    b.textContent = s;
    b.addEventListener("click", () => handleInput(s));
    suggestionsEl.appendChild(b);
  }
  // rotate so a fresh set shows next time
  sugStart = (sugStart + SUGGEST_COUNT) % SUGGESTION_POOL.length;
}

function answer(query) {
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const entry of KNOWLEDGE) {
    const score = entry.keys.reduce((n, k) => (q.includes(k) ? n + 1 : n), 0);
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return bestScore > 0 ? best.reply : FALLBACK;
}

function handleInput(text) {
  const t = text.trim();
  if (!t) return;
  userSay(t);
  input.value = "";
  botSay(answer(t));
  renderSuggestions();  // rotate the capsule options after each message
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  handleInput(input.value);
});

/* On desktop the chat is inline and always visible — greet immediately
   (without stealing focus). On mobile it stays a floating popup. */
/* Greet immediately — the chat is visible on load. */
chat.setAttribute("aria-hidden", "false");
greet();

/* ===================== Scroll reveal ===================== */
const observer = new IntersectionObserver(
  (entries) => entries.forEach((en) => { if (en.isIntersecting) en.target.classList.add("in"); }),
  { threshold: 0.12 }
);
document.querySelectorAll(".section, .hero").forEach((el) => observer.observe(el));
