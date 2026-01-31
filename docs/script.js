const STORAGE_KEYS = {
  lang: "leoLanding.lang",
  openMonth: "leoLanding.openMonth",
  theme: "leoLanding.theme",
};

function setHtmlAttr(name, value) {
  document.documentElement.setAttribute(name, value);
}

function getHtmlAttr(name) {
  return document.documentElement.getAttribute(name);
}

function showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-visible");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => el.classList.remove("is-visible"), 1400);
}

function getLang() {
  return getHtmlAttr("data-lang") || "ru";
}

function getTheme() {
  return getHtmlAttr("data-theme") || "light";
}

function syncThemeButton() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const lang = getLang();
  const theme = getTheme();
  const next = theme === "dark" ? "light" : "dark";

  const label =
    lang === "ru"
      ? next === "dark"
        ? "Тьма"
        : "Свет"
      : next === "dark"
        ? "Dark"
        : "Light";

  btn.textContent = label;
  btn.setAttribute("aria-label", lang === "ru" ? "Переключить тему" : "Toggle theme");
}

function applyTheme(theme, { persist } = { persist: false }) {
  const next = theme === "dark" ? "dark" : "light";
  setHtmlAttr("data-theme", next);
  if (persist) localStorage.setItem(STORAGE_KEYS.theme, next);
  syncThemeButton();
}

function setupMonthAccordion() {
  const container = document.getElementById("months");
  if (!container) return;

  /** @type {HTMLDetailsElement[]} */
  const items = Array.from(container.querySelectorAll('details[data-acc="month"]'));
  if (!items.length) return;

  // Restore last open
  const saved = localStorage.getItem(STORAGE_KEYS.openMonth);
  if (saved) {
    const match = items.find((d) => d.getAttribute("data-key") === saved);
    if (match) match.open = true;
  } else {
    // Sensible default: start from February (first big pivot in transcript).
    const feb = items.find((d) => d.getAttribute("data-key") === "feb");
    if (feb) feb.open = true;
  }

  // One-open-at-a-time behavior
  items.forEach((d) => {
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      const key = d.getAttribute("data-key");
      if (key) localStorage.setItem(STORAGE_KEYS.openMonth, key);
      items.forEach((other) => {
        if (other !== d) other.open = false;
      });
    });
  });
}

function toggleLang() {
  const current = getLang();
  const next = current === "ru" ? "en" : "ru";
  setHtmlAttr("data-lang", next);
  document.documentElement.lang = next === "ru" ? "ru" : "en";
  localStorage.setItem(STORAGE_KEYS.lang, next);
  showToast(next === "ru" ? "Русский" : "English");
  syncThemeButton();
}

function toggleTheme() {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next, { persist: true });
  const lang = getLang();
  showToast(lang === "ru" ? (next === "dark" ? "Тёмная" : "Светлая") : next === "dark" ? "Dark" : "Light");
}

async function copyMantra() {
  const lang = getLang();
  const text =
    lang === "ru"
      ? "Планеты на моей стороне. Я знаю, что у меня получится."
      : "The planets are on my side. I know I’ll make it work.";

  try {
    await navigator.clipboard.writeText(text);
    showToast(lang === "ru" ? "Скопировано" : "Copied");
  } catch {
    // Fallback for older browser contexts
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast(lang === "ru" ? "Скопировано" : "Copied");
  }
}

function boot() {
  // Restore saved prefs
  const savedLang = localStorage.getItem(STORAGE_KEYS.lang);
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  if (savedLang === "ru" || savedLang === "en") {
    setHtmlAttr("data-lang", savedLang);
    document.documentElement.lang = savedLang;
  }
  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme, { persist: false });
  } else {
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    applyTheme(prefersDark ? "dark" : "light", { persist: false });
  }

  const langBtn = document.getElementById("langToggle");
  const themeBtn = document.getElementById("themeToggle");
  const copyBtn = document.getElementById("copyMantra");

  langBtn?.addEventListener("click", toggleLang);
  themeBtn?.addEventListener("click", toggleTheme);
  copyBtn?.addEventListener("click", copyMantra);
  syncThemeButton();
  setupMonthAccordion();

  // Keyboard shortcuts (quiet, optional)
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (key === "l") toggleLang();
    if (key === "t") toggleTheme();
  });
}

document.addEventListener("DOMContentLoaded", boot);
