# Changelog

All notable changes to Keyboard Workspace Manager will be documented in this file.

## 0.10.2 - Interface Polish

### Added

- Options-page slot status and shortcut badges for easier scanning.
- Command palette result icons, richer result metadata, and a more polished selected-result state.
- Favicons for configured slot and launcher command palette results when a matching tab or floating window is already open.
- Bottom Add Entry button for Launcher Entries when the list grows beyond four items.
- Regular tab launch mode for keyboard slots.
- Drag-and-drop reordering for keyboard slot configurations.
- More specific URL matching so entries like `docs.google.com/` and `docs.google.com/spreadsheets/` can coexist.
- Final command palette result for searching the web with Chrome's default search engine.
- Optional unique aliases for slots and launcher entries.
- Extension launch URL for opening aliases from Deckboard, Logitech Options+, AutoHotkey, or similar tools.
- Temporary alias launch URL overrides for mode, new-window behavior, and popup geometry.

## 0.10.1 - Theme Preferences

### Added

- Appearance setting for Light, Dark, or Follow system theme.
- Matching light/dark theme behavior for both the options page and command palette.

## 0.10.0 - Optional Bookmark Search

### Added

- Optional command palette bookmark search, disabled by default.
- Optional `bookmarks` permission requested only when bookmark search is enabled in Settings.
- Disabling bookmark search removes active bookmark access; docs clarify that Chrome may remember prior approval and skip the prompt if re-enabled.
- Bookmark command palette results that match typed bookmark title or URL text and open in a new tab.
- README, Store listing, and Privacy Policy disclosures for optional bookmark access.

## 0.9.3 - Public Testing Candidate

### Added

- Combined command palette results into one ranked list.
- Added open-tab search by title and URL in the command palette.
- Open-tab command palette results focus the existing tab and its Chrome window.
- Popup-window tab results are labeled as floating windows in the command palette.

## 0.9.2 - Public Testing Candidate

### Added

- Toolbar popup for searching and launching enabled keyboard slots and dynamic launcher entries.
- Unlimited Launcher Entries for extra workspaces that do not need manifest-declared keyboard commands.
- Options-page management for Launcher Entries, including name, URL, tags, launch mode, and floating-window geometry.
- Slot 10 is now a regular configurable shortcut slot that can open as either a pinned tab or floating window.
- Renamed manifest command ids to `focus-slot-01` through `focus-slot-10` so Chrome's shortcut page can sort them in slot order.
- Options page app shell with left-side navigation for Workspaces, Settings, Import/Export, and About.
- Toolbar command palette launches the first visible match when Enter is pressed.
- `open-command-palette` command for opening the toolbar popup from an assigned Chrome shortcut on supported Chrome versions.
- Documentation that `open-command-palette` should be assigned as a Global shortcut because Chrome may not dispatch browser-scoped action-popup shortcuts.
- Icon-only edit and delete controls on the options page slot rows.
- Actual extension icon in the options page sidebar.
- Full-row click targets in the toolbar command palette.
- Chrome shortcuts button now attempts to open `chrome://extensions/shortcuts` and copies the URL if Chrome blocks it.
- Smaller options-page edit/delete icon buttons, with delete styled as a destructive action.
- Launcher Entries now appear before Keyboard Slots in the toolbar command palette.
- Chrome shortcut command labels remain human-readable while zero-padded command ids keep slots sorted 1 through 10.
- Chrome shortcut command ids are zero-padded for slots 01-09 because Chrome appears to sort shortcuts by command id.
- Sidebar help card with GitHub link, version, and power-user signoff on the options page.
- MIT License reference on the options page About tab.
- Red Reset to default controls on every options-page tab.
- Wider window-geometry controls so four-digit values are not clipped by number spinners.
- Up and Down arrow keyboard navigation in the toolbar command palette.
- Command palette shortcut now focuses a normal Chrome window before opening the action popup.
- MIT License file and license references in project documentation.

## 0.9.1 - Options Layout Polish

### Changed

- Improved Shortcut Slots layout so the URL field no longer overlaps the Mode dropdown.
- Moved each slot URL onto its own row for better readability.
- Aligned Reset buttons with the Name and Mode controls.
- Clarified that slots 5-10 must be assigned manually in Chrome's extension shortcuts page.

## 0.9.0 - Initial Public Release Candidate

### Added

- Configurable shortcut slots 1-10 for keyboard-driven browser workspaces.
- Default Chrome shortcuts for slots 1-4, with slots 5-10 available through Chrome's extension shortcuts page.
- Pinned-tab shortcuts that find existing tabs, focus them, pin them, and keep them in managed order.
- Missing-tab creation for configured shortcuts.
- Floating-window launch mode with configurable URL, position, and size.
- Reuse behavior for existing floating windows to avoid duplicates.
- Disabled-slot behavior when a shortcut has no configured URL.
- Options page for shortcut names, URLs, launch modes, window geometry, debug logging, import/export, and reset controls.
- Compressed pinned-tab ordering so only enabled pinned-tab slots occupy managed pinned positions.
- Optional AutoHotkey v2 companion script for stronger app-window positioning.
- Chrome extension icon set and toolbar-specific action icons.
- Privacy policy, Chrome Web Store listing draft, permissions justification, package builder, and store screenshot assets.

### Changed

- Replaced the original dedicated ChatGPT floating-panel command with a regular Slot 10 shortcut.
- Removed static host permissions; the extension now relies on `tabs`, `windows`, and `storage`.
- Kept Chrome-valid default shortcuts for slots 1-4 because Chrome does not allow `Ctrl+Alt` extension commands.

### Verified

- Upgrade behavior preserves stored settings.
- Empty shortcut slots are disabled and do not create placeholder tabs.
- Floating-window shortcuts focus existing popup windows instead of duplicating them.
- The generated package ZIP contains only extension-related files.
