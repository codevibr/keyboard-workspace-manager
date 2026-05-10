let debugEnabled = false;

export function setDebug(enabled) {
  debugEnabled = Boolean(enabled);
}

export function log(message, details = undefined) {
  if (!debugEnabled) {
    return;
  }

  const prefix = "[Workspace Manager]";
  if (details === undefined) {
    console.log(prefix, message);
    return;
  }

  console.log(prefix, message, details);
}

export function warn(message, details = undefined) {
  const prefix = "[Workspace Manager]";
  if (details === undefined) {
    console.warn(prefix, message);
    return;
  }

  console.warn(prefix, message, details);
}
