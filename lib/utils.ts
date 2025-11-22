import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateId() {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        try {
            return window.crypto.randomUUID();
        } catch (e) {
            // Fallback if randomUUID fails (e.g. insecure context)
        }
    }
    
    // Fallback implementation of UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
