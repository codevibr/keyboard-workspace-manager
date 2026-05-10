import { DEFAULT_SETTINGS, STORAGE_KEYS } from "./config.js";

export async function getSettings() {
  const stored = await chrome.storage.sync.get(STORAGE_KEYS.settings);
  return mergeSettings(DEFAULT_SETTINGS, stored[STORAGE_KEYS.settings] || {});
}

export async function saveSettings(nextSettings) {
  const settings = mergeSettings(DEFAULT_SETTINGS, nextSettings);
  await chrome.storage.sync.set({ [STORAGE_KEYS.settings]: settings });
  return settings;
}

export async function updateSettings(patch) {
  const current = await getSettings();
  return saveSettings(deepMerge(current, patch));
}

function mergeSettings(defaults, custom) {
  return deepMerge(structuredClone(defaults), custom);
}

function deepMerge(target, source) {
  if (!source || typeof source !== "object") {
    return target;
  }

  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value) || value === null || typeof value !== "object") {
      target[key] = value;
      continue;
    }

    if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) {
      target[key] = {};
    }

    deepMerge(target[key], value);
  }

  return target;
}
