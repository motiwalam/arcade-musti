import { Node } from "./trees";

export function eval_tree(tree: Node): number {
    if (tree.is_leaf) return tree.value as number;
    return (tree.value as Function)(...tree.children.map(n => eval_tree(n)))   
}

export function safe_eval_tree<T>(tree: Node, def?: T): number | T {
    try {
        return eval_tree(tree)
    } catch {
        return def as T
    }
}