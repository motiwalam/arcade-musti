import { choose_random, shuffle } from "./array"
import { take } from "./itertools"

export function camel_case(s: string): string {
    return s.split('_')
            .map(p => p[0].toUpperCase() + p.slice(1))
            .join('')
}

export function scramble(s: string): string {
    return shuffle([...s]).join('')
}

export function randomString(n: number = 15): string {
    function* chars() {
        while (true) yield choose_random([...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'])
    }

    return take(n, chars()).join('')
}

export function one_of_norm(...poss: string[]) {
    return (s: string) => poss.includes(s.toLowerCase())
}

export function trimmed(n: number, s: string, suffix = '...') {
    return s.length - suffix.length > n ? s.slice(0, -(n + suffix.length)) + suffix : s
}