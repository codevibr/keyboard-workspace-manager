import { routeCommand } from "./commandRouter.js";
import { setDebug, log, warn } from "./logger.js";
import { getSettings } from "./storage.js";
import { healPinnedServices } from "./tabManager.js";

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await getSettings();
  setDebug(settings.debug);
  log("Extension installed or updated");
  await updateBadge(settings);
});

chrome.runtime.onStartup.addListener(async () => {
  const settings = await getSettings();
  setDebug(settings.debug);
  log("Browser startup");
  await updateBadge(settings);
});

chrome.commands.onCommand.addListener((command) => {
  runSafely(async () => {
    const settings = await getSettings();
    setDebug(settings.debug);
    await routeCommand(command, settings);
    await updateBadge(settings);
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "workspace-manager:update-settings") {
    return false;
  }

  runSafely(async () => {
    const settings = await getSettings();
    setDebug(settings.debug);
    await updateBadge(settings);
    sendResponse({ ok: true });
  });

  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.pinned) {
    return;
  }

  runSafely(async () => {
    const settings = await getSettings();
    setDebug(settings.debug);
    if (settings.healPinnedOrderOnStartup) {
      await healPinnedServices(settings, tab.windowId);
    }
  });
});

async function updateBadge(settings) {
  await chrome.action.setBadgeText({ text: settings.debug ? "DBG" : "" });
  await chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
}

function runSafely(task) {
  task().catch((error) => {
    warn("Unexpected error", {
      message: error?.message,
      stack: error?.stack
    });
  });
}
