// Shared localStorage keys and guarded accessors for the profile/settings modules.

export const LS_THEME = 'dev:theme'
export const LS_FONTSIZE = 'dev:fontsize'
export const LS_CURSOR = 'dev:cursor'
export const LS_MOTION = 'dev:motion'
export const LS_SOUND = 'dev:sound'

// localStorage can throw (Safari private mode, locked-down webviews). Guard
// every access so a SecurityError can't abort initProfileSettings() and leave
// /dev half-wired (shortcuts unbound, README never opened).
export const lsGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
export const lsSet = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage blocked - ignore */
  }
}
export const lsRemove = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch {
    /* storage blocked - ignore */
  }
}
