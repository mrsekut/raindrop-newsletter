import type { Raindrop } from './types.ts';

const API_BASE = 'https://api.raindrop.io/rest/v1';
const MAX_PER_PAGE = 50;

type RaindropResponse = {
  items: Raindrop[];
  count: number;
};

async function fetchPage(
  token: string,
  page: number,
  perpage: number = MAX_PER_PAGE,
): Promise<RaindropResponse> {
  const url = `${API_BASE}/raindrops/0?sort=-created&page=${page}&perpage=${perpage}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Raindrop API error: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as RaindropResponse;
}

export async function fetchLatest(
  token: string,
  n: number,
): Promise<Raindrop[]> {
  const all: Raindrop[] = [];
  let page = 0;
  while (all.length < n) {
    const perpage = Math.min(MAX_PER_PAGE, n - all.length);
    const { items } = await fetchPage(token, page, perpage);
    if (items.length === 0) break;
    all.push(...items);
    page++;
  }
  return all.slice(0, n);
}

export async function fetchSince(
  token: string,
  since: Date,
  max: number = 7,
): Promise<Raindrop[]> {
  const all: Raindrop[] = [];
  let page = 0;
  while (all.length < max) {
    const { items } = await fetchPage(token, page);
    if (items.length === 0) break;
    const newItems = items.filter(r => new Date(r.created) > since);
    all.push(...newItems);
    if (newItems.length < items.length) break;
    page++;
  }
  return all.slice(0, max);
}

export async function archiveRaindrops(
  token: string,
  ids: number[],
): Promise<void> {
  if (ids.length === 0) return;

  // DELETE /raindrops/0 with ids moves them to Trash
  const url = `${API_BASE}/raindrops/0`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    throw new Error(
      `Raindrop archive error: ${res.status} ${await res.text()}`,
    );
  }
}
