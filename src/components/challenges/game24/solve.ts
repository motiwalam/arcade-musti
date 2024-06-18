import { array, filter, flat, foldr, groupby, map, permutations, product, range, repeat, zip } from "../../../util/itertools";
import { safe_eval_tree } from "./evaluator";
import { arith_ops, Operator } from "./operators";
import { nleaves, Node } from './trees'

type OpTable = Record<number, Operator[]>

function apply_unary(apps: Operator[], tree: Node) {
    return foldr(apps, tree, (f, n) => new Node([n], f.name, f.f))
}

function optable(ops: Operator[]) {
    return groupby(ops, f => f.argcount)
}


function* possible_unary_apps(funcs: Operator[]): Generator<Operator[]> {
    for (const combo of product(...funcs.map(f => range((f.max_applications ?? 1) + 1)))) {
        const fs = flat(map(
            zip(funcs, combo),
            ([f, i]) => repeat(f, i) as Iterable<typeof f>
        ));

        yield* permutations(fs)
    }
}

function* possible_ops(tree: Node, table: OpTable): Generator<Node> {
    if (tree.is_leaf) yield tree
    else {
        for (const [o, ...cs] of product(
            table[tree.arity],
            ...map(tree.children, c => possible_ops(c, table))
        )) yield new Node(cs, o.name, o.f)
    }
}

function with_leaves(tree: Node, ls: number[]): Node {
    if (tree.is_leaf) {
        const v = ls.pop();
        return new Node([], `${v}`, v)
    } else {
        return new Node(tree.children.map(c => with_leaves(c, ls)), tree.name, tree.value)
    }
}

function* with_unary(tree: Node, funcs: Operator[][]): Generator<Node> {
    for (const [app, ...cs] of product(funcs, ...tree.children.map(c => with_unary(c, funcs)))) {
        yield apply_unary(app, new Node(cs, tree.name, tree.value))
    }
}

function* possible_trees(tree: Node, ns: number[], table: OpTable): Generator<Node, any, undefined> {
    const unarys = array(possible_unary_apps(table[1] ?? []))
    for (const [tr, ls] of product(possible_ops(tree, table), permutations(ns))) {
        const v = with_leaves(tr, array(ls));
        yield* unarys.length === 0 ? [v] : with_unary(v, unarys)
    }
}

function* gen_exprs(ns: number[], ops: Operator[]): Generator<Node, any, undefined> {
    const table = optable(ops);
    const trees = nleaves(ns.length, array(filter(Object.keys(table).map(k => parseInt(k)), k => k !== 1)));

    for (const t of trees) {
        yield* possible_trees(t, ns, table);
    }
}

export function solve(ns: number[], target = 24, ops = arith_ops): Generator<Node> {
    return filter(
        gen_exprs(ns, ops),
        tree => safe_eval_tree(tree) === target
    )
}
