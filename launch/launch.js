import { parseLaunchOverrides } from "../src/launchOverrides.js";

const status = document.querySelector("#status");
const params = new URLSearchParams(location.search);
const alias = params.get("alias") || params.get("a") || "";

if (!alias.trim()) {
  status.textContent = "Missing alias.";
} else {
  launchAlias(alias.trim());
}

async function launchAlias(aliasValue) {
  const response = await chrome.runtime.sendMessage({
    type: "workspace-manager:launch-alias",
    alias: aliasValue,
    overrides: parseLaunchOverrides(params)
  });

  if (!response?.ok) {
    status.textContent = response?.error || `No workspace found for "${aliasValue}".`;
    return;
  }

  status.textContent = `Launched ${response.entry?.name || aliasValue}.`;
  closeLaunchTabSoon();
}

async function closeLaunchTabSoon() {
  const tab = await chrome.tabs.getCurrent();
  if (!tab?.id) {
    return;
  }

  setTimeout(() => chrome.tabs.remove(tab.id), 450);
}
