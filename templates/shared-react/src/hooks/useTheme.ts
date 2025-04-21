import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        setTheme(dark ? 'dark' : 'light');
    }, []);

    return { theme };
}
