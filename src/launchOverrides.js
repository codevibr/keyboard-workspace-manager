const MODE_ALIASES = new Map([
  ["default", "default"],
  ["tab", "regularTab"],
  ["regular", "regularTab"],
  ["regular_tab", "regularTab"],
  ["regular-tab", "regularTab"],
  ["pinned", "pinnedTab"],
  ["pin", "pinnedTab"],
  ["pinned_tab", "pinnedTab"],
  ["pinned-tab", "pinnedTab"],
  ["popup", "popupWindow"],
  ["floating", "popupWindow"],
  ["floating_window", "popupWindow"],
  ["floating-window", "popupWindow"],
  ["window", "popupWindow"]
]);

const TRUE_VALUES = new Set(["1", "true", "yes", "y", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "n", "off"]);

export function parseLaunchOverrides(params) {
  const mode = parseMode(params.get("mode") || params.get("m"));
  const forceNew = parseBoolean(params.get("new") || params.get("n"));
  const popup = {
    left: parseInteger(params.get("left") || params.get("x")),
    top: parseInteger(params.get("top") || params.get("y")),
    width: parsePositiveInteger(params.get("width") || params.get("w")),
    height: parsePositiveInteger(params.get("height") || params.get("h"))
  };

  const overrides = {};

  if (mode && mode !== "default") {
    overrides.launchMode = mode;
  }

  if (typeof forceNew === "boolean") {
    overrides.forceNew = forceNew;
  }

  const cleanPopup = Object.fromEntries(
    Object.entries(popup).filter(([, value]) => Number.isInteger(value))
  );

  if (Object.keys(cleanPopup).length) {
    overrides.popup = cleanPopup;
  }

  return overrides;
}

export function applyLaunchOverrides(entry, overrides = {}) {
  const next = structuredClone(entry);

  if (overrides.launchMode) {
    next.launchMode = overrides.launchMode;
    next.pinned = overrides.launchMode === "pinnedTab";
    next.windowPreference = overrides.launchMode === "popupWindow" ? "popup" : "current";
  }

  if (overrides.popup) {
    next.popup = {
      ...(next.popup || {}),
      ...overrides.popup
    };
  }

  return next;
}

function parseMode(value) {
  if (!value) {
    return null;
  }

  return MODE_ALIASES.get(String(value).trim().toLowerCase()) || null;
}

function parseBoolean(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) {
    return true;
  }

  if (FALSE_VALUES.has(normalized)) {
    return false;
  }

  return null;
}

function parseInteger(value) {
  if (!/^-?\d+$/.test(String(value || "").trim())) {
    return null;
  }

  return Number.parseInt(value, 10);
}

function parsePositiveInteger(value) {
  const parsed = parseInteger(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
