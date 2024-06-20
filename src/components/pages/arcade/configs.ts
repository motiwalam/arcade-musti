import { Games } from "../../../types";
import { parse_flow_free_level } from "../../challenges/flow/flow-level-specs";
import { SupportedGames } from "./supported";
import { crosslogics } from "../../../data/cross-logics";

export type ConfigProps<G extends SupportedGames> = {
    config: Games[G];
    setConfig: (x: Games[G] | ((x: Games[G]) => any)) => void
}

export function default_config(game: SupportedGames) {
    switch (game) {
        case 'wordle':
            return { wordlength: 5, tries: 6 }

        case 'fifteen':
            return { width: 4, height: 4 }

        case 'sudoku':
            return { board: 'random', size: 3 }

        case 'minesweeper':
            return { width: 10, height: 10, mines: 10 }

        case 'flow':
            return parse_flow_free_level(
                '5,0,1,5;18,17,12;21,16,11,6;3,4,9;0,1,2,7,8,13,14,19,24,23,22;20,15,10,5',
                'square'
            )

        case 'game24':
            return {
                target: 24,
                numbers: [1, 2, 3, 4],
                operators: ["+", "-", "*", "/", "^"],
                solutions_to_calc: 'all'
            }

        case "anagram":
            return {
                letters: "",
                use_all: false,
                target_score: 100,
                minlength: 4
            }

        case 'game2048':
            return {
                width: 4,
                height: 4,

                base: 2,
                target_power: 11
            }

        case 'crosslogic':
            return crosslogics[0];
    }
}