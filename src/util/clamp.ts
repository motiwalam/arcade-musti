export function clamp(x: number, l: number, h: number) {
    return x < l ? l : x > h ? h : x
}