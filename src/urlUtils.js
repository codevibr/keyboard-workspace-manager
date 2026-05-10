export function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function normalizeHost(hostname) {
  return String(hostname || "").trim().toLowerCase().replace(/^www\./, "");
}

export function tabMatchesService(tab, service) {
  if (!tab?.url || !service?.match) {
    return false;
  }

  const parsed = parseUrl(tab.url);
  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
    return false;
  }

  const tabHost = normalizeHost(parsed.hostname);
  const allowedHosts = (service.match.hosts || []).map(normalizeHost);
  if (!allowedHosts.includes(tabHost)) {
    return false;
  }

  const prefixes = service.match.pathPrefixes || ["/"];
  return prefixes.some((prefix) => parsed.pathname === prefix || parsed.pathname.startsWith(prefix));
}

export function urlForCreate(service) {
  return service.url;
}
