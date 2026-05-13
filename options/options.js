import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../src/config.js";
import { getSettings, saveSettings } from "../src/storage.js";

const fields = {
  navItems: document.querySelectorAll("[data-view-tab]"),
  views: document.querySelectorAll("[data-view]"),
  debug: document.querySelector("#debug"),
  healPinnedOrderOnStartup: document.querySelector("#healPinnedOrderOnStartup"),
  includeBookmarksInCommandPalette: document.querySelector("#includeBookmarksInCommandPalette"),
  slots: document.querySelector("#slots"),
  launcherEntries: document.querySelector("#launcherEntries"),
  addLauncherEntry: document.querySelector("#addLauncherEntry"),
  openChromeShortcuts: document.querySelector("#openChromeShortcuts"),
  resetDefaults: document.querySelectorAll(".reset-defaults"),
  save: document.querySelector("#save"),
  exportSettings: document.querySelector("#exportSettings"),
  importSettings: document.querySelector("#importSettings"),
  importFile: document.querySelector("#importFile"),
  status: document.querySelector("#status")
};

let settings = await getSettings();
render(settings);
await syncBookmarkPermissionState();

for (const item of fields.navItems) {
  item.addEventListener("click", () => showView(item.dataset.viewTab));
}

fields.save.addEventListener("click", async () => {
  settings.debug = fields.debug.checked;
  settings.healPinnedOrderOnStartup = fields.healPinnedOrderOnStartup.checked;
  settings.includeBookmarksInCommandPalette = await reconcileBookmarkPermission(
    fields.includeBookmarksInCommandPalette.checked,
    { requestIfNeeded: true }
  );

  for (let slot = 1; slot <= 10; slot += 1) {
    const service = settings.services[`slot${slot}`];
    const defaultService = DEFAULT_SETTINGS.services[`slot${slot}`];
    const name = document.querySelector(`#slot${slot}Name`).value.trim();
    const url = normalizeUrl(document.querySelector(`#slot${slot}Url`).value.trim());
    const launchMode = document.querySelector(`#slot${slot}Mode`).value;
    const enabled = document.querySelector(`#slot${slot}Enabled`).checked && Boolean(url);

    service.enabled = enabled;
    service.name = name || defaultService.name;
    service.url = url;
    service.match = matchFromUrl(service.url);
    service.launchMode = launchMode;
    service.pinned = launchMode === "pinnedTab";
    service.windowPreference = launchMode === "popupWindow" ? "popup" : "current";
    service.popup = {
      left: toNumber(document.querySelector(`#slot${slot}Left`).value, defaultPopupFor(slot).left),
      top: toNumber(document.querySelector(`#slot${slot}Top`).value, defaultPopupFor(slot).top),
      width: toNumber(document.querySelector(`#slot${slot}Width`).value, defaultPopupFor(slot).width),
      height: toNumber(document.querySelector(`#slot${slot}Height`).value, defaultPopupFor(slot).height)
    };
  }

  settings.launcherEntries = readLauncherEntries();

  settings = await saveSettings(settings);
  chrome.runtime.sendMessage({ type: "workspace-manager:update-settings" });
  showStatus("Saved.");
});

for (const resetButton of fields.resetDefaults) {
  resetButton.addEventListener("click", resetToDefaults);
}

