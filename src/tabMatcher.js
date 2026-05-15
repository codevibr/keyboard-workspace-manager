import { serviceMatchScore, tabMatchesService } from "./urlUtils.js";
import { isPopupWindow } from "./windowUtils.js";

export async function findMatchingTabs(service, settings) {
  const windows = await chrome.windows.getAll({ populate: true, windowTypes: ["normal", "popup"] });
  const matches = [];
  const competitors = matchCompetitors(settings);

  for (const window of windows) {
    for (const tab of window.tabs || []) {
      if (tabMatchesService(tab, service, competitors)) {
        matches.push({ tab, window });
      }
    }
  }

  return matches;
}

export function chooseBestMatch(matches, service, currentWindowId, settings) {
  if (!matches.length) {
    return null;
  }

  const wantsPopup = service.windowPreference === "popup";
  const competitors = matchCompetitors(settings);

  return [...matches].sort((a, b) => {
    const matchScoreA = serviceMatchScore(a.tab, service, competitors);
    const matchScoreB = serviceMatchScore(b.tab, service, competitors);
    if (matchScoreA !== matchScoreB) {
      return matchScoreB - matchScoreA;
    }

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

function matchCompetitors(settings) {
  if (!settings) {
    return [];
  }

  return [
    ...Object.values(settings.services || {}),
    ...(settings.launcherEntries || [])
  ];
}
