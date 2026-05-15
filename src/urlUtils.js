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

export function tabMatchesService(tab, service, competitors = []) {
  return serviceMatchScore(tab, service, competitors) > 0;
}

export function serviceMatchScore(tab, service, competitors = []) {
  const score = rawServiceMatchScore(tab, service);
  if (!score) {
    return 0;
  }

  const strongerCompetitor = competitors
    .filter((candidate) => candidate?.id !== service?.id && candidate?.enabled && candidate?.url)
    .some((candidate) => rawServiceMatchScore(tab, candidate) > score);

  return strongerCompetitor ? 0 : score;
}

function rawServiceMatchScore(tab, service) {
  if (!tab?.url || !service?.match) {
    return 0;
  }

  const parsed = parseUrl(tab.url);
  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
    return 0;
  }

  const tabHost = normalizeHost(parsed.hostname);
  const allowedHosts = (service.match.hosts || []).map(normalizeHost);
  if (!allowedHosts.includes(tabHost)) {
    return 0;
  }

  const prefixes = service.match.pathPrefixes || ["/"];
  const matchingPrefixes = prefixes.filter((prefix) => parsed.pathname === prefix || parsed.pathname.startsWith(prefix));
  if (!matchingPrefixes.length) {
    return 0;
  }

  const serviceUrl = parseUrl(service.url);
  if (serviceUrl && urlsMatchIgnoringHash(parsed, serviceUrl)) {
    return 10_000;
  }

  const exactPath = matchingPrefixes.some((prefix) => parsed.pathname === prefix);
  const longestPrefixLength = Math.max(...matchingPrefixes.map((prefix) => prefix.length));
  return (exactPath ? 5_000 : 1_000) + longestPrefixLength;
}

export function urlForCreate(service) {
  return service.url;
}

function urlsMatchIgnoringHash(left, right) {
  return normalizeHost(left.hostname) === normalizeHost(right.hostname)
    && left.pathname === right.pathname
    && left.search === right.search;
}
