/**
 * Utility to manage unique and authentic Termux / Android user identity
 * Default: authentic Termux Android format (e.g. u0_a248 or hash-based from browser fingerprint)
 * Supports custom username edits saved in localStorage
 */

const STORAGE_KEY = 'termux_terminal_user_identity';

export interface TermuxUserIdentity {
  username: string;
  hostname: string;
  uid: number;
  gid: number;
}

// Generate a deterministic or randomized unique Android UID for this browser / session
function generateDefaultAndroidUser(): TermuxUserIdentity {
  if (typeof window === 'undefined') {
    return {
      username: 'u0_a248',
      hostname: 'localhost',
      uid: 10248,
      gid: 10248
    };
  }

  // Calculate unique fingerprint from screen resolution + userAgent length to have a consistent unique ID per device
  let seed = 248;
  try {
    const raw = `${window.screen?.width || 360}x${window.screen?.height || 800}-${navigator.userAgent?.length || 50}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    seed = Math.abs(hash % 800) + 100; // e.g. 100 - 899 -> u0_a342
  } catch {
    seed = Math.floor(Math.random() * 800) + 100;
  }

  const defaultUsername = `u0_a${seed}`;
  return {
    username: defaultUsername,
    hostname: 'localhost',
    uid: 10000 + seed,
    gid: 10000 + seed
  };
}

export function getTermuxUserIdentity(): TermuxUserIdentity {
  if (typeof window === 'undefined') {
    return generateDefaultAndroidUser();
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.username) {
        return parsed;
      }
    }
  } catch {
    // Ignore error
  }

  const generated = generateDefaultAndroidUser();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
  } catch {
    // Ignore error
  }
  return generated;
}

export function saveTermuxUsername(newUsername: string, newHostname?: string): TermuxUserIdentity {
  const current = getTermuxUserIdentity();
  const cleanUser = newUsername.trim().replace(/\s+/g, '_') || current.username;
  const cleanHost = newHostname?.trim() || current.hostname;

  const updated: TermuxUserIdentity = {
    ...current,
    username: cleanUser,
    hostname: cleanHost
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore error
  }

  return updated;
}
