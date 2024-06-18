import { all, map, zip } from "./itertools";

function is_primitive<T>(x: T): boolean {
    return [
        "number",
        "string",
        "boolean",
        "undefined",
        "symbol"
    ].includes(typeof x);
}

export function is_subset<T, K>(ts: T[], ks: K[]) {
    return ts.every(t => ks.some(k => equals(t, k)))
}

export function set_equals<T, K>(ts: T[], ks: K[]) {
    return is_subset(ts, ks) && is_subset(ks, ts);
}

export function equals<T, K>(x: T, y: K): boolean {
    if (typeof x !== typeof y) return false;
    // @ts-ignore
    if (is_primitive(x) && is_primitive(y)) return x === y;
    if (x instanceof Array && y instanceof Array) {
        return x.length === y.length && all(map(zip(x, y), ([x, y]) => equals(x, y)))
    }
    // objects
    return set_equals(Object.keys(x), Object.keys(y)) && set_equals(Object.values(x), Object.values(y))
}