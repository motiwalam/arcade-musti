import { map } from "./itertools";
export class KeyedSet<T, K=string> extends Set {
    key: (x: T) => K;
    inverse_key: (x: K) => T;

    constructor(keyfn: (x: T) => K, inverse_keyfn: (x: K) => T) {
        super();
        this.key = keyfn;
        this.inverse_key = inverse_keyfn;
    }

    add(elem: T) {
        return super.add(this.key(elem))
    }

    has(elem: T) {
        return super.has(this.key(elem))
    }

    delete(elem: T) {
        return super.delete(this.key(elem))
    }

    pop() {
        const i = this[Symbol.iterator]().next().value as T;
        this.delete(i);
        return i;
    }

    [Symbol.iterator]() {
        return map(super[Symbol.iterator](), this.inverse_key)
    }
}

export class KeyedDict<K, V, S extends PropertyKey> extends Object {
    key: (x: K) => S;
    inverse_key: (x: S) => K;
    
    private obj: Record<S, V>;

    constructor(keyfn: (x: K) => S, inverse_keyfn: (x: S) => K) {
        super();
        this.key = keyfn;
        this.inverse_key = inverse_keyfn;

        this.obj = {} as Record<S, V>;
    }

    [Symbol.iterator]() {
        return map(
            Object.keys(this.obj),
            k => this.inverse_key(k as S)
        )
    }

    set(k: K, v: V) {
        this.obj[this.key(k)] = v;
    }

    get(k: K) {
        return this.obj[this.key(k)]
    }

    pop(k: K) {
        const v = this.get(k);
        delete this.obj[this.key(k)];
        return v;
    }

    items() {
        return map(
            Object.entries(this.obj),
            ([k, v]) => [this.inverse_key(k as S), v]
        )
    }

}