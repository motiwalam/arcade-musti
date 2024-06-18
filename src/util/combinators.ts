export const on = <B, C>(f: (x: B) => (y: B) => C) => <A>(g: (x: A) => B) => (x: A) => (y: A) => f(g(x))(g(y));
export const on3 = <a, b, c, d, e>
    (f: (x: c) => (y: d) => e) =>
    (g: (x: a) => (y: b) => c) =>
    (h: (x: a) => (y: b) => d) =>
    (x: a) =>
    (y: b) =>
    f(g(x)(y))(h(x)(y))
