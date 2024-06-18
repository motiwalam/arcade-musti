export const equal = <A>(a: A) => (b: A) => a === b;
export const and   = <A>(a: A) => (b: A) => a && b;

export const uncurry = <A, B, C>(f: (x: A) => (y: B) => C) => (x: A, y: B) => f(x)(y)
export const id = <a>(x: a): a => x