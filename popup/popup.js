import { getSettings } from "../src/storage.js";
import { applyTheme, watchSystemTheme } from "../src/theme.js";
import { serviceMatchScore } from "../src/urlUtils.js";

const fields = {
  openOptions: document.querySelector("#openOptions"),
  query: document.querySelector("#query"),
  resultsSection: document.querySelector("#resultsSection"),
  results: document.querySelector("#results"),
  emptyState: document.querySelector("#emptyState")
};

const settings = await getSettings();
applyTheme(settings);
watchSystemTheme(() => settings);
let visibleEntries = [];
let selectedIndex = 0;
let renderVersion = 0;

fields.openOptions.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

fields.query.addEventListener("input", () => {
  selectedIndex = 0;
  render();
});

fields.query.addEventListener("keydown", async (event) => {
  if (visibleEntries.length === 0) {
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    selectedIndex = Math.min(selectedIndex + 1, visibleEntries.length - 1);
    updateSelectedEntry();
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    selectedIndex = Math.max(selectedIndex - 1, 0);
    updateSelectedEntry();
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    await launchEntry(visibleEntries[selectedIndex]);
  }
});

render();
fields.query.focus();

async function render() {
  const version = ++renderVersion;
  const query = fields.query.value.trim().toLowerCase();
  const tabs = await chrome.tabs.query({});
  const entries = [
    ...launcherEntries(query, tabs),
    ...keyboardEntries(query, tabs),
    ...(await openTabEntries(query, tabs)),
    ...(await bookmarkEntries(query)),
    ...searchEntries(query)
  ];

  if (version !== renderVersion) {
    return;
  }

  visibleEntries = entries;
  selectedIndex = Math.min(selectedIndex, Math.max(visibleEntries.length - 1, 0));
  renderEntries(fields.results, visibleEntries);
  updateSelectedEntry();

  fields.resultsSection.hidden = visibleEntries.length === 0;
  fields.emptyState.hidden = visibleEntries.length > 0;
}

function launcherEntries(query, tabs) {
  return (settings.launcherEntries || [])
    .filter((entry) => entry.enabled && entry.url)
    .map((entry) => ({
      ...entry,
      entryType: "configured",
      favIconUrl: faviconForConfiguredEntry(entry, tabs, configuredEntries()),
      label: "Launcher",
      tags: ["launcher", ...(entry.tags || [])]
    }))
    .filter((entry) => matchesQuery(entry, query));
}

function keyboardEntries(query, tabs) {
  return Object.values(settings.services || {})
    .filter((service) => service.slot && service.enabled && service.url)
    .sort((a, b) => a.slot - b.slot)
    .map((service) => ({
      ...service,
      entryType: "configured",
      favIconUrl: faviconForConfiguredEntry(service, tabs, configuredEntries()),
      label: `Slot ${service.slot}`,
      tags: [`slot ${service.slot}`]
    }))
    .filter((entry) => matchesQuery(entry, query));
}

async function openTabEntries(query, tabs) {
  if (!query) {
    return [];
  }

  const windows = await chrome.windows.getAll();
  const windowsById = new Map(windows.map((window) => [window.id, window]));

  return tabs
    .filter((tab) => tab.url && matchesOpenTab(tab, query))
    .map((tab) => {
      const window = windowsById.get(tab.windowId);
      const isPopupWindow = window?.type === "popup";

      return {
        id: `open-tab-${tab.id}`,
        entryType: "openTab",
        tabId: tab.id,
        windowId: tab.windowId,
        name: tab.title || tab.url,
        url: tab.url,
        favIconUrl: tab.favIconUrl || "",
        label: isPopupWindow ? "Floating window" : "Open tab",
        tags: [isPopupWindow ? "floating window" : "open tab"]
      };
    });
}

async function bookmarkEntries(query) {
  if (!query || !settings.includeBookmarksInCommandPalette) {
    return [];
  }

  const hasPermission = await chrome.permissions.contains({ permissions: ["bookmarks"] });
  if (!hasPermission || !chrome.bookmarks?.search) {
    return [];
  }

  const bookmarks = await chrome.bookmarks.search(query);
  return bookmarks
    .filter((bookmark) => bookmark.url && matchesBookmark(bookmark, query))
    .slice(0, 20)
    .map((bookmark) => ({
      id: `bookmark-${bookmark.id}`,
      entryType: "bookmark",
      name: bookmark.title || bookmark.url,
      url: bookmark.url,
      label: "Bookmark",
      tags: ["bookmark"]
    }));
}

function searchEntries(query) {
  const text = fields.query.value.trim();
  if (!query || !text) {
    return [];
  }

  return [{
    id: `search-${query}`,
    entryType: "search",
    name: `Search the web for "${text}"`,
    url: text,
    label: "Search",
    tags: ["search"]
  }];
}


function renderEntries(container, entries) {
  container.textContent = "";

  for (const entry of entries) {
    const row = document.createElement("button");
    row.className = "entry";
    row.type = "button";
    row.dataset.entryId = entry.id;
    row.innerHTML = `
      <span class="entry-icon" aria-hidden="true"></span>
      <div class="entry-content">
        <div class="entry-title">
          <span class="entry-name"></span>
          <span class="mode"></span>
        </div>
        <div class="entry-meta"></div>
        <div class="entry-url"></div>
        <div class="entry-tags"></div>
      </div>
    `;

    renderEntryIcon(row.querySelector(".entry-icon"), entry);
    row.querySelector(".entry-name").textContent = entry.name || "Untitled";
    row.querySelector(".mode").textContent = modeLabel(entry);
    row.querySelector(".entry-meta").textContent = entrySubtitle(entry);
    row.querySelector(".entry-url").textContent = entry.url;

    const tags = row.querySelector(".entry-tags");
    for (const tag of entry.tags || []) {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = tag;
      tags.append(chip);
    }

    row.addEventListener("click", () => launchEntry(entry));
    container.append(row);
  }
}

