import { useState, useEffect } from "react";

function getStorageValue<T>(key: string, defaultValue: T) {
    const saved = localStorage.getItem(key) || 'false';
    const initial = JSON.parse(saved) as T;
    return initial || defaultValue;
}

export function useLocalStorage<T>(key: string, defaultValue: T | (() => T)) {
    const [value, setValue] = useState(() => getStorageValue(key, defaultValue instanceof Function ? defaultValue() : defaultValue));
    useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value]);
    return [value, setValue] as const;
}
