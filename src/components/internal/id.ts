const counterKey = Symbol.for("simplest-ui.id-counter");

/**
 * Generates an ID that is not stable across page loads; adapters must not
 * persist or diff it.
 */
export function createId(prefix: string): string {
  const randomUUID = globalThis.crypto?.randomUUID;
  const state = globalThis as typeof globalThis & { [counterKey]?: number };
  const suffix = typeof randomUUID === "function"
    ? randomUUID.call(globalThis.crypto)
    : `${Date.now().toString(36)}-${state[counterKey] = (state[counterKey] ?? 0) + 1}`;
  return `${prefix}-${suffix}`;
}
