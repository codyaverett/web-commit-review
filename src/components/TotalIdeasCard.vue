<template>
    <div
        class="total-ideas-card surface-card p-3 border-round shadow-1 justify-content-center"
    >
        <div class="flex gap-3">
            <!-- Left section: Total Ideas -->
            <div class="flex align-items-center justify-content-center gap-2">
                <div class="text-center">
                    <div class="text-xs text-500 mb-1">
                        {{
                            props.isFiltered ? "Selected Ideas" : "Total Ideas"
                        }}
                    </div>
                    <div class="text-3xl font-bold text-primary">
                        {{ totalIdeas }}
                    </div>
                    <!-- Growth indicator (only show when not filtered) -->
                    <div
                        v-if="weeklyGrowth && !props.isFiltered"
                        class="growth-indicator mt-1 text-xs text-500"
                    >
                        <i class="pi pi-arrow-up text-green-500 text-xs mr-1" />
                        <span>+{{ weeklyGrowth }}% this week</span>
                    </div>
                </div>
                <i class="pi pi-lightbulb text-2xl text-primary ml-2" />
            </div>

            <!-- Vertical divider -->
            <div class="vertical-divider" />

            <!-- Right section: Status badges column -->
            <div class="status-badges-column">
                <div
                    v-for="(count, status) in filteredStatusDistribution"
                    :key="status"
                    class="mini-status-badge"
                    :class="getStatusClass(status)"
                    @click="$emit('status-click', status)"
                >
                    <span class="status-dot" :class="getDotClass(status)" />
                    <span
                        class="status-name text-xs"
                        :title="getStatusDescription(status)"
                        >{{ getShortStatus(status) }}</span
                    >
                    <span class="status-count text-xs font-semibold ml-auto">{{
                        count
                    }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    totalIdeas: {
        type: Number,
        required: true,
    },
    statusDistribution: {
        type: Object,
        required: true,
    },
    weeklyGrowth: {
        type: Number,
        default: 0,
    },
    isFiltered: {
        type: Boolean,
        default: false,
    },
});

defineEmits(["status-click"]);

// Only show Active, Under Review, and Implemented
const filteredStatusDistribution = computed(() => {
    const filtered = {};
    const statusesToShow = ["Active", "Under Review", "Implemented"];

    statusesToShow.forEach((status) => {
        if (props.statusDistribution[status] !== undefined) {
            filtered[status] = props.statusDistribution[status];
        }
    });

    return filtered;
});

const getShortStatus = (status) => {
    const shortNames = {
        Active: "Active",
        "Under Review": "Review",
        Implemented: "Done",
        Archived: "Archived",
    };
    return shortNames[status] || status;
};

const getStatusClass = (status) => {
    const classes = {
        Active: "badge-active-mini",
        "Under Review": "badge-review-mini",
        Implemented: "badge-implemented-mini",
        Archived: "badge-archived-mini",
    };
    return classes[status] || "badge-active-mini";
};

const getDotClass = (status) => {
    const classes = {
        Active: "dot-active",
        "Under Review": "dot-review",
        Implemented: "dot-implemented",
        Archived: "dot-archived",
    };
    return classes[status] || "dot-active";
};

const getStatusDescription = (status) => {
    const descriptions = {
        Active: "New ideas awaiting review or action",
        "Under Review": "Ideas being evaluated for implementation",
        Implemented: "Completed and deployed ideas",
        Archived: "Ideas no longer being considered",
    };
    return descriptions[status] || status;
};
</script>

<style scoped>
.total-ideas-card {
    transition: all 0.2s ease;
    height: 100%;
    display: flex;
    align-items: center;
    min-height: 90px;
}

.total-ideas-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.total-ideas-card :deep(.p-card-content) {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
}

.vertical-divider {
    width: 1px;
    background-color: var(--surface-border);
    margin: 0 0.5rem;
}

.status-badges-column {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 100px;
    justify-content: center;
}

.mini-status-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.3rem 0.6rem;
    border-radius: 9999px;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    width: 100%;
}

.mini-status-badge:hover {
    transform: translateX(2px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
}

.status-name {
    flex-grow: 1;
}

/* Active status */
.badge-active-mini {
    background-color: rgba(34, 197, 94, 0.1);
    color: rgb(22, 163, 74);
}

.dot-active {
    background-color: rgb(34, 197, 94);
}

/* Under Review status */
.badge-review-mini {
    background-color: rgba(251, 146, 60, 0.1);
    color: rgb(234, 88, 12);
}

.dot-review {
    background-color: rgb(251, 146, 60);
}

/* Implemented status */
.badge-implemented-mini {
    background-color: rgba(99, 102, 241, 0.1);
    color: rgb(79, 70, 229);
}

.dot-implemented {
    background-color: rgb(99, 102, 241);
}

/* Archived status */
.badge-archived-mini {
    background-color: rgba(156, 163, 175, 0.1);
    color: rgb(107, 114, 128);
}

.dot-archived {
    background-color: rgb(156, 163, 175);
}

/* Dark theme adjustments */
.dark-theme .badge-active-mini {
    background-color: rgba(34, 197, 94, 0.2);
    color: rgb(74, 222, 128);
}

.dark-theme .badge-review-mini {
    background-color: rgba(251, 146, 60, 0.2);
    color: rgb(253, 186, 116);
}

.dark-theme .badge-implemented-mini {
    background-color: rgba(99, 102, 241, 0.2);
    color: rgb(129, 140, 248);
}

.dark-theme .badge-archived-mini {
    background-color: rgba(156, 163, 175, 0.2);
    color: rgb(209, 213, 219);
}
</style>
