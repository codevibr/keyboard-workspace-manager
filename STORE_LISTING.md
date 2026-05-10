# Chrome Web Store Listing Draft

## Name

Keyboard Workspace Manager

## Short Description

Keyboard shortcuts for configurable pinned tabs and floating browser workspaces.

## Detailed Description

Keyboard Workspace Manager is built for people who live in Chrome and want their daily browser workspace to respond instantly to muscle memory.

Configure shortcut slots for the web apps, dashboards, inboxes, tools, and assistant windows you use every day. Press a shortcut and the extension finds the existing matching tab, focuses it, pins it, and keeps it in order. If the tab is gone, it creates it again in the right place.

Features:

- Configurable shortcut slots 1-9.
- Focus existing matching tabs across Chrome windows.
- Create missing tabs automatically.
- Keep managed tabs pinned and ordered.
- Open configured shortcuts as floating popup windows.
- Configure names, URLs, launch mode, and window geometry.
- Export and import settings as JSON.
- Reset individual slots or restore defaults.
- Optional local debug logging.
- Works well with Logitech Options+ and AutoHotkey workflows.

Privacy:

Keyboard Workspace Manager runs locally in Chrome. It does not collect, sell, transmit, or share personal data. Configuration is stored using Chrome extension storage.

## Category

Productivity

## Single Purpose

Keyboard Workspace Manager lets users configure keyboard shortcuts that focus, create, pin, order, and launch browser workspace tabs or popup windows.

## Permissions Justification

### `tabs`

Required to inspect open tab URLs, find tabs matching configured shortcut URLs, activate existing tabs, pin managed tabs, create missing tabs, and move managed pinned tabs into the correct order.

### `windows`

Required to focus the Chrome window containing a matched tab and to create or focus floating popup windows for configured shortcuts.

### `storage`

Required to save user configuration, including shortcut names, URLs, enabled state, launch mode, window geometry, debug setting, and import/export state.

## Privacy Disclosure Draft

This extension does not collect or transmit user data. It processes tab URLs locally only to match configured shortcuts to existing browser tabs. User settings are stored in Chrome extension storage and may sync through Chrome if the user has Chrome Sync enabled.

## Screenshot Ideas

- Options page showing configurable shortcut slots.
- Chrome extensions shortcuts page with assigned shortcut commands.
- A tidy pinned tab strip after shortcut healing.
- Floating popup window behavior.

## Publishing Checklist

- Confirm `manifest.json` loads unpacked without warnings.
- Confirm icons exist at 16, 32, 48, and 128 pixels.
- Capture at least one Chrome Web Store screenshot.
- Upload the 128x128 icon with the extension package.
- Include privacy policy text or a hosted privacy policy URL.
- Fill privacy disclosures consistently with `PRIVACY.md`.
- Keep the listing description accurate and non-spammy.
- Zip the extension folder contents, excluding Git metadata.
