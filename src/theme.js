const THEME_MODES = new Set(["light", "dark", "system"]);
const systemThemeQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

export function applyTheme(settings = {}) {
  const mode = THEME_MODES.has(settings.themeMode) ? settings.themeMode : "light";
  const resolvedTheme = mode === "system" && systemThemeQuery?.matches ? "dark" : mode === "system" ? "light" : mode;

  document.documentElement.dataset.themePreference = mode;
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
}

export function watchSystemTheme(getSettings) {
  if (!systemThemeQuery?.addEventListener) {
    return () => {};
  }

  const listener = () => applyTheme(getSettings());
  systemThemeQuery.addEventListener("change", listener);
  return () => systemThemeQuery.removeEventListener("change", listener);
}
