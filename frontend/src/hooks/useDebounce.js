import { useState, useEffect } from "react";

/**
 * Returns a debounced version of `value` that only updates after
 * `delay` ms of inactivity. Used by search inputs to avoid
 * firing an API request on every keystroke.
 */
export function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);

    return debounced;
}
