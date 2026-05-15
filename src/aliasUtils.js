export function normalizeAlias(value) {
  return String(value || "").trim().toLowerCase();
}

export function allLaunchableEntries(settings) {
  return [
    ...Object.values(settings.services || {}),
    ...(settings.launcherEntries || [])
  ];
}

export function findEntryByAlias(settings, alias) {
  const normalized = normalizeAlias(alias);
  if (!normalized) {
    return null;
  }

  return allLaunchableEntries(settings)
    .find((entry) => normalizeAlias(entry.alias) === normalized) || null;
}

export function validateUniqueAliases(entries) {
  const seen = new Map();

  for (const entry of entries) {
    const alias = normalizeAlias(entry.alias);
    if (!alias) {
      continue;
    }

    if (seen.has(alias)) {
      return {
        ok: false,
        alias,
        first: seen.get(alias),
        second: entry
      };
    }

    seen.set(alias, entry);
  }

  return { ok: true };
}
