import { routeCommand } from "./commandRouter.js";
import { setDebug, log, warn } from "./logger.js";
import { getSettings } from "./storage.js";
import { focusOrCreateService, healPinnedServices } from "./tabManager.js";

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
    if (command === "open-command-palette") {
      await openCommandPalette();
      return;
    }

    const settings = await getSettings();
    setDebug(settings.debug);
    await routeCommand(command, settings);
    await updateBadge(settings);
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "workspace-manager:update-settings") {
    runSafely(async () => {
      const settings = await getSettings();
      setDebug(settings.debug);
      await updateBadge(settings);
      sendResponse({ ok: true });
    });

    return true;
  }

  if (message?.type === "workspace-manager:launch-entry") {
    runSafely(async () => {
      const settings = await getSettings();
      setDebug(settings.debug);
      const entry = [...(settings.launcherEntries || []), ...Object.values(settings.services || {})]
        .find((candidate) => candidate.id === message.entryId);

      if (!entry?.enabled || !entry.url) {
        sendResponse({ ok: false, error: "Entry is disabled or missing a URL." });
        return;
      }

      await focusOrCreateService(entry, settings);
      sendResponse({ ok: true });
    });

    return true;
  }

  return false;
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
  await chrome.action.setBadgeText({ text: "" });
  await chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
}

async function openCommandPalette() {
  if (!chrome.action?.openPopup) {
    warn("Command palette popup is not available in this Chrome version");
    return;
  }

  const targetWindow = await getCommandPaletteWindow();
  if (!targetWindow?.id) {
    warn("No normal Chrome window is available for the command palette popup");
    return;
  }

  await chrome.windows.update(targetWindow.id, { focused: true });
  await chrome.action.openPopup({ windowId: targetWindow.id });
  log("Command palette action popup opened", { windowId: targetWindow.id });
}

async function getCommandPaletteWindow() {
  const windows = await chrome.windows.getAll({ windowTypes: ["normal"] });
  const focused = windows.find((candidate) => candidate.focused);
  if (focused) {
    return focused;
  }

  const [firstNormalWindow] = windows;
  return firstNormalWindow || null;
}

function runSafely(task) {
  task().catch((error) => {
    warn("Unexpected error", {
      message: error?.message,
      stack: error?.stack
    });
  });
}
