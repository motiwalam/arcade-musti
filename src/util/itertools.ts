import { equals } from './equality'
import { ValueError } from './errors'

export type AsIterable<T> = { [K in keyof T]: Iterable<T[K]> }

export function* zip<T extends any[]>(...iters: AsIterable<T>): Generator<T> {
  const iterators = iters.map(i => i[Symbol.iterator]())
  while (true) {
    const results = iterators.map(i => i.next())
    if (results.some(({ done }) => done)) break
    yield results.map(({ value }) => value) as T
  }
}

export function* range(...args: number[]): Generator<number> {
    if (args.length === 0) throw new ValueError('must pass at least one argument to range')
    if (args.length === 1) yield* range(0, args[0], 1);
    else {
        let [start, end, step] = args.concat(1);
        const cmp: (a: number, b: number) => boolean = step > 0 ? (a, b) => a < b : (a, b) => a > b;
        while (cmp(start, end)) {
            yield start;
            start += step;
        }
    }
}

export function* map<T, U>(iter: Iterable<T>, func: (x: T) => U): Generator<U> {
    for (const i of iter) yield func(i)
}

export function array<T>(iter: Iterable<T>): T[] {
    return [...iter];
}

export function product<T extends any[]>(...iters: AsIterable<T>): Generator<T> {
    // @ts-ignore
    function* cycle<U extends any[], V>(values: Iterable<V>, upper: Iterable<U>) {
        for (const prefix of upper) {
            for (const current of values) {
                yield [...prefix, current] as [...U, V]
            }
        }
    }

    let stack: Iterable<any[]> = [[]];
    for (const level of array(map(iters, array))) {
        stack = cycle(level, stack);
    }
    return stack as Generator<T>;
}

export function* permutations<T>(iter: Iterable<T>, r?: number): Generator<T[]> {
    function* countdown(n: number, r: number): Generator<[number, number[]]> {
        const ticks = array(range(n, n - r, -1));
        while (true) {
            let broke = false;
            for (const i of reversed(range(r))) {
                ticks[i]--
                yield [i, ticks]
                if (ticks[i] === 0) ticks[i] = n - i;
                else {
                    broke = true;
                    break;
                }
            }

            if (!broke) return;
        }
    }

    function* _permutations<U>(items: U[], r: number) {
        const n = items.length;
        yield;
        for (const [i, ticks] of countdown(n, r)) {
            const tick = ticks[i];
            if (tick === 0) {
                items.push(items.splice(i, 1)[0])
            } else {
                const j = n - tick;
                [items[i], items[j]] = [items[j], items[i]]
                yield
            }
        }
    }

    const items = array(iter);
    const n = items.length;
    r ??= n
    if (r > n) return
    if (r < 0) throw new ValueError(`r must be non negative`)

    const indices = array(range(n))

    for (const _ of _permutations(indices, r)) {
        yield array(map(range(r), i => items[indices[i]]))
    }
}

export function* repeat<T>(x: T, n: number): Generator<T> {
    for (const _ of range(n)) yield x;
}

export function consume<T>(iter: Iterable<T>): void {
    for (const _ of iter) {}
}

export function forEach<T>(iter: Iterable<T>, func: (x: T) => any): void {
    consume(map(iter, func))
}

export function deep_copy<T>(o: T): T {
    if (['string', 'number', 'boolean', 'symbol', 'bigint', 'undefined', 'function'].includes(typeof o)) return o;
    if (o instanceof Array) return o.map(deep_copy) as unknown as T
    if (o === null) return o;
    if (typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, deep_copy(v)])) as T
    return o;
}

export function foldl<Acc, Iter>(iter: Iterable<Iter>, initial: Acc, op: (a: Acc, b: Iter) => Acc) {
    let acc = initial;
    for (const i of iter) acc = op(acc, i);
    return acc;
}

export function foldr<Acc, Iter>(iter: Iterable<Iter>, initial: Acc, op: (a: Iter, b: Acc) => Acc) {
    return foldl(reversed(iter), initial, (a, b) => op(b, a))
}

export function* scanl<Acc, Iter>(iter: Iterable<Iter>, initial: Acc, op: (a: Acc, b: Iter) => Acc): Generator<Acc> {
    let acc = initial;
    for (const i of iter) {
        yield acc;
        acc = op(acc, i)
    }
    yield acc;
}

export function* filter<T>(iter: Iterable<T>, pred: (x: T) => boolean): Generator<T> {
    for (const i of iter) {
        if (pred(i)) yield i
    }
}

export function sum(iter: Iterable<number>): number {
    return foldl(iter, 0, (a, b) => a + b);
}

