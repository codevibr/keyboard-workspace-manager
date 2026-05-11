# Keyboard Workspace Manager

A production-oriented Manifest V3 Chrome extension for keyboard-driven pinned-tab workspaces on Windows.

## What It Does

- `Ctrl+Shift+1`: focus or create Gmail.
- `Ctrl+Shift+2`: focus or create Google Calendar.
- `Ctrl+Shift+3`: focus or create Google Messages.
- `Ctrl+Shift+4`: focus or create ChatGPT as a pinned tab.
- Shortcuts 5-9: assign shortcuts manually in Chrome's extension shortcuts page.
- Floating window shortcut: assign it manually in Chrome's extension shortcuts page, or use the AutoHotkey companion.

When a service tab already exists, the extension focuses its window, activates the tab, pins it, and moves it to the configured pinned index. When no matching tab exists, it creates one and applies the same rules.

## Screenshots

### Options

![Keyboard Workspace Manager options page](store-assets/store-assetsscreenshot-options-v091.png)

### Managed Pinned Tabs

![Managed pinned tabs in Chrome](store-assets/screenshot=pinned-tabs.png)

### Floating Window

![Floating window shortcut](store-assets/screenshot-floating-window.png)

## Install

1. Open Chrome and go to `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select the `browser-workspace-manager` folder.
5. Open `chrome://extensions/shortcuts` and confirm the keyboard shortcuts.

Chrome allows many extension commands, but only four commands may include default suggested shortcuts in `manifest.json`. This extension ships defaults for slots 1-4. To enable slots 5-9 and the floating window command, open `chrome://extensions/shortcuts`, find Keyboard Workspace Manager, and assign keys to `Focus Shortcut 5` through `Focus Shortcut 9` and `Open Floating Window`.

Chrome does not allow extension command shortcuts that include `Ctrl+Alt`, because that can conflict with AltGr keyboards. This is why `Ctrl+Alt+Shift+1` cannot be used directly in `manifest.json`. If you want Logitech Options+ buttons or AutoHotkey to use `Ctrl+Alt+Shift` muscle memory, bind those tools to send the Chrome-valid shortcut instead, such as `Ctrl+Shift+1`.

Chrome may also refuse a shortcut if another extension, Windows, the browser, Logitech Options+, or AutoHotkey already owns it. If that happens, set the shortcut manually at `chrome://extensions/shortcuts`, or bind your Logitech button to a less crowded shortcut such as `Ctrl+Shift+F13` and assign that shortcut in Chrome.

## Configuration

Open the extension options page from `chrome://extensions`. You can toggle debug logging, adjust pinned order healing, configure shortcut slots 1-9, and tune the ChatGPT popup panel size and position.

Each numbered shortcut slot has:

- Name shown in extension logs and options.
- URL opened when the tab does not already exist.
- Automatic host/path matching derived from the URL.
- Launch mode: pinned tab or floating window.
- Optional floating-window size and position.

Blank URLs are treated as disabled slots. Disabled slots do nothing when their command is pressed.

Pinned tab ordering is compressed across enabled pinned-tab slots only. For example, if slot 3 is configured as a floating window, then slot 4 becomes the third managed pinned tab rather than leaving an empty gap in the pinned tab strip.

Chrome does not let extensions change command names dynamically in `chrome://extensions/shortcuts`, so that page shows generic names such as `Focus Shortcut 1`. The extension options page is the source of truth for your real slot names, such as `Gmail`, `Linear`, `Notion`, or `Banking`.

Configuring a slot in the options page does not automatically create its Chrome keyboard shortcut. Chrome keeps shortcut assignment in `chrome://extensions/shortcuts`, so use the options page to define what each slot opens and Chrome's shortcuts page to define which key triggers it.

Use `Export` and `Import` on the options page to back up or move your settings. Use each slot's reset button to restore one slot, or `Reset Defaults` to restore the full configuration.

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

The extension does not request website host permissions, inject content scripts, or read/change page contents. It reads tab URLs locally only so it can match a configured shortcut to an already-open tab.

The extension does not send data anywhere.

See `PRIVACY.md` and `STORE_LISTING.md` for Web Store-ready privacy and permissions copy. The public privacy policy is available at https://github.com/codevibr/keyboard-workspace-manager/blob/main/PRIVACY.md.

## Floating Window Strategy

The extension uses `chrome.windows.create({ type: "popup" })` for floating-window shortcuts. This is the best built-in MV3 option for an app-like floating panel. It creates a popup-style Chrome window, reuses an existing matching popup if found, focuses it, and applies configured size/position.

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
- Slots 5-9 or floating window do nothing: assign those commands manually in `chrome://extensions/shortcuts`.
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
- Command palette opened from the extension action.
