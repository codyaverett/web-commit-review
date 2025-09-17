<template>
    <div class="toast-container">
        <TransitionGroup name="toast" tag="div" class="toast-list">
            <div
                v-for="toast in toasts"
                :key="toast.id"
                :class="[
                    'toast-message',
                    `toast-${toast.severity}`,
                    { 'toast-closable': toast.closable !== false },
                ]"
                @click="toast.life && removeToast(toast.id)"
            >
                <div class="toast-content">
                    <div class="toast-icon">
                        <i :class="getIconClass(toast.severity)" />
                    </div>
                    <div class="toast-body">
                        <div v-if="toast.summary" class="toast-summary">
                            {{ toast.summary }}
                        </div>
                        <div v-if="toast.detail" class="toast-detail">
                            {{ toast.detail }}
                        </div>
                    </div>
                    <button
                        v-if="toast.closable !== false"
                        class="toast-close"
                        aria-label="Close"
                        @click.stop="removeToast(toast.id)"
                    >
                        <i class="pi pi-times" />
                    </button>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const toasts = ref([]);
let toastIdCounter = 0;

const getIconClass = (severity) => {
    const icons = {
        success: "pi pi-check-circle",
        info: "pi pi-info-circle",
        warn: "pi pi-exclamation-triangle",
        error: "pi pi-times-circle",
    };
    return icons[severity] || icons.info;
};

const addToast = (toast) => {
    const id = ++toastIdCounter;
    const newToast = {
        id,
        severity: toast.severity || "info",
        summary: toast.summary,
        detail: toast.detail,
        life: toast.life !== undefined ? toast.life : 3000,
        closable: toast.closable !== false,
        ...toast,
    };

    toasts.value.push(newToast);

    if (newToast.life > 0) {
        setTimeout(() => {
            removeToast(id);
        }, newToast.life);
    }

    return id;
};

const removeToast = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index > -1) {
        toasts.value.splice(index, 1);
    }
};

const clearToasts = () => {
    toasts.value = [];
};

// Global toast API
const toastAPI = {
    add: addToast,
    remove: removeToast,
    clear: clearToasts,
};

// Make the API globally available
onMounted(() => {
    if (typeof window !== "undefined") {
        window.__customToast = toastAPI;
    }
});

onUnmounted(() => {
    if (typeof window !== "undefined") {
        delete window.__customToast;
    }
});

defineExpose({
    add: addToast,
    remove: removeToast,
    clear: clearToasts,
});
</script>

<style scoped>
.toast-container {
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 9999;
    pointer-events: none;
}

.toast-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.toast-message {
    min-width: 300px;
    max-width: 400px;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    pointer-events: auto;
    cursor: pointer;
    overflow: hidden;
    position: relative;
}

.toast-content {
    display: flex;
    align-items: flex-start;
    padding: 1rem;
    gap: 0.75rem;
}

.toast-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
}

.toast-icon i {
    font-size: 1.25rem;
}

.toast-body {
    flex: 1;
    min-width: 0;
}

.toast-summary {
    font-weight: 600;
    font-size: 0.9rem;
    line-height: 1.3;
    margin-bottom: 0.25rem;
    color: var(--text-color);
}

.toast-detail {
    font-size: 0.85rem;
    line-height: 1.4;
    color: var(--text-color-secondary);
}

.toast-close {
    flex-shrink: 0;
    background: none;
    border: none;
    color: var(--text-color-secondary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.toast-close:hover {
    background: var(--surface-hover);
    color: var(--text-color);
}

.toast-close i {
    font-size: 0.875rem;
}

/* Severity variants */
.toast-success {
    border-left: 4px solid var(--green-500);
}

.toast-success .toast-icon {
    color: var(--green-500);
}

.toast-info {
    border-left: 4px solid var(--blue-500);
}

.toast-info .toast-icon {
    color: var(--blue-500);
}

.toast-warn {
    border-left: 4px solid var(--yellow-500);
}

.toast-warn .toast-icon {
    color: var(--yellow-500);
}

.toast-error {
    border-left: 4px solid var(--red-500);
}

.toast-error .toast-icon {
    color: var(--red-500);
}

/* Dark theme adjustments */
.dark-theme .toast-message {
    background: #2d2d2d;
    border: 1px solid #404040;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 1);
}

.dark-theme .toast-summary {
    color: #ffffff;
}

.dark-theme .toast-detail {
    color: #e0e0e0;
}

.dark-theme .toast-close {
    color: #e0e0e0;
}

.dark-theme .toast-close:hover {
    background: var(--surface-hover);
    color: #ffffff;
}

.dark-theme .toast-success {
    background: #2d2d2d;
    border-left: 4px solid var(--green-400);
}

.dark-theme .toast-info {
    background: #2d2d2d;
    border-left: 4px solid var(--blue-400);
}

.dark-theme .toast-warn {
    background: #2d2d2d;
    border-left: 4px solid var(--yellow-400);
}

.dark-theme .toast-error {
    background: #2d2d2d;
    border-left: 4px solid var(--red-400);
}

/* Transitions */
.toast-enter-active {
    transition: all 0.3s ease-out;
}

.toast-leave-active {
    transition: all 0.3s ease-in;
}

.toast-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.toast-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

.toast-move {
    transition: transform 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 640px) {
    .toast-container {
        top: 70px;
        right: 10px;
        left: 10px;
    }

    .toast-message {
        min-width: auto;
        max-width: none;
    }
}
</style>
