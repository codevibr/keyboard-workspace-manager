const THEME_MODES = new Set([
  "light",
  "dark",
  "system",
  "catppuccin-latte",
  "catppuccin-frappe",
  "catppuccin-macchiato",
  "catppuccin-mocha",
  "chrome-graphite",
  "github-light",
  "github-dark",
  "github-dark-dimmed",
  "nord-snow-storm",
  "nord-polar-night",
  "tokyo-night-light",
  "tokyo-night-storm",
  "tokyo-night"
]);
const systemThemeQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
const DARK_THEMES = new Set([
  "dark",
  "catppuccin-frappe",
  "catppuccin-macchiato",
  "catppuccin-mocha",
  "chrome-graphite",
  "github-dark",
  "github-dark-dimmed",
  "nord-polar-night",
  "tokyo-night-storm",
  "tokyo-night"
]);

export function applyTheme(settings = {}) {
  const mode = THEME_MODES.has(settings.themeMode) ? settings.themeMode : "light";
  const resolvedTheme = resolveTheme(mode);

  document.documentElement.dataset.themePreference = mode;
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = DARK_THEMES.has(resolvedTheme) ? "dark" : "light";
}

export function watchSystemTheme(getSettings) {
  if (!systemThemeQuery?.addEventListener) {
    return () => {};
  }

  const listener = () => applyTheme(getSettings());
  systemThemeQuery.addEventListener("change", listener);
  return () => systemThemeQuery.removeEventListener("change", listener);
}

function resolveTheme(mode) {
  if (mode !== "system") {
    return mode;
  }

  return systemThemeQuery?.matches ? "dark" : "light";
}
