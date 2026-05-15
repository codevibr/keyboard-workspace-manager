import { log } from "./logger.js";
import { findMatchingTabs, chooseBestMatch } from "./tabMatcher.js";
import { urlForCreate } from "./urlUtils.js";
import { focusWindow, getCurrentWindowId, popupCreateOptions } from "./windowUtils.js";

export async function focusOrCreateService(service, settings, options = {}) {
  if (service.launchMode === "popupWindow" || service.windowPreference === "popup") {
    return focusOrCreatePopup(service, settings, options);
  }

  const currentWindowId = await getCurrentWindowId();
  const matches = options.forceNew ? [] : await findMatchingTabs(service, settings);
  const selected = chooseBestMatch(matches, service, currentWindowId, settings);

  if (selected) {
    log("Tab found", describeTab(selected.tab, service));
    await focusExistingTab(selected.tab, service, settings);
    if (settings?.healPinnedOrderOnStartup) {
      await healPinnedServices(settings, selected.tab.windowId);
    }
    return selected.tab;
  }

  log("No matching tab found; creating", { service: service.name });
  const created = await createTab(service, currentWindowId, settings);
  if (settings?.healPinnedOrderOnStartup) {
    await healPinnedServices(settings, created.windowId);
  }
  return created;
}

export async function focusOrCreatePopup(service, settings, options = {}) {
  const currentWindowId = await getCurrentWindowId();
  const matches = options.forceNew ? [] : await findMatchingTabs(service, settings);
  const selected = chooseBestMatch(matches, service, currentWindowId, settings);

  if (selected && selected.window.type === "popup") {
    log("Popup window found", describeTab(selected.tab, service));
    await focusWindow(selected.window.id);
    await chrome.tabs.update(selected.tab.id, { active: true });
    return selected.tab;
  }

  log("Creating popup window", { service: service.name, popup: service.popup });
  const createdWindow = await chrome.windows.create(popupCreateOptions(service));
  return createdWindow.tabs?.[0] || null;
}

export async function focusExistingTab(tab, service, settings) {
  await focusWindow(tab.windowId);
  await chrome.tabs.update(tab.id, { active: true, pinned: Boolean(service.pinned) });
  log("Window focused and tab activated", describeTab(tab, service));

  if (service.pinned && Number.isInteger(service.pinnedIndex)) {
    await moveTabToPinnedIndex(tab.id, effectivePinnedIndex(service, settings));
  }
}

export async function createTab(service, windowId, settings) {
  const createProperties = {
    url: urlForCreate(service),
    active: true,
    pinned: Boolean(service.pinned)
  };

  if (Number.isInteger(windowId)) {
    createProperties.windowId = windowId;
  }

  const tab = await chrome.tabs.create(createProperties);

  log("Tab created", describeTab(tab, service));

  if (service.pinned && Number.isInteger(service.pinnedIndex)) {
    await moveTabToPinnedIndex(tab.id, effectivePinnedIndex(service, settings));
  }

  return tab;
}

export async function healPinnedServices(settings, windowId) {
  const services = Object.values(settings.services)
    .filter((service) => isPinnedTabService(service))
    .sort((a, b) => a.pinnedIndex - b.pinnedIndex);

  for (const [index, service] of services.entries()) {
    const matches = await findMatchingTabs(service, settings);
    const match = matches.find((candidate) => candidate.tab.windowId === windowId);
    if (!match) {
      continue;
    }

    await chrome.tabs.update(match.tab.id, { pinned: true });
    await moveTabToPinnedIndex(match.tab.id, index);
  }
}

function effectivePinnedIndex(service, settings) {
  if (!settings) {
    return service.pinnedIndex;
  }

  const services = Object.values(settings.services)
    .filter((candidate) => isPinnedTabService(candidate))
    .sort((a, b) => a.pinnedIndex - b.pinnedIndex);

  const index = services.findIndex((candidate) => candidate.id === service.id);
  return index >= 0 ? index : service.pinnedIndex;
}

function isPinnedTabService(service) {
  return Boolean(
    service?.enabled &&
    service.url &&
    service.pinned &&
    service.launchMode !== "popupWindow" &&
    Number.isInteger(service.pinnedIndex)
  );
}

async function moveTabToPinnedIndex(tabId, index) {
  await chrome.tabs.move(tabId, { index });
  log("Tab moved", { tabId, index });
}

function describeTab(tab, service) {
  return {
    service: service.name,
    tabId: tab?.id,
    windowId: tab?.windowId,
    index: tab?.index,
    pinned: tab?.pinned,
    url: tab?.url
  };
}
