// Custom toast composable that replaces PrimeVue's useToast

export function useToast() {
    const add = (toast) => {
        if (typeof window !== "undefined" && window.__customToast) {
            return window.__customToast.add(toast);
        } else {
            // Fallback for SSR or when toast component isn't mounted
            console.warn("Toast not available:", toast);
        }
    };

    const remove = (id) => {
        if (typeof window !== "undefined" && window.__customToast) {
            return window.__customToast.remove(id);
        }
    };

    const clear = () => {
        if (typeof window !== "undefined" && window.__customToast) {
            return window.__customToast.clear();
        }
    };

    return {
        add,
        remove,
        clear,
    };
}
