import { ref, onMounted, onUnmounted, nextTick } from "vue";

export function useD3Resize(containerRef, drawFunction, debounceMs = 150) {
    let resizeObserver = null;
    let resizeTimeout = null;
    let mutationObserver = null;
    const isResizing = ref(false);

    // Debounced resize handler
    const handleResize = () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }

        isResizing.value = true;

        resizeTimeout = setTimeout(() => {
            if (containerRef.value) {
                // Use nextTick to ensure DOM is updated
                nextTick(() => {
                    drawFunction();
                    isResizing.value = false;
                });
            }
        }, debounceMs);
    };

    // Setup resize observer
    const setupResizeObserver = () => {
        if (!containerRef.value) return;

        // Clean up existing observer
        cleanupResizeObserver();

        resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(containerRef.value);
    };

    // Setup mutation observer for theme changes
    const setupMutationObserver = () => {
        mutationObserver = new MutationObserver(() => {
            handleResize();
        });

        mutationObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
    };

    // Cleanup resize observer
    const cleanupResizeObserver = () => {
        if (resizeObserver && containerRef.value) {
            resizeObserver.unobserve(containerRef.value);
            resizeObserver.disconnect();
            resizeObserver = null;
        }

        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
            resizeTimeout = null;
        }
    };

    // Cleanup mutation observer
    const cleanupMutationObserver = () => {
        if (mutationObserver) {
            mutationObserver.disconnect();
            mutationObserver = null;
        }
    };

    // Setup on mount
    onMounted(() => {
        setupResizeObserver();
        setupMutationObserver();

        // Initial draw
        nextTick(() => {
            if (containerRef.value) {
                drawFunction();
            }
        });
    });

    // Cleanup on unmount
    onUnmounted(() => {
        cleanupResizeObserver();
        cleanupMutationObserver();
    });

    return {
        isResizing,
        handleResize,
        setupResizeObserver,
    };
}
