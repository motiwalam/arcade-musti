export function promiseIn<T>(delay_ms: number, value: T): Promise<T> {
    return new Promise(resolve => setTimeout(resolve, delay_ms, value))
}