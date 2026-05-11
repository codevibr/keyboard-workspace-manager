import { getSettings } from "../src/storage.js";

const fields = {
  openOptions: document.querySelector("#openOptions"),
  query: document.querySelector("#query"),
  keyboardSection: document.querySelector("#keyboardSection"),
  keyboardSlots: document.querySelector("#keyboardSlots"),
  launcherSection: document.querySelector("#launcherSection"),
  launcherEntries: document.querySelector("#launcherEntries"),
  emptyState: document.querySelector("#emptyState")
};

const settings = await getSettings();
let visibleEntries = [];
let selectedIndex = 0;

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

function render() {
  const query = fields.query.value.trim().toLowerCase();
  const keyboardEntries = Object.values(settings.services || {})
    .filter((service) => service.slot && service.enabled && service.url)
    .sort((a, b) => a.slot - b.slot)
    .map((service) => ({
      ...service,
      label: `Slot ${service.slot}`,
      tags: [`slot ${service.slot}`]
    }))
    .filter((entry) => matchesQuery(entry, query));

  const launcherEntries = (settings.launcherEntries || [])
    .filter((entry) => entry.enabled && entry.url)
    .filter((entry) => matchesQuery(entry, query));

  visibleEntries = [...launcherEntries, ...keyboardEntries];
  selectedIndex = Math.min(selectedIndex, Math.max(visibleEntries.length - 1, 0));
  renderEntries(fields.keyboardSlots, keyboardEntries);
  renderEntries(fields.launcherEntries, launcherEntries);
  updateSelectedEntry();

  fields.keyboardSection.hidden = keyboardEntries.length === 0;
  fields.launcherSection.hidden = launcherEntries.length === 0;
  fields.emptyState.hidden = keyboardEntries.length + launcherEntries.length > 0;
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
    row.querySelector(".mode").textContent = entry.launchMode === "popupWindow" ? "Window" : "Tab";
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
