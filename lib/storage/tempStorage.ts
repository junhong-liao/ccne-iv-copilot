import { randomUUID } from "node:crypto";

type TempEntry = {
  buffer: Buffer;
  contentType: string;
  filename: string;
  expiresAt: number;
};

const store = new Map<string, TempEntry>();

function pruneExpired(now = Date.now()) {
  for (const [token, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(token);
    }
  }
}

export function putTempReport(entry: Omit<TempEntry, "expiresAt"> & { ttlMs?: number }) {
  const ttlMs = entry.ttlMs ?? 15 * 60 * 1000;
  const expiresAt = Date.now() + ttlMs;
  pruneExpired();
  const token = randomUUID();
  store.set(token, { ...entry, expiresAt });
  return { token, expiresAt };
}

export function getTempReport(token: string) {
  const entry = store.get(token);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    store.delete(token);
    return null;
  }
  return entry;
}

