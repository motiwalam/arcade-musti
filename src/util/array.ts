import { deep_copy } from "./itertools";
import { curry, repeat } from 'ramda';

export function withElem<T>(arr: T[], idx: number, elem: T) {
    const c = deep_copy(arr);
    c[idx] = elem;
    return c;
}

export function without<T>(arr: T[], elem: T): T[] {
    return arr.filter(e => e !== elem);
}

export function sorted<T>(arr: T[], func?: (a: T, b: T) => number) {
    return deep_copy(arr).sort(func)
}

export function choose_random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
    let available_idxs = arr.map((_, i) => i);
    const maps = arr.map(() => {
        const i = choose_random(available_idxs);
        available_idxs = without(available_idxs, i);
        return i;
    });

    return maps.map(i => arr[i]);
}

export function equals<T>(xs: T[], ys: T[]): boolean {
    return xs.length === ys.length && xs.every((x, i) => x === ys[i])
}

export function swap<T>(xs: T[], i: number, j: number): T[] {
    const xs_c = deep_copy(xs);
    const t = xs_c[i];
    xs_c[i] = xs_c[j];
    xs_c[j] = t;
    return xs_c;
}

export const padRight = curry(<T>(n: number, val: T, arr: T[]) => [...arr, ...repeat(val, n - arr.length)])
export const padLeft = curry(<T>(n: number, val: T, arr: T[]) => [...repeat(val, n - arr.length ), ...arr])

// @ts-ignore
window.padRight = padRight;
// @ts-ignore
window.padLeft = padLeft;