export const LANGS = ["en", "fr"] as const;

export type Lang = (typeof LANGS)[number];