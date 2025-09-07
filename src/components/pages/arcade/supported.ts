import { Games } from "../../../types";

export const supported_games = [
    "wordle",
    "sudoku",
    "flow",
    "minesweeper",
    "fifteen",
    "game24",
    "anagram",
    "game2048",
    "crosslogic",
    "pips",
] as const;

export type SupportedGames = (typeof supported_games)[number]

let _: SupportedGames extends keyof Games ? true : false = true