import { array, range } from "../../../util/itertools";

function* names(n: number) {
    const chars = "xyz";
    const numc = chars.length;
    for (const i of range(n)) {
        const idx = i % numc;
        const subscript = i < numc ? '' : `${Math.floor(i / numc)}`
        yield chars[idx] + subscript
    }
}

export class Operator {
    constructor(
        public name: string,
        public f: (...args: number[]) => number,
        public max_applications?: number
    ) {}

    get argcount() {
        return this.f.length;
    }

    toString() {
        return `${this.name}(${array(names(this.argcount)).join(', ')})`
    }
}


export const add = new Operator('+', (a, b) => a + b);
export const sub = new Operator('-', (a, b) => a - b);
export const mul = new Operator('*', (a, b) => a * b);
export const div = new Operator('/', (a, b) => a / b);
export const pow = new Operator('^', (a, b) => a ** b);

export const arith_ops = [add, sub, mul, div, pow]