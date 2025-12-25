/**
 * Internal utilities for the mock data layer.
 */

/**
 * PUBLIC_INTERFACE
 * delay
 * Adds artificial latency to mimic network delay.
 * @param ms Number of milliseconds to wait (default: random between 90 and 250)
 */
export async function delay(ms?: number): Promise<void> {
  const wait = typeof ms === "number" ? ms : 90 + Math.floor(Math.random() * 160);
  await new Promise((resolve) => setTimeout(resolve, wait));
}

/**
 * Returns a shallow cloned object to avoid accidental mutations by callers.
 */
export function clone<T>(obj: T): T {
  // StructuredClone may not be available in older browsers; using a simple shallow copy for safety.
  if (Array.isArray(obj)) {
    return [...obj] as unknown as T;
  }
  if (obj && typeof obj === "object") {
    return { ...(obj as Record<string, unknown>) } as T;
  }
  return obj;
}

/**
 * Returns current timestamp in ISO format.
 */
export function nowISO(): string {
  return new Date().toISOString();
}
