import type { State } from './types.ts';

const STATE_FILE = '.raindrop-newsletter-state.json';

export async function loadState(): Promise<State | null> {
  try {
    const file = Bun.file(STATE_FILE);
    if (!(await file.exists())) return null;
    return (await file.json()) as State;
  } catch {
    return null;
  }
}

export async function saveState(date: Date): Promise<void> {
  const state: State = { lastRun: date.toISOString() };
  await Bun.write(STATE_FILE, JSON.stringify(state, null, 2));
}
