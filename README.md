# Keyboard Workspace Manager

A production-oriented Manifest V3 Chrome extension for keyboard-driven pinned-tab workspaces on Windows.

## What It Does

- `Ctrl+Shift+1`: focus or create Gmail.
- `Ctrl+Shift+2`: focus or create Google Calendar.
- `Ctrl+Shift+3`: focus or create Google Messages.
- `Ctrl+Shift+4`: focus or create ChatGPT as a pinned tab.
- Shortcuts 5-9: assign shortcuts manually.
- ChatGPT popup panel: assign a shortcut manually, or use the AutoHotkey companion.

When a service tab already exists, the extension focuses its window, activates the tab, pins it, and moves it to the configured pinned index. When no matching tab exists, it creates one and applies the same rules.

## Install

1. Open Chrome and go to `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select the `browser-workspace-manager` folder.
5. Open `chrome://extensions/shortcuts` and confirm the keyboard shortcuts.

Chrome allows many extension commands, but only four commands may include default suggested shortcuts in `manifest.json`. This extension ships defaults for slots 1-4. Assign slots 5-9 and the ChatGPT panel manually at `chrome://extensions/shortcuts`.

Chrome does not allow extension command shortcuts that include `Ctrl+Alt`, because that can conflict with AltGr keyboards. This is why `Ctrl+Alt+Shift+1` cannot be used directly in `manifest.json`. If you want Logitech Options+ buttons or AutoHotkey to use `Ctrl+Alt+Shift` muscle memory, bind those tools to send the Chrome-valid shortcut instead, such as `Ctrl+Shift+1`.

Chrome may also refuse a shortcut if another extension, Windows, the browser, Logitech Options+, or AutoHotkey already owns it. If that happens, set the shortcut manually at `chrome://extensions/shortcuts`, or bind your Logitech button to a less crowded shortcut such as `Ctrl+Shift+F13` and assign that shortcut in Chrome.

## Configuration

Open the extension options page from `chrome://extensions`. You can toggle debug logging, adjust pinned order healing, configure shortcut slots 1-9, and tune the ChatGPT popup panel size and position.

Each numbered shortcut slot has:

- Name shown in extension logs and options.
- URL opened when the tab does not already exist.
- Automatic host/path matching derived from the URL.
- A pinned index matching the shortcut number.

Chrome does not let extensions change command names dynamically in `chrome://extensions/shortcuts`, so that page shows generic names such as `Focus Shortcut 1`. The extension options page is the source of truth for your real slot names, such as `Gmail`, `Linear`, `Notion`, or `Banking`.

For deeper changes, edit `src/config.js`. Each service rule supports:

- `id`
- `name`
- `url`
- `match.hosts`
- `match.pathPrefixes`
- `pinnedIndex`
- `pinned`
- `windowPreference`
- optional `popup`

## Permissions

- `tabs`: required to search, activate, pin, and move tabs.
- `windows`: required to focus Chrome windows and create the popup panel.
- `storage`: required for the options page and future custom settings.
- Host permissions: limited to the built-in services that need URL matching.

The extension does not send data anywhere.

## ChatGPT Floating Window Strategy

The extension uses `chrome.windows.create({ type: "popup" })` for `Ctrl+Alt+Shift+0`. This is the best built-in MV3 option for an app-like floating panel. It creates a popup-style Chrome window, reuses an existing ChatGPT popup if found, focuses it, and applies configured size/position.

Chrome extension limitations:

- Extensions cannot create truly frameless windows.
- Monitor targeting is coordinate-based, not monitor-aware.
- Chrome may clamp or adjust window coordinates.
- `--app=https://chatgpt.com` launched outside Chrome often feels more app-like than an extension popup.

For stricter monitor placement, use the companion AutoHotkey v2 script in `ahk/ChatGPT-Floating-Panel.ahk`.

## AutoHotkey v2 Companion

Install AutoHotkey v2, then run:

```text
ahk/ChatGPT-Floating-Panel.ahk
```

The script binds `Ctrl+Alt+Shift+0`, focuses an existing ChatGPT Chrome app window when possible, moves it to configured monitor-2 coordinates, or launches:

```text
chrome.exe --app=https://chatgpt.com
```

You can also bind a Logitech Options+ key directly to that command or to the `.ahk` script.

## Debugging

1. Go to `chrome://extensions`.
2. Find Keyboard Workspace Manager.
3. Click `service worker`.
4. Enable debug logging in the options page.
5. Press a command shortcut and watch the logs.

Logs include command received, tab found or missing, tab created, tab moved, and window focus activity.

## Troubleshooting

- Shortcut does nothing: check `chrome://extensions/shortcuts`; Chrome may not have accepted the suggested shortcut.
- Wrong tab opens: update the service `match.hosts` and `match.pathPrefixes`.
- A shortcut opens `example.com`: set the real name and URL for that slot in extension options.
- ChatGPT panel appears on the wrong monitor: adjust `left` and `top` in options, or use the AutoHotkey companion.
- Extension stops responding briefly: MV3 service workers sleep by design. The commands API wakes the worker when a shortcut is pressed.

## Future Enhancements

- Workspace profiles with different pinned layouts.
- URL aliases per service.
- Cycling through multiple matching tabs.
- Tab group creation and color assignment.
- Startup restore that creates missing pinned tabs automatically.
- Import/export JSON settings.
- Command palette opened from the extension action.
