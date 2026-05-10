import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../src/config.js";
import { getSettings, saveSettings } from "../src/storage.js";

const fields = {
  debug: document.querySelector("#debug"),
  healPinnedOrderOnStartup: document.querySelector("#healPinnedOrderOnStartup"),
  notifyUrl: document.querySelector("#notifyUrl"),
  notifyHost: document.querySelector("#notifyHost"),
  notifyPathPrefix: document.querySelector("#notifyPathPrefix"),
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
  settings.services.notify.url = fields.notifyUrl.value.trim() || DEFAULT_SETTINGS.services.notify.url;
  settings.services.notify.match.hosts = [fields.notifyHost.value.trim() || "example.com"];
  settings.services.notify.match.pathPrefixes = [fields.notifyPathPrefix.value.trim() || "/notify"];
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
  fields.notifyUrl.value = nextSettings.services.notify.url;
  fields.notifyHost.value = nextSettings.services.notify.match.hosts[0] || "";
  fields.notifyPathPrefix.value = nextSettings.services.notify.match.pathPrefixes[0] || "/";
  fields.panelLeft.value = nextSettings.services.chatgptPanel.popup.left;
  fields.panelTop.value = nextSettings.services.chatgptPanel.popup.top;
  fields.panelWidth.value = nextSettings.services.chatgptPanel.popup.width;
  fields.panelHeight.value = nextSettings.services.chatgptPanel.popup.height;
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
