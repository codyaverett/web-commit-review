import { ref, computed } from "vue";

export function useLoading(initialState = false) {
    const isLoading = ref(initialState);
    const loadingMessage = ref("");
    const loadingProgress = ref(0);

    // Start loading with optional message
    const startLoading = (message = "") => {
        isLoading.value = true;
        loadingMessage.value = message;
        loadingProgress.value = 0;
    };

    // Stop loading and reset
    const stopLoading = () => {
        isLoading.value = false;
        loadingMessage.value = "";
        loadingProgress.value = 0;
    };

    // Update progress (0-100)
    const updateProgress = (progress) => {
        loadingProgress.value = Math.min(100, Math.max(0, progress));
    };

    // Update message
    const updateMessage = (message) => {
        loadingMessage.value = message;
    };

    // Computed property for formatted progress
    const progressPercentage = computed(() => `${loadingProgress.value}%`);

    // Execute async function with loading state
    const withLoading = async (asyncFn, message = "") => {
        try {
            startLoading(message);
            const result = await asyncFn();
            return result;
        } finally {
            stopLoading();
        }
    };

    return {
        isLoading,
        loadingMessage,
        loadingProgress,
        progressPercentage,
        startLoading,
        stopLoading,
        updateProgress,
        updateMessage,
        withLoading,
    };
}

// Global loading state for app-level operations
const globalLoading = useLoading();

export function useGlobalLoading() {
    return globalLoading;
}
