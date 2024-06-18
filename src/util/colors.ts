import { Color } from "../types";
import name_to_hex_map from '../data/color-map';
import { shuffle } from "./array";

export function* color_generator(): Generator<Color, void, undefined> {
    const cherry_picked = [
        "green",
        "blue",
        "red",
        "orange",
        "maroon",
        "cyan",
        "gray",
        "violet",
        "black",
        "yellow",
        "bronze",
        "pink",
        "crimson"
    ] as const;

    yield* cherry_picked;

    while (true) {
        const colors = shuffle(Object.keys(name_to_hex_map) as Color[]).filter(c => !cherry_picked.includes(c as any));
        yield* colors;
    }
}