export function all<T>(iter: Iterable<T>): boolean {
    return foldl(map(iter, Boolean), true, (a, b) => a && b);
}

export function any<T>(iter: Iterable<T>): boolean {
    return foldl(map(iter, Boolean), false, (a, b) => a || b);
}

export function has<T>(iter: Iterable<T>, pred: (x: T) => boolean): boolean {
    return any(map(iter, pred));
}

export function contains<T>(iter: Iterable<T>, elem: T, compare: (a: T, b: T) => boolean = (a, b) => a === b): boolean {
    return has(iter, x => compare(x, elem))
}

export function* concat<T>(...iter: Iterable<T>[]): Generator<T, any, undefined> {
    for (const i of iter) yield* i
}

export function* enumerate<T>(iter: Iterable<T>, start = 0): Generator<[number, T]> {
    let idx = start;
    for (const i of iter) yield [idx++, i]
}

export function max<T, K=T>(iter: Iterable<T>, key: (x: T) => K = x => x as unknown as K): T {
    return foldl(map(iter, x => [x, key(x)] as const), [undefined as unknown as T, -Infinity as unknown as K] as const, ([l, lk], [r, rk]) => lk >= rk ? [l, lk] as const : [r, rk] as const)[0]
}

export function min<T, K=T>(iter: Iterable<T>, key: (x: T) => K = x => x as unknown as K): T {
    return foldl(map(iter, x => [x, key(x)] as const), [undefined as unknown as T, Infinity as unknown as K] as const, ([l, lk], [r, rk]) => lk <= rk ? [l, lk] as const : [r, rk] as const)[0]
}

export function reversed<T>(iter: Iterable<T>): T[] {
    return array(iter).reverse()
}

export function first<T>(iter: Iterable<T>): T {
    return iter[Symbol.iterator]().next().value;
}

export function take<T>(n: number, iter: Iterable<T>): T[] {
    const a = [];
    for (const i of iter) {
        a.push(i);
        if (a.length === n) return a;
    }
    return a;
}

export function* chunked<T>(iter: Iterable<T>, n: number): Generator<T[]> {
    let chunk = [];
    
    for (const i of iter) {
        chunk.push(i);
        if (chunk.length === n) {
            yield chunk;
            chunk = [];
        }
    }

    if (chunk.length > 0)
        yield chunk;
}

export function* flat<T>(iter: Iterable<Iterable<T>>): Generator<T, any, undefined> {
    for (const i of iter) yield* i
}

export function* iterate<S>(seed: S, f: (x: S) => S): Generator<S> {
    while (true) {
        yield seed;
        seed = f(seed);
    }
}

export function* windowed<T>(n: number, iter: Iterable<T>, opts?: { fill?: T, step?: number }): Generator<T[]> {
    const fill = opts?.fill;
    const step = opts?.step ?? 1;

    if (n < 0) throw new ValueError("n can't be less than 0");
    if (n === 0) { yield []; return }
    if (step < 1) throw new ValueError('step must be >= 1')
    let window = [];
    let i = n;

    for (const e of iter) {
        window.push(e);
        if (window.length > n) window.shift();
        i -= 1;
        if (i === 0) {
            i = step;
            yield [...window]
        }
    }

    const size = window.length;
    if (size < n) {
        yield array(concat(window, repeat(fill as T, n - size)))
    } else if (0 < i && i < Math.min(step, n)) {
        window.concat(...repeat(fill as T, i));
        yield [...window]
    }
}

export function groupby<T, K extends PropertyKey>(iter: Iterable<T>, keyfunc: (x: T) => K): Record<K, T[]> {
    const o = {} as Record<K, T[]>;
    for (const i of iter) {
        const k = keyfunc(i);
        o[k] ??= [];
        o[k].push(i)
    }

    return o;
}

export function* grouped<T, K>(iter: Iterable<T>, keyfunc: (x: T) => K): Iterable<T[]> {
    let k = keyfunc(first(iter));
    
    let chunk: T[] = [];
    for (const i of iter) {
        const kk = keyfunc(i);
        if (equals(kk, k)) chunk.push(i)
        else {
            yield chunk;
            k = kk;
            chunk = [i];
        }
    }

    if (chunk.length > 0) yield chunk;
}

export function all_equal<T>(iter: Iterable<T>, check_fn = (a: T, b: T) => a === b ) {
    const f = first(iter);
    return all(map(iter, x => check_fn(x, f)));
}

export function transpose<T>(iter: T[][]): T[][] {
    return array(zip(...iter));
}

// @ts-ignore
window.grouped = grouped;
// @ts-ignore
window.permutations = permutations