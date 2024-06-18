import { LazyExoticComponent, lazy } from "react";
import { Games, ChallengeProps, challenge_types, Challenge } from "../types";
import { camel_case } from "../util/strings";

// @ts-ignore
export const CHALLENGE_COMPONENTS: {
    [k in keyof Games]: LazyExoticComponent<(p: ChallengeProps<k>) => JSX.Element>
} = Object.fromEntries(challenge_types.map(k => [
    k, lazy(() => import(`../components/challenges/${k}/${camel_case(k)}Challenge`))
]))

export function createChallengeComponent(challenge: Challenge, id: string, handleWin: () => void) {
    const C = CHALLENGE_COMPONENTS[challenge.type];
    // @ts-ignore
    return <C handleWin={handleWin} id={id} challenge={challenge.config}></C> 
}