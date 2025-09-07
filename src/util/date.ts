type Duration = number

export const MILLISECOND = 1;
export const SECOND = 1000 * MILLISECOND;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export function daysBetween(t1: Date, t2: Date) {
    [t1, t2] = [t1, t2].map(t => new Date(t));
    const diff_ms = t2.setHours(0, 0, 0, 0) - t1.setHours(0, 0, 0, 0);
    return Math.round(diff_ms / (24 * 60 * 60 * 1000))
}

export function* dateRange(start: Date, end: Date, step: Duration) {
    let curr = start;
    while (curr.getTime() <= end.getTime()) {
        yield curr;
        curr.setTime(curr.getTime() + step);
    }
}