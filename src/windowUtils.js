export async function getCurrentWindowId() {
  try {
    const current = await chrome.windows.getCurrent();
    return current?.id;
  } catch {
    return undefined;
  }
}

export async function focusWindow(windowId) {
  if (typeof windowId !== "number") {
    return;
  }

  await chrome.windows.update(windowId, { focused: true });
}

export function isPopupWindow(window) {
  return window?.type === "popup";
}

export function popupCreateOptions(service) {
  const popup = service.popup || {};
  const options = {
    url: service.url,
    type: "popup",
    focused: true,
    width: popup.width || 520,
    height: popup.height || 860
  };

  if (Number.isInteger(popup.left)) {
    options.left = popup.left;
  }

  if (Number.isInteger(popup.top)) {
    options.top = popup.top;
  }

  return options;
}
