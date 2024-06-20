import { ItemStatus } from "./status";
import { Color } from './color';
import { CluesInputOriginal } from "@jaredreisinger/react-crossword/dist/types";
import { Equal } from "./unions";
export interface Games {
    wordle: {
        wordlength: number;
        tries: number;
        solution?: string;
    };

    game24: {
        target: number;
        numbers: number[];
        operators: string[];
        solutions_to_calc?: 'all' | number
    };

    hangman: {
        word: string;
        category?: string;
    };

    token: {
        prompt: string;
        token: string
    };

    sudoku: {
        size: number;
        board: 'random' | number[][]
    };

    truths_and_lies: {
        truths: string[];
        lies: string[]
    };

    anagram: {
        letters: string;
        use_all: boolean;
        target_score: number;
        minlength: number;
    };

    trivia: {
        question: string;
        validator: (x: string) => boolean;
    };

    guessing_game: {
        hints: string[];
        validator: (x: string) => boolean;
    };

    flow: {
        width: number;
        height: number;
        
        terminals: {
            start: [number, number];
            end: [number, number];
            color: Color;
        }[];

        solutions: Record<Color, [number, number][]>
    };

    minesweeper: {
        width: number;
        height: number;
        mines: number;
    };

    fifteen: {
        width: number;
        height: number;
    };

    crossword: {
        data: CluesInputOriginal;
    };

    crosslogic: {
        sets: [string, string[]][];
        solution: string[][];
        clues: string[];
        story?: string
    };

    game2048: {
        width: number;
        height: number;

        base: number;
        target_power: number;
    };

    unimplemented: {}
}

export const challenge_types = [
    'wordle',
    'game24',
    'hangman',
    'token',
    'sudoku',
    'truths_and_lies',
    'anagram',
    'trivia',
    'guessing_game',
    'flow',
    'minesweeper',
    'fifteen',
    'crossword',
    'crosslogic',
    'game2048',
    'unimplemented'
] as const;

let _: Equal<(typeof challenge_types)[number], keyof Games> = true

export type Challenge = {
    [k in keyof Games]: {
        type: k;
        config: Games[k]
    }
}[keyof Games]

export type SupportedMimeTypes = 'text/plain' | 'image/png' | 'image/jpg' | 'video/mp4' | 'audio/ogg' | 'audio/mpeg'

export interface Prize {
    endpoint: string;
    mime: SupportedMimeTypes;
    description?: string;
    keywords?: string[]
}

export interface Day {
    challenge: Challenge;
    prize: Prize;
}

export type ChallengeMap = Record<number, Day>

export interface ProgressData {
    start?: number;
    statuses: ItemStatus[];
}

export const default_prize: Prize = {
    endpoint: "unimplemented",
    mime: "text/plain"
}

export const default_challenge: Challenge = {
    type: "unimplemented",
    config: {}
}