function updateSelectedEntry() {
  const rows = [...document.querySelectorAll(".entry")];

  for (const row of rows) {
    row.classList.remove("selected");
    row.removeAttribute("aria-current");
  }

  const selected = visibleEntries[selectedIndex];
  if (!selected) {
    return;
  }

  const row = rows.find((candidate) => candidate.dataset.entryId === selected.id);
  if (!row) {
    return;
  }

  row.classList.add("selected");
  row.setAttribute("aria-current", "true");
  row.scrollIntoView({ block: "nearest" });
}

async function launchEntry(entry) {
  if (entry.entryType === "bookmark") {
    await chrome.tabs.create({ url: entry.url, active: true });
    window.close();
    return;
  }

  if (entry.entryType === "search") {
    await chrome.search.query({ text: entry.url, disposition: "NEW_TAB" });
    window.close();
    return;
  }

  if (entry.entryType === "openTab") {
    await chrome.windows.update(entry.windowId, { focused: true });
    await chrome.tabs.update(entry.tabId, { active: true });
    window.close();
    return;
  }

  await chrome.runtime.sendMessage({
    type: "workspace-manager:launch-entry",
    entryId: entry.id
  });
  window.close();
}

function matchesQuery(entry, query) {
  if (!query) {
    return true;
  }

  return [
    entry.name,
    entry.alias,
    entry.url,
    entry.label,
    ...(entry.tags || [])
  ].some((value) => String(value || "").toLowerCase().includes(query));
}

function matchesOpenTab(tab, query) {
  return [tab.title, tab.url]
    .some((value) => String(value || "").toLowerCase().includes(query));
}

function matchesBookmark(bookmark, query) {
  return [bookmark.title, bookmark.url]
    .some((value) => String(value || "").toLowerCase().includes(query));
}

function modeLabel(entry) {
  if (entry.entryType === "bookmark") {
    return "Bookmark";
  }

  if (entry.entryType === "search") {
    return "Search";
  }

  if (entry.entryType === "openTab") {
    return entry.label;
  }

  return entry.launchMode === "popupWindow" ? "Window" : "Tab";
}

function renderEntryIcon(container, entry) {
  container.textContent = "";

  if (entry.favIconUrl) {
    const image = document.createElement("img");
    image.alt = "";
    image.src = entry.favIconUrl;
    image.addEventListener("error", () => {
      image.remove();
      container.innerHTML = iconForEntry(entry);
    }, { once: true });
    container.append(image);
    return;
  }

  container.innerHTML = iconForEntry(entry);
}

function entrySubtitle(entry) {
  if (entry.entryType === "bookmark") {
    return "Bookmark";
  }

  if (entry.entryType === "search") {
    return "Default search engine";
  }

  if (entry.entryType === "openTab") {
    return `${entry.label} • Window ${entry.windowId}`;
  }

  if (entry.slot) {
    return `Slot ${entry.slot} • ${launchModeLabel(entry)}`;
  }

  return `Launcher • ${launchModeLabel(entry)}`;
}

function iconForEntry(entry) {
  if (entry.entryType === "bookmark") {
    return `<svg viewBox="0 0 24 24"><path d="M6 4h12v17l-6-4-6 4Z"></path></svg>`;
  }

  if (entry.entryType === "search") {
    return `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>`;
  }

  if (entry.entryType === "openTab") {
    return `<svg viewBox="0 0 24 24"><path d="M4 5h16v12H4Z"></path><path d="M8 21h8"></path><path d="M12 17v4"></path></svg>`;
  }

  if (entry.launchMode === "popupWindow") {
    return `<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4Z"></path><path d="M9 9h6"></path><path d="M9 13h4"></path></svg>`;
  }

  if (entry.slot) {
    return `<svg viewBox="0 0 24 24"><path d="M5 7h14"></path><path d="M5 12h14"></path><path d="M5 17h14"></path></svg>`;
  }

  return `<svg viewBox="0 0 24 24"><path d="M5 12h11"></path><path d="m12 8 4 4-4 4"></path><path d="M19 5v14"></path></svg>`;
}

function launchModeLabel(entry) {
  if (entry.launchMode === "popupWindow") {
    return "Floating window";
  }

  if (entry.launchMode === "pinnedTab") {
    return entry.slot ? "Pinned tab" : "Regular tab";
  }

  return "Regular tab";
}

function configuredEntries() {
  return [
    ...Object.values(settings.services || {}),
    ...(settings.launcherEntries || [])
  ];
}

function faviconForConfiguredEntry(entry, tabs, competitors) {
  const matches = tabs
    .map((tab) => ({ tab, score: tab.favIconUrl ? serviceMatchScore(tab, entry, competitors) : 0 }))
    .filter((match) => match.score > 0)
    .sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }

      return Number(Boolean(b.tab.pinned)) - Number(Boolean(a.tab.pinned));
    });

  return matches[0]?.tab.favIconUrl || "";
}
