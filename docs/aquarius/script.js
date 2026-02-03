const STORAGE_KEYS = {
  theme: "aquariusLanding.theme",
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

function getTheme() {
  return getHtmlAttr("data-theme") || "light";
}

function syncThemeButton() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const theme = getTheme();
  const next = theme === "dark" ? "light" : "dark";
  btn.textContent = next === "dark" ? "Тьма" : "Свет";
  btn.setAttribute("aria-label", "Переключить тему");
}

function applyTheme(theme, { persist } = { persist: false }) {
  const next = theme === "dark" ? "dark" : "light";
  setHtmlAttr("data-theme", next);
  if (persist) localStorage.setItem(STORAGE_KEYS.theme, next);
  syncThemeButton();
}

function toggleTheme() {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next, { persist: true });
  showToast(next === "dark" ? "Тёмная" : "Светлая");
}

async function copyMantra() {
  const text = "Я рискну. Я попробую. Я смогу.";
  try {
    await navigator.clipboard.writeText(text);
    showToast("Скопировано");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("Скопировано");
  }
}

function boot() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme, { persist: false });
  } else {
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    applyTheme(prefersDark ? "dark" : "light", { persist: false });
  }

  document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);
  document.getElementById("copyMantra")?.addEventListener("click", copyMantra);
  syncThemeButton();

  // Keyboard shortcut: T toggles theme
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.toLowerCase() === "t") toggleTheme();
  });
}

document.addEventListener("DOMContentLoaded", boot);

