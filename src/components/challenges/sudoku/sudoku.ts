// @ts-nocheck
import { equals } from "../../../util/equality";
import { KeyedDict, KeyedSet } from "../../../util/datatype";
import { array, concat, enumerate, map, min, product, range, reversed } from "../../../util/itertools"

type Coord = [number, number]
type Grid = number[][]

export function* visible_coords([y, x]: Coord, sudoku_size: number): Generator<Coord> {
    yield* map(range(sudoku_size ** 2), y1 => [y1, x]); // column
    yield* map(range(sudoku_size ** 2), x1 => [y, x1]); // row
    yield* product(
        range(sudoku_size * Math.floor(y / sudoku_size), sudoku_size * (Math.floor(y / sudoku_size) + 1)),
        range(sudoku_size * Math.floor(x / sudoku_size), sudoku_size * (Math.floor(x / sudoku_size) + 1)),
    )
}

export function* coord_groups(sudoku_size: number): Generator<Iterable<Coord>> {
    yield* map(range(sudoku_size ** 2), y => map(range(sudoku_size ** 2), x => [y, x]))
    yield* map(range(sudoku_size ** 2), x => map(range(sudoku_size ** 2), y => [y, x]))
    yield* map(product(range(sudoku_size), range(sudoku_size)), ([y, x]) => {
        return product(
            range(sudoku_size * y, sudoku_size * (y + 1)),
            range(sudoku_size * x, sudoku_size * (x + 1))
        )
    })
}

function exact_cover(_X, Y: KeyedDict) {
    const X = new KeyedDict(JSON.stringify, JSON.parse);
    for (const j of _X) {
        X.set(j, new KeyedSet(JSON.stringify, JSON.parse))
    }
    for (const [i, row] of Y.items()) {
        for (const j of row) {
            X.get(j).add(i)
        }
    }
    return [X, Y]
}

function select(X, Y, r) {
    const cols = [];
    for (const j of Y.get(r)) {
        for (const i of X.get(j)) {
            for (const k of Y.get(i)) {
                if (!equals(k, j)) {
                    X.get(k).delete(i)
                }
            }
        }

        cols.push(X.pop(j))
    }
    return cols;
}

function deselect(X, Y, r, cols) {
    for (const j of reversed(Y.get(r))) {
        X.set(j, cols.pop())
        for (const i of X.get(j)) {
            for (const k of Y.get(i)) {
                if (!equals(k, j)) {
                    X.get(k).add(i)
                }
            }
        }
    }
}

function* solve(X, Y, solution = []) {
    if (array(X).length === 0) yield array(solution);
    else {
        const c = min(X, c => X.get(c).size)
        for (const r of array(X.get(c))) {
            solution.push(r);
            const cols = select(X, Y, r);
            for (const s of solve(X, Y, solution)) {
                yield s
            };
            deselect(X, Y, r, cols);
            solution.pop()
}
    }        
}

export function* solve_sudoku([R, C]: [number, number], grid: Grid): Generator<Grid> {
    const N = R * C;
    let X = concat(
        map(product(range(N), range(N)), rc => ["rc" as string, rc] as const),
        map(product(range(N), range(1, N + 1)), rn => ["rn", rn] as const),
        map(product(range(N), range(1, N + 1)), cn => ["cn", cn] as const),
        map(product(range(N), range(1, N + 1)), bn => ["bn", bn] as const),
    );
    let Y = new KeyedDict<number[], [string, [number, number]][], string>(JSON.stringify, JSON.parse);
    for (const [r, c, n] of product(range(N), range(N), range(1, N + 1))) {
        const b = Math.floor(r / R) * R + Math.floor(c / C);
        Y.set(
            [r, c, n],
            [
                ["rc", [r, c]],
                ["rn", [r, n]],
                ["cn", [c, n]],
                ["bn", [b, n]]
            ]
        )
    }
    [X, Y] = exact_cover(X, Y)
    for (const [i, row] of enumerate(grid)) {
        for (const [j, n] of enumerate(row)) {
            if (n !== 0) select(X, Y, [i, j, n]) 
        }
    }

    for (const solution of solve(X, Y, [])) {
        for (const [r, c, n] of solution) {
            grid[r][c] = n;
        }
        yield grid;
    }
}
