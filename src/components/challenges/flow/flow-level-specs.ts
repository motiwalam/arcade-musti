// parse level specs as they are found in the flow free v5.4 apk

import { Games } from "../../../types";
import { color_generator } from "../../../util/colors";
import { array, map, repeat, take, zip } from "../../../util/itertools";
import { fromEntries } from "../../../util/object";

type Coord = [number, number]
type Parser = (x: string) => Games["flow"]
type SupportedLevelTypes = "square" | "rectangle"

function parse_rectangular(width: number, height: number, flow_specs: string[]): Games["flow"] {
    const coord = (n: number) => [Math.floor(n / width), n - width * (Math.floor(n / width))] as Coord;
    const paths = flow_specs.map(flow => flow.split(',').map(n => parseInt(n))).map(p => p.map(coord));
    const points = map(paths, ([start, ...rest]) => [start, rest.at(-1)] as [Coord, Coord]);
    const colors = take(paths.length, color_generator());

    return {
        width, height,
        terminals: array(
            map(
                zip(points, colors),
                ([[start, end], color]) => ({ start, end, color })
            )
        ),

        solutions: fromEntries(zip(colors, paths))
    }
}

const parsers: Record<SupportedLevelTypes, Parser> = {
    square: spec => {
        const [first, ...rest] = spec.split(';');
        const [width, height] = repeat(parseInt(first.split(',')[0]), 2);
        
        return parse_rectangular(width, height, rest)
    },

    rectangle: spec => {
        const [first, ...rest] = spec.split(';');
        const [width, height] = first.split(',')[0].split(':').map(n => parseInt(n));

        return parse_rectangular(width, height, rest)
    }
}

export function parse_flow_free_level(spec: string, level_type: SupportedLevelTypes) {
    return parsers[level_type](spec);
}
