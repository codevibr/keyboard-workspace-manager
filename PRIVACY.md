# Privacy Policy for Keyboard Workspace Manager

Effective date: May 10, 2026

Keyboard Workspace Manager is a local Chrome extension for managing browser workspace tabs and floating windows with keyboard shortcuts.

## Data Collection

Keyboard Workspace Manager does not collect, sell, transmit, or share personal data.

The extension does not use analytics, advertising SDKs, remote servers, tracking pixels, cookies, or third-party telemetry.

## Local and Sync Storage

The extension stores your configuration using Chrome extension storage. This may include:

- Shortcut slot names.
- Shortcut slot URLs.
- Whether a slot is enabled.
- Whether a slot opens as a pinned tab or floating window.
- Window size and position preferences.
- Debug logging preference.

If Chrome Sync is enabled for extensions, Chrome may sync this configuration through your Google account according to Chrome's own sync settings. Keyboard Workspace Manager does not receive or operate any sync server.

## Browser Tab Access

The extension uses Chrome APIs to inspect open tab URLs and window information so it can:

- Find an existing tab that matches a configured shortcut.
- Focus the matching tab and window.
- Create a missing tab.
- Pin and reposition managed tabs.
- Create or focus configured popup windows.

This information is processed locally inside Chrome and is not transmitted.

## Debug Logging

Debug logging is disabled by default. If enabled, diagnostic messages are written to the extension service worker console in your local browser. Logs are not transmitted.

## Data Sharing

Keyboard Workspace Manager does not share data with third parties.

## Data Retention and Deletion

Configuration remains stored until you change it, reset it, remove it through Chrome extension storage, or uninstall the extension.

## Contact

For questions, open an issue in the project repository.