fields.exportSettings.addEventListener("click", () => {
  const payload = JSON.stringify(settings, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "keyboard-workspace-manager-settings.json";
  anchor.click();
  URL.revokeObjectURL(url);
  showStatus("Exported settings.");
});

fields.importSettings.addEventListener("click", () => {
  fields.importFile.click();
});

fields.includeBookmarksInCommandPalette.addEventListener("change", async () => {
  const requested = fields.includeBookmarksInCommandPalette.checked;
  const enabled = await reconcileBookmarkPermission(
    requested,
    { requestIfNeeded: true }
  );
  fields.includeBookmarksInCommandPalette.checked = enabled;

  if (enabled) {
    showStatus("Bookmark search enabled. Save to keep it.");
    return;
  }

  if (requested) {
    showStatus("Bookmark permission was not granted.");
    return;
  }

  const hasPermission = await chrome.permissions.contains({ permissions: ["bookmarks"] });
  showStatus(
    hasPermission
      ? "Chrome kept bookmark permission. Remove it in extension details."
      : "Bookmark search disabled and permission removed. Save to keep it."
  );
});

fields.importFile.addEventListener("change", async () => {
  const file = fields.importFile.files[0];
  if (!file) {
    return;
  }

  try {
    const imported = JSON.parse(await file.text());
    settings = await saveSettings(imported);
    render(settings);
    await syncBookmarkPermissionState();
    chrome.runtime.sendMessage({ type: "workspace-manager:update-settings" });
    showStatus("Imported settings.");
  } catch {
    showStatus("Import failed.");
  } finally {
    fields.importFile.value = "";
  }
});

fields.addLauncherEntry.addEventListener("click", () => {
  settings.launcherEntries = settings.launcherEntries || [];
  settings.launcherEntries.push(createLauncherEntry());
  render(settings);
  showStatus("Entry added. Save to keep it.");
});

fields.openChromeShortcuts.addEventListener("click", async () => {
  const shortcutsUrl = "chrome://extensions/shortcuts";

  try {
    await chrome.tabs.create({ url: shortcutsUrl });
    showStatus("Opening Chrome shortcuts.");
  } catch {
    try {
      await navigator.clipboard.writeText(shortcutsUrl);
      showStatus("Chrome blocked the page. URL copied.");
    } catch {
      showStatus(`Open manually: ${shortcutsUrl}`);
    }
  }
});

async function resetToDefaults() {
  await reconcileBookmarkPermission(false, { requestIfNeeded: false });
  await chrome.storage.sync.remove(STORAGE_KEYS.settings);
  settings = await getSettings();
  render(settings);
  await syncBookmarkPermissionState();
  chrome.runtime.sendMessage({ type: "workspace-manager:update-settings" });
  showStatus("Defaults restored.");
}

async function syncBookmarkPermissionState() {
  const hasPermission = await chrome.permissions.contains({ permissions: ["bookmarks"] });
  fields.includeBookmarksInCommandPalette.checked = Boolean(
    settings.includeBookmarksInCommandPalette && hasPermission
  );

  if (settings.includeBookmarksInCommandPalette && !hasPermission) {
    settings.includeBookmarksInCommandPalette = false;
    settings = await saveSettings(settings);
  }
}

async function reconcileBookmarkPermission(enabled, { requestIfNeeded }) {
  if (enabled) {
    const hasPermission = await chrome.permissions.contains({ permissions: ["bookmarks"] });
    if (hasPermission) {
      return true;
    }

    if (!requestIfNeeded) {
      return false;
    }

    return chrome.permissions.request({ permissions: ["bookmarks"] });
  }

  const hadPermission = await chrome.permissions.contains({ permissions: ["bookmarks"] });
  if (hadPermission) {
    await chrome.permissions.remove({ permissions: ["bookmarks"] });
  }

  const stillHasPermission = await chrome.permissions.contains({ permissions: ["bookmarks"] });
  return false;
}

function showView(viewName) {
  for (const item of fields.navItems) {
    item.classList.toggle("active", item.dataset.viewTab === viewName);
  }

  for (const view of fields.views) {
    const active = view.dataset.view === viewName;
    view.hidden = !active;
    view.classList.toggle("active", active);
  }
}

function render(nextSettings) {
  fields.debug.checked = nextSettings.debug;
  fields.healPinnedOrderOnStartup.checked = nextSettings.healPinnedOrderOnStartup;
  fields.includeBookmarksInCommandPalette.checked = Boolean(nextSettings.includeBookmarksInCommandPalette);
  renderSlots(nextSettings);
  renderLauncherEntries(nextSettings);
}

function renderSlots(nextSettings) {
  fields.slots.textContent = "";

  for (let slot = 1; slot <= 10; slot += 1) {
    const service = nextSettings.services[`slot${slot}`];
    const row = document.createElement("div");
    row.className = "slot";
    row.innerHTML = `
      <div class="slot-number">
        <span>Slot</span>
        <strong>${slot}</strong>
      </div>
      <label class="switch-control slot-enabled" title="Enable slot ${slot}">
        <input id="slot${slot}Enabled" type="checkbox">
        <span class="switch-track"></span>
      </label>
      <label class="slot-name">
        Name
        <input id="slot${slot}Name" type="text">
      </label>
      <label class="slot-url">
        URL
        <input id="slot${slot}Url" type="url">
      </label>
      <label class="slot-mode">
        Mode
        <select id="slot${slot}Mode">
          <option value="pinnedTab">Pinned tab</option>
          <option value="popupWindow">Floating window</option>
        </select>
      </label>
      <div id="slot${slot}Window" class="slot-window">
        <label>Left <input id="slot${slot}Left" type="number"></label>
        <label>Top <input id="slot${slot}Top" type="number"></label>
        <label>Width <input id="slot${slot}Width" type="number"></label>
        <label>Height <input id="slot${slot}Height" type="number"></label>
      </div>
      <div class="slot-actions">
        <button id="slot${slot}Edit" class="icon-button slot-edit" type="button" aria-label="Edit slot ${slot}" title="Edit slot ${slot}">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
          </svg>
        </button>
        <button id="slot${slot}Delete" class="icon-button slot-delete" type="button" aria-label="Delete slot ${slot}" title="Delete slot ${slot}">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M3 6h18"></path>
            <path d="M8 6V4h8v2"></path>
            <path d="M19 6l-1 14H6L5 6"></path>
            <path d="M10 11v5"></path>
            <path d="M14 11v5"></path>
          </svg>
        </button>
      </div>
    `;

    fields.slots.append(row);
    document.querySelector(`#slot${slot}Enabled`).checked = Boolean(service.enabled && service.url);
    document.querySelector(`#slot${slot}Name`).value = service.name;
    document.querySelector(`#slot${slot}Url`).value = service.url;
    document.querySelector(`#slot${slot}Mode`).value = service.launchMode || "pinnedTab";
    document.querySelector(`#slot${slot}Left`).value = service.popup?.left ?? defaultPopupFor(slot).left;
    document.querySelector(`#slot${slot}Top`).value = service.popup?.top ?? defaultPopupFor(slot).top;
    document.querySelector(`#slot${slot}Width`).value = service.popup?.width ?? defaultPopupFor(slot).width;
    document.querySelector(`#slot${slot}Height`).value = service.popup?.height ?? defaultPopupFor(slot).height;
    updateWindowFields(slot);

    document.querySelector(`#slot${slot}Mode`).addEventListener("change", () => updateWindowFields(slot));
    document.querySelector(`#slot${slot}Edit`).addEventListener("click", () => {
      row.classList.add("is-editing");
      document.querySelector(`#slot${slot}Name`).focus();
      showStatus(`Slot ${slot} ready to edit.`);
    });
    document.querySelector(`#slot${slot}Delete`).addEventListener("click", () => {
      document.querySelector(`#slot${slot}Enabled`).checked = false;
      document.querySelector(`#slot${slot}Name`).value = DEFAULT_SETTINGS.services[`slot${slot}`].name;
      document.querySelector(`#slot${slot}Url`).value = "";
      document.querySelector(`#slot${slot}Mode`).value = "pinnedTab";
      updateWindowFields(slot);
      showStatus(`Slot ${slot} cleared. Save to keep it.`);
    });
  }
}

function renderLauncherEntries(nextSettings) {
  fields.launcherEntries.textContent = "";

  for (const entry of nextSettings.launcherEntries || []) {
    const row = document.createElement("div");
    row.className = "launcher-entry";
    row.dataset.entryId = entry.id;
    row.innerHTML = `
      <label class="launcher-enabled">
        <input id="${entry.id}Enabled" data-entry-field="enabled" type="checkbox">
        Enabled
      </label>
      <label class="launcher-name">
        Name
        <input id="${entry.id}Name" data-entry-field="name" type="text">
      </label>
      <label class="launcher-url">
        URL
        <input id="${entry.id}Url" data-entry-field="url" type="url">
      </label>
      <label class="launcher-tags">
        Tags
        <input id="${entry.id}Tags" data-entry-field="tags" type="text" placeholder="work, docs, finance">
      </label>
      <label class="launcher-mode">
        Mode
        <select id="${entry.id}Mode" data-entry-field="launchMode">
          <option value="pinnedTab">Regular tab</option>
          <option value="popupWindow">Floating window</option>
        </select>
      </label>
      <button id="${entry.id}Reset" class="icon-button launcher-reset" type="button" aria-label="Delete launcher entry" title="Delete launcher entry">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M3 6h18"></path>
          <path d="M8 6V4h8v2"></path>
          <path d="M19 6l-1 14H6L5 6"></path>
          <path d="M10 11v5"></path>
          <path d="M14 11v5"></path>
        </svg>
      </button>
      <div id="${entry.id}Window" class="launcher-window">
        <label>Left <input id="${entry.id}Left" data-entry-field="left" type="number"></label>
        <label>Top <input id="${entry.id}Top" data-entry-field="top" type="number"></label>
        <label>Width <input id="${entry.id}Width" data-entry-field="width" type="number"></label>
        <label>Height <input id="${entry.id}Height" data-entry-field="height" type="number"></label>
      </div>
    `;

    fields.launcherEntries.append(row);
    row.querySelector(`[data-entry-field="enabled"]`).checked = Boolean(entry.enabled && entry.url);
    row.querySelector(`[data-entry-field="name"]`).value = entry.name || "";
    row.querySelector(`[data-entry-field="url"]`).value = entry.url || "";
    row.querySelector(`[data-entry-field="tags"]`).value = (entry.tags || []).join(", ");
    row.querySelector(`[data-entry-field="launchMode"]`).value = entry.launchMode || "pinnedTab";
    row.querySelector(`[data-entry-field="left"]`).value = entry.popup?.left ?? 120;
    row.querySelector(`[data-entry-field="top"]`).value = entry.popup?.top ?? 80;
    row.querySelector(`[data-entry-field="width"]`).value = entry.popup?.width ?? 520;
    row.querySelector(`[data-entry-field="height"]`).value = entry.popup?.height ?? 720;
    updateLauncherWindowFields(row);

    row.querySelector(`[data-entry-field="launchMode"]`).addEventListener("change", () => updateLauncherWindowFields(row));
    row.querySelector(`#${entry.id}Reset`).addEventListener("click", () => {
      settings.launcherEntries = (settings.launcherEntries || []).filter((candidate) => candidate.id !== entry.id);
      render(settings);
      showStatus("Entry deleted. Save to keep it.");
    });
  }
}

function readLauncherEntries() {
  return [...fields.launcherEntries.querySelectorAll(".launcher-entry")].map((row) => {
    const id = row.dataset.entryId;
    const url = normalizeUrl(row.querySelector(`[data-entry-field="url"]`).value.trim());
    const launchMode = row.querySelector(`[data-entry-field="launchMode"]`).value;

    return {
      id,
      enabled: row.querySelector(`[data-entry-field="enabled"]`).checked && Boolean(url),
      name: row.querySelector(`[data-entry-field="name"]`).value.trim() || "Untitled",
      url,
      match: matchFromUrl(url),
      launchMode,
      pinned: false,
      pinnedIndex: null,
      windowPreference: launchMode === "popupWindow" ? "popup" : "current",
      popup: {
        left: toNumber(row.querySelector(`[data-entry-field="left"]`).value, 120),
        top: toNumber(row.querySelector(`[data-entry-field="top"]`).value, 80),
        width: toNumber(row.querySelector(`[data-entry-field="width"]`).value, 520),
        height: toNumber(row.querySelector(`[data-entry-field="height"]`).value, 720)
      },
      tags: row.querySelector(`[data-entry-field="tags"]`).value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    };
  });
}

function createLauncherEntry() {
  return {
    id: `launcher-${Date.now().toString(36)}`,
    enabled: false,
    name: "New Entry",
    url: "",
    match: {
      hosts: [],
      pathPrefixes: ["/"]
    },
    launchMode: "pinnedTab",
    pinned: false,
    pinnedIndex: null,
    windowPreference: "current",
    popup: {
      left: 120,
      top: 80,
      width: 520,
      height: 720
    },
    tags: []
  };
}

function matchFromUrl(value) {
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Unsupported URL protocol");
    }

    return {
      hosts: [parsed.hostname],
      pathPrefixes: [pathPrefixFor(parsed.pathname)]
    };
  } catch {
    return {
      hosts: [],
      pathPrefixes: ["/"]
    };
  }
}

function normalizeUrl(value) {
  if (!value) {
    return "";
  }

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const parsed = new URL(withProtocol);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

function pathPrefixFor(pathname) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  const parts = pathname.split("/").filter(Boolean);
  return parts.length ? `/${parts[0]}` : "/";
}

function toNumber(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function showStatus(text) {
  fields.status.textContent = text;
  setTimeout(() => {
    fields.status.textContent = "";
  }, 1800);
}

function updateWindowFields(slot) {
  const mode = document.querySelector(`#slot${slot}Mode`).value;
  const windowFields = document.querySelector(`#slot${slot}Window`);
  const disabled = mode !== "popupWindow";
  windowFields.classList.toggle("is-disabled", disabled);
  for (const input of windowFields.querySelectorAll("input")) {
    input.disabled = disabled;
  }
}

function updateLauncherWindowFields(row) {
  const mode = row.querySelector(`[data-entry-field="launchMode"]`).value;
  row.querySelector(".launcher-window").hidden = mode !== "popupWindow";
}

function defaultPopupFor(slot) {
  return {
    left: 120 + (slot - 1) * 24,
    top: 80 + (slot - 1) * 24,
    width: 520,
    height: 860
  };
}
