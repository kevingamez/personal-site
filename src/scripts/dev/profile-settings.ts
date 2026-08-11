// Profile panel widgets (live Bogotá clock, session uptime, started-at) and
// the Settings panel (theme switcher, font size, cursor style, motion + sound
// toggles). All preferences persist to localStorage under `dev:*` keys.
//
// Barrel: implementation split across profile-settings-storage.ts (localStorage
// helpers), profile-settings-themes.ts (palettes + DOM appliers),
// profile-settings-panel.ts (settings panel logic + sound), and
// profile-settings-widgets.ts (profile widgets + entry point).

export { initProfileSettings } from './profile-settings-widgets'
