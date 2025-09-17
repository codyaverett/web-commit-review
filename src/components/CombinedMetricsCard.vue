<template>
    <Card class="combined-metrics-card h-full">
        <template #content>
            <div
                class="flex gap-3 justify-content-center align-items-center h-full"
            >
                <!-- Total Votes -->
                <div class="metric-section text-center flex-1">
                    <div class="metric-icon mb-2">
                        <i
                            class="pi pi-heart"
                            style="font-size: 1.5rem; color: #ef4444"
                        />
                    </div>
                    <div class="metric-value">
                        {{ totalVotes }}
                    </div>
                    <div class="metric-label">Total Votes</div>
                    <div class="metric-subtitle">{{ avgVotes }}/idea</div>
                </div>

                <!-- Vertical Divider -->
                <div class="vertical-divider" />

                <!-- Top Voted -->
                <div class="metric-section text-center flex-1">
                    <div class="metric-icon mb-2">
                        <i
                            class="pi pi-star-fill"
                            style="font-size: 1.5rem; color: #f59e0b"
                        />
                    </div>
                    <div class="metric-value">
                        {{ topVotedVotes }}
                    </div>
                    <div class="metric-label">Top Voted</div>
                    <div class="metric-subtitle" :title="topVotedTitle">
                        {{
                            topVotedTitle.length > 15
                                ? topVotedTitle.substring(0, 15) + "..."
                                : topVotedTitle
                        }}
                    </div>
                </div>

                <!-- Vertical Divider -->
                <div class="vertical-divider" />

                <!-- Active Percentage -->
                <div class="metric-section text-center flex-1">
                    <div class="metric-icon mb-2">
                        <i
                            class="pi pi-chart-pie"
                            style="font-size: 1.5rem; color: #10b981"
                        />
                    </div>
                    <div class="metric-value">{{ activePercentage }}%</div>
                    <div class="metric-label">Active</div>
                    <div class="metric-subtitle">{{ activeIdeas }} ideas</div>
                </div>
            </div>
        </template>
    </Card>
</template>

<script setup>
import Card from "primevue/card";

defineProps({
    totalVotes: {
        type: Number,
        default: 0,
    },
    avgVotes: {
        type: [String, Number],
        default: "0",
    },
    topVotedVotes: {
        type: Number,
        default: 0,
    },
    topVotedTitle: {
        type: String,
        default: "N/A",
    },
    activePercentage: {
        type: Number,
        default: 0,
    },
    activeIdeas: {
        type: Number,
        default: 0,
    },
});
</script>

<style scoped>
.combined-metrics-card {
    min-height: 90px;
}

.combined-metrics-card :deep(.p-card-content) {
    padding: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.metric-section {
    padding: 0 0.5rem;
}

.metric-icon {
    display: flex;
    justify-content: center;
}

.metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
    line-height: 1.2;
}

.metric-label {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 0.25rem;
}

.metric-subtitle {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    margin-top: 0.125rem;
}

.vertical-divider {
    width: 1px;
    background-color: var(--surface-border);
    margin: 0 0.5rem;
    align-self: stretch;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .metric-value {
        font-size: 1.25rem;
    }

    .metric-label {
        font-size: 0.7rem;
    }

    .metric-subtitle {
        font-size: 0.65rem;
    }

    .metric-section {
        padding: 0 0.25rem;
    }

    .vertical-divider {
        margin: 0 0.25rem;
    }
}
</style>
