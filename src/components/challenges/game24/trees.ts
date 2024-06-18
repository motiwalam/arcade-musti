import { product, range } from "../../../util/itertools"

export class Node {
    constructor(
        public children: Node[],
        public name: string = 'x',
        public value?: number | ((...args: number[]) => number),
    ) {}

    toString(): string {
        if (this.is_leaf) return this.name
        if (this.arity === 2) {
            return `(${this.children[0]} ${this.name} ${this.children[1]})`
        }

        return `(${this.name} ${this.children.map(c => c.toString()).join(' ')})`
    }

    get arity() { return this.children.length }
    get is_leaf() { return this.arity === 0 }
}

export function* nleaves(n: number, a: number[]) {
    for (const b of a) yield* _nleaves(n, b, a)
}

export function* _nleaves(n: number, k: number, a: number[]): Generator<Node> {
    if      (n === 1) yield new Node([])
    else if (k === 1) yield* nleaves(n, a)
    else {
        for (const i of range(1, n - k + 2)) {
            for (const [r, l] of product(nleaves(i, a), _nleaves(n - i, k - 1, a))) {
                if (k === 2) yield new Node([l, r], 'f');
                else         yield new Node([...l.children, r], 'f')
            }
        }
    }
}