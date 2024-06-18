import name_to_hex_map from "../data/color-map";

export type HexDigit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'A' | 'B' | 'C' | 'D' | 'E'
export type HexColor = `#${string}`

export type Aliases = keyof typeof name_to_hex_map;

export type Color = HexColor | Aliases;