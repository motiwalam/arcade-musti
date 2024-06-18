import { choose_random, swap } from "../../../util/array";
import { array, filter, foldl, iterate, map, range, take } from "../../../util/itertools";

export function valid_neighbours(width: number, height: number, index: number): Iterable<number> {
    const y = Math.floor(index / width);
    const x = index - width * y;

    return map(
        filter(
            map(
                [ [-1, 0], [1, 0], [0, -1], [0, 1] ],
                ([yoff, xoff]) => [y + yoff, x + xoff]
            ),
            ([y, x]) => 0 <= y && y < height && 0 <= x && x < width
        ),
        ([y, x]) => y * width + x
    )
}

export function generate(width: number, height: number, moves: number = 1000): number[] {
    const N = width * height;
    const indices = take(moves, iterate(N - 1, i => choose_random(array(valid_neighbours(width, height, i)))));
    return foldl<[number[], number], number>(
        indices,
        [[...range(1, N), 0], N - 1],
        ([grid, i], j) => [swap(grid, i, j), j],
    )[0]
}