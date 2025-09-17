<template>
    <Transition name="fade">
        <div v-if="visible" class="loading-overlay">
            <div class="loading-content">
                <ProgressSpinner
                    v-if="!progress"
                    :style="{ width: spinnerSize, height: spinnerSize }"
                    :stroke-width="strokeWidth"
                />
                <ProgressBar
                    v-else
                    :value="progress"
                    :show-value="showProgressValue"
                    class="loading-progress"
                />
                <div v-if="message" class="loading-message mt-3">
                    {{ message }}
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { computed } from "vue";
import ProgressSpinner from "primevue/progressspinner";
import ProgressBar from "primevue/progressbar";

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    message: {
        type: String,
        default: "",
    },
    progress: {
        type: Number,
        default: 0,
    },
    fullscreen: {
        type: Boolean,
        default: false,
    },
    size: {
        type: String,
        default: "medium",
        validator: (value) => ["small", "medium", "large"].includes(value),
    },
    showProgressValue: {
        type: Boolean,
        default: true,
    },
});

const spinnerSize = computed(() => {
    const sizes = {
        small: "30px",
        medium: "50px",
        large: "70px",
    };
    return sizes[props.size];
});

const strokeWidth = computed(() => {
    const widths = {
        small: "4",
        medium: "6",
        large: "8",
    };
    return widths[props.size];
});
</script>

<style scoped>
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    border-radius: inherit;
}

.loading-content {
    background: var(--surface-card);
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    text-align: center;
    min-width: 200px;
}

.loading-progress {
    min-width: 250px;
}

.loading-message {
    color: var(--text-color);
    font-size: 1rem;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Fullscreen variant */
.fullscreen .loading-overlay {
    position: fixed;
}
</style>
