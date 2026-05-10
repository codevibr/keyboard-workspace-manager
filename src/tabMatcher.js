import { tabMatchesService } from "./urlUtils.js";
import { isPopupWindow } from "./windowUtils.js";

export async function findMatchingTabs(service) {
  const windows = await chrome.windows.getAll({ populate: true, windowTypes: ["normal", "popup"] });
  const matches = [];

  for (const window of windows) {
    for (const tab of window.tabs || []) {
      if (tabMatchesService(tab, service)) {
        matches.push({ tab, window });
      }
    }
  }

  return matches;
}

export function chooseBestMatch(matches, service, currentWindowId) {
  if (!matches.length) {
    return null;
  }

  const wantsPopup = service.windowPreference === "popup";

  return [...matches].sort((a, b) => {
    const popupScoreA = wantsPopup && isPopupWindow(a.window) ? 1 : 0;
    const popupScoreB = wantsPopup && isPopupWindow(b.window) ? 1 : 0;
    if (popupScoreA !== popupScoreB) {
      return popupScoreB - popupScoreA;
    }

    const pinnedScoreA = a.tab.pinned ? 1 : 0;
    const pinnedScoreB = b.tab.pinned ? 1 : 0;
    if (pinnedScoreA !== pinnedScoreB) {
      return pinnedScoreB - pinnedScoreA;
    }

    const activeScoreA = a.tab.active ? 1 : 0;
    const activeScoreB = b.tab.active ? 1 : 0;
    if (activeScoreA !== activeScoreB) {
      return activeScoreB - activeScoreA;
    }

    const currentWindowScoreA = a.window.id === currentWindowId ? 1 : 0;
    const currentWindowScoreB = b.window.id === currentWindowId ? 1 : 0;
    if (currentWindowScoreA !== currentWindowScoreB) {
      return currentWindowScoreB - currentWindowScoreA;
    }

    return (b.tab.lastAccessed || 0) - (a.tab.lastAccessed || 0);
  })[0];
}
