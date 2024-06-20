import { Buffer } from 'buffer';

export function encode(s: string): string {
    return Buffer.from(s).toString('base64');
}

export function decode(s: string): string {
    return Buffer.from(s, 'base64').toString();
}