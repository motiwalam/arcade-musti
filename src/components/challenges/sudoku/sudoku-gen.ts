import { choose_random, shuffle, without } from "../../../util/array";
import { flow } from "../../../util/flow";
import { array, range, chunked, first, product } from "../../../util/itertools";
import { solve_sudoku } from "./sudoku";

type Grid = number[][];

export function rotate(grid: Grid): Grid {
    const amount = choose_random([0, 90, 180, 270]) as 0 | 90 | 180 | 270
    switch (amount) {
        case 0:
            return grid;

        case 90:
            return grid[0].map((_, index) => grid.map((row) => row[index]).reverse());

        case 180:
            return grid.map((row) => [...row].reverse()).reverse();

        case 270:
            return grid[0].map((_, index) => grid.map((row) => [...row].reverse()[index]));
    }
}

export function shuffle_rows(grid: Grid): Grid {
    return shuffle(grid);
}

export function shuffle_cols(grid: Grid): Grid {
    const idxs = shuffle(array(range(grid.length)));
    return grid.map(
        row => row.map((_, i) => row[idxs[i]])
    )
}

export function shuffle_bands(grid: Grid, size: number): Grid {
    const bands = chunked(grid, size);
    return shuffle(array(bands)).flat()
}

export function shuffle_stacks(grid: Grid, size: number): Grid {
    const idxs = shuffle(array(range(size)));
    return grid.map(
        row => {
            const stacks = array(chunked(row, size));
            return stacks.map((_, i) => stacks[idxs[i]]).flat()
        }
    )
}


export function swap_nums(grid: Grid): Grid {
    const nums = array(range(1, grid.length + 1));
    const n1 = choose_random(nums);
    const n2 = choose_random(without(nums, n1));

    return grid.map(
        row => row.map(n => n === n1 ? n2 : n === n2 ? n1 : n)
    )
}

function empty_grid(size: number): Grid {
    return Array(size ** 2).fill(0).map(() => Array(size ** 2).fill(0))
}

function remove_cells(grid: Grid, size: number): Grid {
    const coords = shuffle(array(product(range(grid.length), range(grid.length))));

    // remove 2/3 +- some random delta of numbers

    for (const [y, x] of coords.slice(Math.floor(size ** 4 / 3 + Math.random() * size**2))) {
        grid[y][x] = 0;
    }

    // for (const [y, x] of coords) {
    //     const n = grid[y][x];
    //     grid[y][x] = 0;
    //     if (take(2, solve_sudoku([size, size], deep_copy(grid))).length === 2) {
    //         grid[y][x] = n;
    //     }
    // }

    return grid;
}

export function create_sudoku(size: number): Grid {
    // create valid filled board (by using solver on empty grid)
    const board = flow(
        () => empty_grid(size),
        (x: Grid) => first(solve_sudoku([size, size], x)),
        (x: Grid) => shuffle_bands(x, size),
        (x: Grid) => shuffle_stacks(x, size),
        // shuffle_rows,
        // shuffle_cols,
        swap_nums,
        rotate,
    )(undefined);

    return remove_cells(board, size);

    // remove cells until unique solution   
}
