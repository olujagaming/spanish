/** Persistent global store backed by localStorage, consumed via useSyncExternalStore. */

import { useSyncExternalStore } from 'react';
import { initialState, migrate, type AppState } from './state';
import { checkAchievements, type Achievement } from './achievements';

const KEY = 'hablemos-state-v1';

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? migrate(JSON.parse(raw)) : initialState();
  } catch {
    return initialState();
  }
}

let state: AppState = typeof localStorage !== 'undefined' ? load() : initialState();
const listeners = new Set<() => void>();
const achievementListeners = new Set<(a: Achievement[]) => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked – progress just isn't saved.
  }
}

export function getState(): AppState {
  return state;
}

export function setState(update: (s: AppState) => AppState): void {
  const next = update(state);
  if (next === state) return;
  const { state: withAchievements, unlocked } = checkAchievements(next);
  state = withAchievements;
  persist();
  listeners.forEach((l) => l());
  if (unlocked.length) achievementListeners.forEach((l) => l(unlocked));
}

export function replaceState(next: unknown): void {
  state = migrate(next);
  persist();
  listeners.forEach((l) => l());
}

export function resetState(): void {
  replaceState(initialState());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function onAchievements(l: (a: Achievement[]) => void): () => void {
  achievementListeners.add(l);
  return () => achievementListeners.delete(l);
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function exportState(): string {
  return JSON.stringify(state, null, 2);
}

// Keep tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = load();
      listeners.forEach((l) => l());
    }
  });
}
