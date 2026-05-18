# Chrome Web Store Listing Draft

## Name

Keyboard Workspace Manager

## Short Description

Keyboard shortcuts for configurable pinned tabs and floating browser workspaces.

## Detailed Description

Keyboard Workspace Manager is built for people who live in Chrome and want their daily browser workspace to respond instantly to muscle memory.

Configure shortcut slots for the web apps, dashboards, inboxes, tools, and assistant windows you use every day. Press a shortcut and the extension finds the existing matching tab, focuses it, and applies the configured launch mode. Slots can open as pinned tabs, regular tabs, or floating popup windows.

Features:

- Configurable shortcut slots 1-10.
- Optional unique aliases for launching slots or launcher entries from local automation tools.
- Focus existing matching tabs across Chrome windows.
- Create missing tabs automatically.
- Keep managed tabs pinned and ordered.
- Open configured shortcuts as pinned tabs, regular tabs, or floating popup windows.
- Ships default shortcuts for slots 1-4; slots 5-10 are enabled by assigning shortcuts in Chrome's Extensions shortcuts page.
- Toolbar command palette with unlimited searchable launcher entries for workspaces that do not need dedicated keyboard shortcuts.
- Launcher Entries, Keyboard Slots, and matching open tabs appear in one command palette result list.
- Search the web from the final command palette result using Chrome's default search engine.
- Optional bookmark search in the command palette, disabled by default and enabled only after the user grants bookmark permission.
- Light, dark, system-following, Chrome Graphite, Catppuccin, GitHub, Nord, or Tokyo Night themes for both the options page and command palette.
- Configure names, URLs, launch mode, and window geometry.
- Export and import settings as JSON.
- Reset individual slots or restore defaults.
- Optional local debug logging.
- Works well with Logitech Options+ and AutoHotkey workflows.

Privacy:

Keyboard Workspace Manager runs locally in Chrome. It does not collect, sell, transmit, or share personal data. Configuration is stored using Chrome extension storage.

Public privacy policy:

https://github.com/codevibr/keyboard-workspace-manager/blob/main/PRIVACY.md

License:

Keyboard Workspace Manager is released under the MIT License.

## Category

Productivity

## Single Purpose

Keyboard Workspace Manager lets users configure keyboard shortcuts that focus, create, pin, order, and launch browser workspace tabs or popup windows.

Chrome manages extension shortcut assignment separately from extension options. Keyboard Workspace Manager provides default shortcuts for slots 1-4. Users enable slots 5-10 by visiting `chrome://extensions/shortcuts` and assigning keys to those commands.

For additional workspaces beyond the manifest-backed shortcut slots, users can create unlimited Launcher Entries and open them from the extension toolbar popup.

Users can also assign optional aliases to slots or Launcher Entries and launch them through an extension URL. This is useful for local automation tools such as Deckboard, Logitech Options+, and AutoHotkey.

Users on Chrome 127 or newer can assign the `Open Command Palette` extension command to open the toolbar popup from the keyboard. That command should be set to Global because Chrome may not consistently dispatch browser-scoped action-popup shortcuts.

## Permissions Justification

### `tabs`

Required to inspect open tab URLs, find tabs matching configured shortcut URLs, activate existing tabs, pin managed tabs, create missing tabs, and move managed pinned tabs into the correct order.

The extension does not request host permissions, does not inject content scripts, and does not read or change page contents. URL inspection is used only for local tab matching.

### `windows`

Required to focus the Chrome window containing a matched tab and to create or focus floating popup windows for configured shortcuts.

### `storage`

Required to save user configuration, including shortcut names, URLs, enabled state, launch mode, window geometry, debug setting, and import/export state.

### `search`

Required for the command palette's final web-search fallback. The extension passes only the typed query to Chrome's built-in search API, which uses the user's default search engine.

### Optional `bookmarks`

Requested only if the user enables bookmark search in Settings. Used to search bookmark titles and URLs locally from the command palette and open selected bookmarks in a new tab. Disabling bookmark search removes active bookmark access. Chrome may remember prior approval, so re-enabling the feature may not show the permission prompt again.

## Privacy Disclosure Draft

This extension does not collect or transmit user data. It does not request website host permissions and does not read or change page contents. It processes tab URLs locally only to match configured shortcuts to existing browser tabs. Optional aliases are stored locally with the rest of the user's settings and are used only to resolve extension launch URLs. Optional bookmark search, if enabled by the user, processes bookmark titles and URLs locally for command palette search. If the web-search fallback is selected, the typed query is passed to Chrome's built-in search API so Chrome can use the user's default search engine. Disabling bookmark search removes active bookmark access, though Chrome may remember prior approval for future re-enabling. User settings are stored in Chrome extension storage and may sync through Chrome if the user has Chrome Sync enabled.

## License Disclosure Draft

Keyboard Workspace Manager is open source software released under the MIT License.

## Screenshot Ideas

- Options page showing configurable shortcut slots.
- Chrome extensions shortcuts page with assigned shortcut commands.
- A tidy pinned tab strip after shortcut healing.
- Floating popup window behavior.

Prepared screenshots:

- `store-assets/screenshot-options.png`
- `store-assets/screenshot=pinned-tabs.png`

## Publishing Checklist

- Confirm `manifest.json` loads unpacked without warnings.
- Confirm icons exist at 16, 32, 48, and 128 pixels, plus toolbar-friendly 19, 24, and 38 pixel action icons.
- Capture at least one Chrome Web Store screenshot.
- Upload the 128x128 icon with the extension package.
- Include privacy policy text or the hosted privacy policy URL.
- Fill privacy disclosures consistently with `PRIVACY.md`.
- Keep the listing description accurate and non-spammy.
- Zip the extension folder contents, excluding Git metadata.
- Confirm upgrade behavior preserves stored settings. Done.
- Confirm disabled empty slots do nothing. Done.
- Confirm popup shortcuts focus existing popup windows instead of duplicating. Done.
- Confirm package ZIP contains only extension-related files. Done.
