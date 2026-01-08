import { create } from 'zustand';

const STORAGE_KEY = 'wds.playerId';

function generatePlayerId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `player_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function readInitialPlayerId(): string | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value && value.trim().length > 0 ? value : null;
  } catch {
    return null;
  }
}

function persistPlayerId(playerId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, playerId);
  } catch {
    // ignore
  }
}

interface PlayerState {
  playerId: string | null;
  ensurePlayerId: () => string;
  setPlayerId: (playerId: string) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  playerId: typeof window !== 'undefined' ? readInitialPlayerId() : null,
  ensurePlayerId: () => {
    const existing = get().playerId;
    if (existing) return existing;
    const next = generatePlayerId();
    persistPlayerId(next);
    set({ playerId: next });
    return next;
  },
  setPlayerId: (playerId) => {
    const normalized = playerId.trim();
    persistPlayerId(normalized);
    set({ playerId: normalized });
  },
}));
