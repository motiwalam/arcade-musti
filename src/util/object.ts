
export const fromEntries = Object.fromEntries as <K extends PropertyKey, V>(entries: Iterable<[K, V]>) => Record<K, V>
export const objectKeys = Object.keys as <K extends PropertyKey>(o: Record<K, unknown>) => K[]
export const objectEntries = Object.entries as <K extends PropertyKey, V>(o: Record<K, V>) => [K, V][]
export function pick<K extends PropertyKey>(k: K) {
    return <V>(obj: Record<K, V>) => obj[k];
}
