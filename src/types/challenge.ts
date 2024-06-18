import { Games } from "./api"

export type ChallengeProps<T extends keyof Games> = {
    challenge: Games[T];
    handleWin: () => void;
    id: string;
}