<template>
    <div class="status-badge" :class="badgeClass" @click="handleClick">
        <span class="status-dot" :class="dotClass" />
        <span class="status-label">{{ status }}</span>
        <span class="status-count font-semibold">{{ count }}</span>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    status: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        required: true,
    },
});

const emit = defineEmits(["click"]);

const handleClick = () => {
    emit("click", props.status);
};

const statusConfig = {
    Active: {
        badge: "badge-active",
        dot: "dot-active",
    },
    "Under Review": {
        badge: "badge-review",
        dot: "dot-review",
    },
    Implemented: {
        badge: "badge-implemented",
        dot: "dot-implemented",
    },
    Archived: {
        badge: "badge-archived",
        dot: "dot-archived",
    },
};

const config = computed(
    () => statusConfig[props.status] || statusConfig.Active
);
const badgeClass = computed(() => config.value.badge);
const dotClass = computed(() => config.value.dot);
</script>

<style scoped>
.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;
    user-select: none;
}

.status-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-badge:active {
    transform: scale(0.98);
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.status-label {
    color: inherit;
}

.status-count {
    margin-left: 0.25rem;
}

/* Active status */
.badge-active {
    background-color: rgba(34, 197, 94, 0.1);
    color: rgb(22, 163, 74);
    border: 1px solid rgba(34, 197, 94, 0.2);
}

.dot-active {
    background-color: rgb(34, 197, 94);
}

/* Under Review status */
.badge-review {
    background-color: rgba(251, 146, 60, 0.1);
    color: rgb(234, 88, 12);
    border: 1px solid rgba(251, 146, 60, 0.2);
}

.dot-review {
    background-color: rgb(251, 146, 60);
}

/* Implemented status */
.badge-implemented {
    background-color: rgba(99, 102, 241, 0.1);
    color: rgb(79, 70, 229);
    border: 1px solid rgba(99, 102, 241, 0.2);
}

.dot-implemented {
    background-color: rgb(99, 102, 241);
}

/* Archived status */
.badge-archived {
    background-color: rgba(156, 163, 175, 0.1);
    color: rgb(107, 114, 128);
    border: 1px solid rgba(156, 163, 175, 0.2);
}

.dot-archived {
    background-color: rgb(156, 163, 175);
}

/* Dark theme adjustments */
.dark-theme .badge-active {
    background-color: rgba(34, 197, 94, 0.2);
    color: rgb(74, 222, 128);
    border-color: rgba(34, 197, 94, 0.3);
}

.dark-theme .badge-review {
    background-color: rgba(251, 146, 60, 0.2);
    color: rgb(253, 186, 116);
    border-color: rgba(251, 146, 60, 0.3);
}

.dark-theme .badge-implemented {
    background-color: rgba(99, 102, 241, 0.2);
    color: rgb(129, 140, 248);
    border-color: rgba(99, 102, 241, 0.3);
}

.dark-theme .badge-archived {
    background-color: rgba(156, 163, 175, 0.2);
    color: rgb(209, 213, 219);
    border-color: rgba(156, 163, 175, 0.3);
}
</style>
