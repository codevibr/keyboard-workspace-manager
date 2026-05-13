import { getSettings } from "../src/storage.js";

const fields = {
  openOptions: document.querySelector("#openOptions"),
  query: document.querySelector("#query"),
  resultsSection: document.querySelector("#resultsSection"),
  results: document.querySelector("#results"),
  emptyState: document.querySelector("#emptyState")
};

const settings = await getSettings();
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
  const entries = [
    ...launcherEntries(query),
    ...keyboardEntries(query),
    ...(await openTabEntries(query)),
    ...(await bookmarkEntries(query))
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

function launcherEntries(query) {
  return (settings.launcherEntries || [])
    .filter((entry) => entry.enabled && entry.url)
    .map((entry) => ({
      ...entry,
      entryType: "configured",
      label: "Launcher",
      tags: ["launcher", ...(entry.tags || [])]
    }))
    .filter((entry) => matchesQuery(entry, query));
}

function keyboardEntries(query) {
  return Object.values(settings.services || {})
    .filter((service) => service.slot && service.enabled && service.url)
    .sort((a, b) => a.slot - b.slot)
    .map((service) => ({
      ...service,
      entryType: "configured",
      label: `Slot ${service.slot}`,
      tags: [`slot ${service.slot}`]
    }))
    .filter((entry) => matchesQuery(entry, query));
}

async function openTabEntries(query) {
  if (!query) {
    return [];
  }

  const tabs = await chrome.tabs.query({});
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


function renderEntries(container, entries) {
  container.textContent = "";

  for (const entry of entries) {
    const row = document.createElement("button");
    row.className = "entry";
    row.type = "button";
    row.dataset.entryId = entry.id;
    row.innerHTML = `
      <div>
        <div class="entry-title">
          <span class="entry-name"></span>
          <span class="mode"></span>
        </div>
        <div class="entry-url"></div>
        <div class="entry-tags"></div>
      </div>
    `;

    row.querySelector(".entry-name").textContent = entry.name || "Untitled";
    row.querySelector(".mode").textContent = modeLabel(entry);
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

  if (entry.entryType === "openTab") {
    return "Open tab";
  }

  return entry.launchMode === "popupWindow" ? "Window" : "Tab";
}
