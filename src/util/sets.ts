export function is_subset<T>(smaller: T[], bigger: T[]) {
    return smaller.every(e => bigger.includes(e))
}