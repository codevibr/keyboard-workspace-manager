import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../src/config.js";
import { getSettings, saveSettings } from "../src/storage.js";

const fields = {
  debug: document.querySelector("#debug"),
  healPinnedOrderOnStartup: document.querySelector("#healPinnedOrderOnStartup"),
  slots: document.querySelector("#slots"),
  panelLeft: document.querySelector("#panelLeft"),
  panelTop: document.querySelector("#panelTop"),
  panelWidth: document.querySelector("#panelWidth"),
  panelHeight: document.querySelector("#panelHeight"),
  save: document.querySelector("#save"),
  reset: document.querySelector("#reset"),
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
    const url = document.querySelector(`#slot${slot}Url`).value.trim();

    service.name = name || defaultService.name;
    service.url = url || defaultService.url;
    service.match = matchFromUrl(service.url);
  }

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

function render(nextSettings) {
  fields.debug.checked = nextSettings.debug;
  fields.healPinnedOrderOnStartup.checked = nextSettings.healPinnedOrderOnStartup;
  renderSlots(nextSettings);
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
      <label>
        Name
        <input id="slot${slot}Name" type="text">
      </label>
      <label>
        URL
        <input id="slot${slot}Url" type="url">
      </label>
    `;

    fields.slots.append(row);
    document.querySelector(`#slot${slot}Name`).value = service.name;
    document.querySelector(`#slot${slot}Url`).value = service.url;
  }
}

function matchFromUrl(value) {
  try {
    const parsed = new URL(value);
    return {
      hosts: [parsed.hostname],
      pathPrefixes: [pathPrefixFor(parsed.pathname)]
    };
  } catch {
    return {
      hosts: ["example.com"],
      pathPrefixes: ["/"]
    };
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
