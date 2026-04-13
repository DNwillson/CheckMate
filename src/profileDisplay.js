const PROFILE_NAMES_KEY = 'checkmate_profile_display_names';

export function getProfileDisplayName(username) {
  if (!username) return '';
  try {
    const o = JSON.parse(localStorage.getItem(PROFILE_NAMES_KEY) || '{}');
    return String(o[username] || '').trim();
  } catch {
    return '';
  }
}

export function setProfileDisplayName(username, displayName) {
  if (!username) return;
  try {
    const o = JSON.parse(localStorage.getItem(PROFILE_NAMES_KEY) || '{}');
    const v = String(displayName || '').trim();
    if (v) o[username] = v;
    else delete o[username];
    localStorage.setItem(PROFILE_NAMES_KEY, JSON.stringify(o));
  } catch {
    /* ignore */
  }
}
