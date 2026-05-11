# Changelog

All notable changes to Keyboard Workspace Manager will be documented in this file.

## 0.9.1 - Options Layout Polish

### Changed

- Improved Shortcut Slots layout so the URL field no longer overlaps the Mode dropdown.
- Moved each slot URL onto its own row for better readability.
- Aligned Reset buttons with the Name and Mode controls.
- Clarified that slots 5-9 and the floating window command must be assigned manually in Chrome's extension shortcuts page.

## 0.9.0 - Initial Public Release Candidate

### Added

- Configurable shortcut slots 1-9 for keyboard-driven browser workspaces.
- Default Chrome shortcuts for slots 1-4, with slots 5-9 and the floating window command available through Chrome's extension shortcuts page.
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

- Renamed the internal floating-window command from `open-chatgpt-panel` to `open-floating-window`.
- Removed static host permissions; the extension now relies on `tabs`, `windows`, and `storage`.
- Kept Chrome-valid default shortcuts for slots 1-4 because Chrome does not allow `Ctrl+Alt` extension commands.

### Verified

- Upgrade behavior preserves stored settings.
- Empty shortcut slots are disabled and do not create placeholder tabs.
- Floating-window shortcuts focus existing popup windows instead of duplicating them.
- The generated package ZIP contains only extension-related files.
