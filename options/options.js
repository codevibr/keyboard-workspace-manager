import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../src/config.js";
import { getSettings, saveSettings } from "../src/storage.js";

const fields = {
  debug: document.querySelector("#debug"),
  healPinnedOrderOnStartup: document.querySelector("#healPinnedOrderOnStartup"),
  slots: document.querySelector("#slots"),
  panelEnabled: document.querySelector("#panelEnabled"),
  panelName: document.querySelector("#panelName"),
  panelUrl: document.querySelector("#panelUrl"),
  panelLeft: document.querySelector("#panelLeft"),
  panelTop: document.querySelector("#panelTop"),
  panelWidth: document.querySelector("#panelWidth"),
  panelHeight: document.querySelector("#panelHeight"),
  save: document.querySelector("#save"),
  reset: document.querySelector("#reset"),
  exportSettings: document.querySelector("#exportSettings"),
  importSettings: document.querySelector("#importSettings"),
  importFile: document.querySelector("#importFile"),
  status: document.querySelector("#status")
};

let settings = await getSettings();
render(settings);

fields.save.addEventListener("click", async () => {
  settings.debug = fields.debug.checked;
  settings.healPinnedOrderOnStartup = fields.healPinnedOrderOnStartup.checked;

  for (let slot = 1; slot <= 9; slot += 1) {
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

  const panelUrl = normalizeUrl(fields.panelUrl.value.trim());
  settings.services.chatgptPanel.enabled = fields.panelEnabled.checked && Boolean(panelUrl);
  settings.services.chatgptPanel.name = fields.panelName.value.trim() || DEFAULT_SETTINGS.services.chatgptPanel.name;
  settings.services.chatgptPanel.url = panelUrl;
  settings.services.chatgptPanel.match = matchFromUrl(settings.services.chatgptPanel.url);
  settings.services.chatgptPanel.launchMode = "popupWindow";
  settings.services.chatgptPanel.windowPreference = "popup";
  settings.services.chatgptPanel.popup.left = toNumber(fields.panelLeft.value, DEFAULT_SETTINGS.services.chatgptPanel.popup.left);
  settings.services.chatgptPanel.popup.top = toNumber(fields.panelTop.value, DEFAULT_SETTINGS.services.chatgptPanel.popup.top);
  settings.services.chatgptPanel.popup.width = toNumber(fields.panelWidth.value, DEFAULT_SETTINGS.services.chatgptPanel.popup.width);
  settings.services.chatgptPanel.popup.height = toNumber(fields.panelHeight.value, DEFAULT_SETTINGS.services.chatgptPanel.popup.height);

  settings = await saveSettings(settings);
  chrome.runtime.sendMessage({ type: "workspace-manager:update-settings" });
  showStatus("Saved.");
});

fields.reset.addEventListener("click", async () => {
  await chrome.storage.sync.remove(STORAGE_KEYS.settings);
  settings = await getSettings();
  render(settings);
  chrome.runtime.sendMessage({ type: "workspace-manager:update-settings" });
  showStatus("Defaults restored.");
});

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

fields.importFile.addEventListener("change", async () => {
  const file = fields.importFile.files[0];
  if (!file) {
    return;
  }

  try {
    const imported = JSON.parse(await file.text());
    settings = await saveSettings(imported);
    render(settings);
    chrome.runtime.sendMessage({ type: "workspace-manager:update-settings" });
    showStatus("Imported settings.");
  } catch {
    showStatus("Import failed.");
  } finally {
    fields.importFile.value = "";
  }
});

function render(nextSettings) {
  fields.debug.checked = nextSettings.debug;
  fields.healPinnedOrderOnStartup.checked = nextSettings.healPinnedOrderOnStartup;
  renderSlots(nextSettings);
  fields.panelEnabled.checked = Boolean(nextSettings.services.chatgptPanel.enabled && nextSettings.services.chatgptPanel.url);
  fields.panelName.value = nextSettings.services.chatgptPanel.name;
  fields.panelUrl.value = nextSettings.services.chatgptPanel.url;
  fields.panelLeft.value = nextSettings.services.chatgptPanel.popup.left;
  fields.panelTop.value = nextSettings.services.chatgptPanel.popup.top;
  fields.panelWidth.value = nextSettings.services.chatgptPanel.popup.width;
  fields.panelHeight.value = nextSettings.services.chatgptPanel.popup.height;
}

function renderSlots(nextSettings) {
  fields.slots.textContent = "";

  for (let slot = 1; slot <= 9; slot += 1) {
    const service = nextSettings.services[`slot${slot}`];
    const row = document.createElement("div");
    row.className = "slot";
    row.innerHTML = `
      <div class="slot-number">Slot ${slot}</div>
      <label class="slot-enabled">
        <input id="slot${slot}Enabled" type="checkbox">
        Enabled
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
      <button id="slot${slot}Reset" class="slot-reset" type="button">Reset</button>
      <div id="slot${slot}Window" class="slot-window">
        <label>Left <input id="slot${slot}Left" type="number"></label>
        <label>Top <input id="slot${slot}Top" type="number"></label>
        <label>Width <input id="slot${slot}Width" type="number"></label>
        <label>Height <input id="slot${slot}Height" type="number"></label>
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
    document.querySelector(`#slot${slot}Reset`).addEventListener("click", () => {
      settings.services[`slot${slot}`] = structuredClone(DEFAULT_SETTINGS.services[`slot${slot}`]);
      render(settings);
      showStatus(`Slot ${slot} reset. Save to keep it.`);
    });
  }
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
  document.querySelector(`#slot${slot}Window`).hidden = mode !== "popupWindow";
}

function defaultPopupFor(slot) {
  return {
    left: 120 + (slot - 1) * 24,
    top: 80 + (slot - 1) * 24,
    width: 520,
    height: 860
  };
}
