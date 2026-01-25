// src/lib/simple-cache.ts
export interface Cache {
  get<T = unknown>(key: string): T | undefined
  set(key: string, value: unknown, ttlMs?: number): void
  del(key: string): void
  clear(): void
}

type Entry = { value: unknown; exp: number } // exp = epoch ms (Infinity = no expiry)

export class InMemorySimpleCache implements Cache {
  private store = new Map<string, Entry>()
  constructor(private defaultTtlMs: number = Infinity) {} // default no expiry

  get<T = unknown>(key: string): T | undefined {
    const e = this.store.get(key)
    if (!e) return undefined
    if (e.exp !== Infinity && Date.now() > e.exp) {
      this.store.delete(key) // lazy expire
      return undefined
    }
    return e.value as T
  }

  set(key: string, value: unknown, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs
    const exp = ttl > 0 ? Date.now() + ttl : Infinity
    this.store.set(key, { value, exp })
  }

  del(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}