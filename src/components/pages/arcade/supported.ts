import { Games } from "../../../types";

export const supported_games = [
    "wordle",
    "sudoku",
    "pips",
    "flow",
    "minesweeper",
    "game2048",
    "fifteen",
    "game24",
    "anagram",
    "crosslogic",
] as const;

export type SupportedGames = (typeof supported_games)[number]

let _: SupportedGames extends keyof Games ? true : false = true