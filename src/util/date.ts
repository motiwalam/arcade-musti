export function daysBetween(t1: Date, t2: Date) {
    [t1, t2] = [t1, t2].map(t => new Date(t));
    const diff_ms = t2.setHours(0, 0, 0, 0) - t1.setHours(0, 0, 0, 0);
    return Math.round(diff_ms / (24 * 60 * 60 * 1000))
}