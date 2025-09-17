<template>
    <div class="dashboard-container">
        <div class="dashboard-content">
            <!-- Quick Actions Bar -->
            <div class="quick-actions mb-4">
                <div class="flex flex-wrap gap-2">
                    <Button
                        label="Submit New Idea"
                        icon="pi pi-plus"
                        class="p-button-primary"
                        @click="router.push('/submit')"
                    />
                    <Button
                        label="View All Ideas"
                        icon="pi pi-list"
                        class="p-button-secondary"
                        @click="navigateToIdeas()"
                    />
                    <Button
                        label="Export Data"
                        icon="pi pi-download"
                        class="p-button-info"
                        @click="exportData"
                    />
                    <Button
                        label="Refresh"
                        icon="pi pi-refresh"
                        class="p-button-outlined"
                        :loading="store.loading"
                        @click="refreshData"
                    />
                    <Button
                        label="Reset Data"
                        icon="pi pi-replay"
                        class="p-button-warning p-button-outlined"
                        @click="resetData"
                    />
                </div>
            </div>

            <!-- KPI Metrics Cards -->
            <div class="grid mb-3 justify-content-center">
                <!-- Total Ideas with integrated status badges -->
                <div class="col-12 md:col-6 lg:col-5">
                    <TotalIdeasCard
                        :total-ideas="totalIdeas"
                        :status-distribution="statusDistribution"
                        :weekly-growth="weeklyGrowth"
                        :is-filtered="!!brushSelection"
                        @status-click="handleStatusClick"
                    />
                </div>

                <!-- Combined Metrics Card -->
                <div class="col-12 md:col-6 lg:col-7">
                    <CombinedMetricsCard
                        :total-votes="totalVotes"
                        :avg-votes="avgVotes"
                        :top-voted-votes="topVotedVotes"
                        :top-voted-title="topVotedTitle"
                        :active-percentage="activePercentage"
                        :active-ideas="activeIdeas"
                    />
                </div>
            </div>

            <!-- D3 Visualizations Mosaic Grid -->
            <div class="d3-mosaic-container mb-4">
                <div class="mosaic-grid">
                    <!-- Trend Chart - Large tile spanning 2 columns -->
                    <div class="mosaic-tile mosaic-tile-wide">
                        <Card class="h-full">
                            <template #title>
                                <div
                                    class="flex align-items-center justify-content-between"
                                >
                                    <div class="flex align-items-center gap-2">
                                        <span>Ideas Trend</span>
                                        <Button
                                            v-if="brushSelection"
                                            label="Clear Filter"
                                            icon="pi pi-filter-slash"
                                            class="p-button-danger p-button-sm"
                                            @click="clearFilter"
                                        />
                                    </div>
                                    <SelectButton
                                        v-model="chartTimeRange"
                                        :options="timeRangeOptions"
                                        option-label="label"
                                        option-value="value"
                                        class="text-sm"
                                    />
                                </div>
                            </template>
                            <template #content>
                                <TrendChart
                                    ref="trendChartRef"
                                    :data="trendData"
                                    :time-range="chartTimeRange"
                                    :height="chartHeight"
                                    @date-click="handleTrendDateClick"
                                    @brush-select="handleBrushSelect"
                                />
                            </template>
                        </Card>
                    </div>

                    <!-- Category Distribution - Half width on desktop -->
                    <div class="mosaic-tile mosaic-tile-category">
                        <Card class="h-full">
                            <template #title> Category Distribution </template>
                            <template #content>
                                <CategoryChart
                                    ref="categoryChartRef"
                                    :data="categoryData"
                                    :height="chartHeight"
                                    @category-click="handleCategoryClick"
                                />
                            </template>
                        </Card>
                    </div>

                    <!-- Tag Cloud - Half width on desktop -->
                    <div class="mosaic-tile mosaic-tile-tags">
                        <Card class="h-full">
                            <template #title>
                                <div
                                    class="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-2"
                                >
                                    <span>Popular Tags</span>
                                    <span class="text-sm text-500"
                                        >Click a tag to filter ideas</span
                                    >
                                </div>
                            </template>
                            <template #content>
                                <div class="tag-cloud-wrapper">
                                    <TagCloud
                                        ref="tagCloudRef"
                                        :tags="tagCloudData"
                                        :height="chartHeight"
                                        @tag-click="handleTagClick"
                                    />
                                </div>
                            </template>
                        </Card>
                    </div>

                    <!-- Calendar Heatmap - Half width on large screens -->
                    <div class="mosaic-tile mosaic-tile-calendar">
                        <Card class="compact-card calendar-card">
                            <template #title>
                                <div
                                    class="flex align-items-center justify-content-between"
                                >
                                    <span>Daily Idea Activity</span>
                                    <span class="text-sm text-500">{{
                                        currentYear
                                    }}</span>
                                </div>
                            </template>
                            <template #content>
                                <div class="calendar-wrapper-compact">
                                    <CalendarHeatmap
                                        ref="calendarHeatmapRef"
                                        :data="activityData"
                                        :year="currentYear"
                                        color-scheme="greens"
                                        :cell-size="11"
                                        :show-day-labels="true"
                                        @date-click="handleDateClick"
                                    />
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>
            </div>

            <!-- Recent Ideas Table -->
            <div class="grid">
                <div class="col-12">
                    <Card class="recent-ideas-card">
                        <template #title>
                            <div
                                class="flex align-items-center justify-content-between"
                            >
                                <span>Recent Ideas</span>
                                <Button
                                    label="View All"
                                    icon="pi pi-arrow-right"
                                    class="p-button-text p-button-sm"
                                    @click="navigateToIdeas()"
                                />
                            </div>
                        </template>
                        <template #content>
                            <IdeaTable :limit="5" />
                        </template>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useIdeasStore } from "../stores/ideas";
import { resetToSeed } from "../services/api";

// Components
import TotalIdeasCard from "../components/TotalIdeasCard.vue";
import CombinedMetricsCard from "../components/CombinedMetricsCard.vue";
import TrendChart from "../components/TrendChart.vue";
import CategoryChart from "../components/CategoryChart.vue";
import TagCloud from "../components/TagCloud.vue";
import CalendarHeatmap from "../components/CalendarHeatmap.vue";
import IdeaTable from "../components/IdeaTable.vue";

// PrimeVue Components
import Button from "primevue/button";
import Card from "primevue/card";
import SelectButton from "primevue/selectbutton";

const router = useRouter();
const route = useRoute();
const store = useIdeasStore();

// Chart component refs
const trendChartRef = ref(null);
const categoryChartRef = ref(null);
const tagCloudRef = ref(null);
const calendarHeatmapRef = ref(null);

// Chart controls
const chartTimeRange = ref("7d");
const currentYear = ref(new Date().getFullYear());
const brushSelection = ref(null);

// Responsive chart height
const chartHeight = computed(() => {
    const width = window.innerWidth;
    if (width < 768) return 200;
    if (width < 1400) return 250;
    return 300;
});

const timeRangeOptions = [
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
    { label: "180 Days", value: "180d" },
    { label: "All Time", value: "all" },
];

// Filter items based on brush selection
const filteredItems = computed(() => {
    if (!brushSelection.value) {
        return store.items;
    }

    const { start, end } = brushSelection.value;
    return store.items.filter((idea) => {
        if (!idea.createdAt) return false;
        const ideaDate = new Date(idea.createdAt);
        return ideaDate >= start && ideaDate <= end;
    });
});

// Computed KPI metrics (now using filtered items)
const totalIdeas = computed(() => filteredItems.value.length);

const activeIdeas = computed(() => {
    return filteredItems.value.filter((item) => item.status === "Active")
        .length;
});

const totalVotes = computed(() => {
    return filteredItems.value.reduce(
        (sum, idea) => sum + (idea.votes || 0),
        0
    );
});

const avgVotes = computed(() => {
    if (totalIdeas.value === 0) return 0;
    return (totalVotes.value / totalIdeas.value).toFixed(1);
});

const activePercentage = computed(() => {
    if (totalIdeas.value === 0) return 0;
    return Math.round((activeIdeas.value / totalIdeas.value) * 100);
});

const topVotedIdea = computed(() => {
    if (filteredItems.value.length === 0) return null;
    return filteredItems.value.reduce(
        (max, idea) => ((idea.votes || 0) > (max?.votes || 0) ? idea : max),
        filteredItems.value[0]
    );
});

const topVotedTitle = computed(() => topVotedIdea.value?.title || "N/A");
const topVotedVotes = computed(() => topVotedIdea.value?.votes || 0);

const statusDistribution = computed(() => {
    const distribution = {};
    filteredItems.value.forEach((item) => {
        distribution[item.status] = (distribution[item.status] || 0) + 1;
    });
    return distribution;
});

const categoryData = computed(() => {
    const categoryMap = filteredItems.value.reduce((acc, idea) => {
        const category = idea.category || "Other";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(categoryMap).map(([key, value]) => ({
        category: key,
        count: value,
    }));
});

const tagCloudData = computed(() => {
    const tagMap = {};

    // Process all tags from filtered ideas
    filteredItems.value.forEach((idea) => {
        if (idea.tags && Array.isArray(idea.tags)) {
            idea.tags.forEach((tag) => {
                tagMap[tag] = (tagMap[tag] || 0) + 1;
            });
        }
    });

    // Convert to array format expected by TagCloud component
    return Object.entries(tagMap)
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30); // Limit to top 30 tags
});

const weeklyGrowth = computed(() => {
    // Simulate weekly growth for demo
    return Math.floor(Math.random() * 20 + 5);
});

// Generate trend data for the trend chart from actual idea data
const trendData = computed(() => {
    const trendMap = new Map();
    const now = new Date();

    // Handle "All Time" option by finding the earliest idea date
    let startDate,
        days,
        aggregateByWeek = false,
        aggregateByMonth = false;
    if (chartTimeRange.value === "all") {
        // Find the earliest idea date
        const earliestIdea = store.items.reduce((earliest, idea) => {
            if (!idea.createdAt) return earliest;
            const ideaDate = new Date(idea.createdAt);
            return !earliest || ideaDate < earliest ? ideaDate : earliest;
        }, null);

        if (earliestIdea) {
            startDate = new Date(earliestIdea);
            startDate.setHours(0, 0, 0, 0);
            days = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)) + 1;

            // Decide on aggregation strategy based on date range
            if (days > 365) {
                aggregateByMonth = true;
            } else if (days > 90) {
                aggregateByWeek = true;
            }
        } else {
            // No ideas, default to 30 days
            days = 30;
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - days + 1);
        }
    } else {
        // Fixed time ranges
        days =
            chartTimeRange.value === "7d"
                ? 7
                : chartTimeRange.value === "30d"
                  ? 30
                  : chartTimeRange.value === "90d"
                    ? 90
                    : 180;
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days + 1);

        // Use weekly aggregation for 90-day view
        if (chartTimeRange.value === "90d") {
            aggregateByWeek = true;
        }
    }

    // Helper function to get period key for aggregation
    const getPeriodKey = (date) => {
        if (aggregateByMonth) {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
        } else if (aggregateByWeek) {
            // Get the Monday of the week
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
            d.setDate(diff);
            return d.toISOString().split("T")[0];
        } else {
            return date.toISOString().split("T")[0];
        }
    };

    // Initialize data structure based on aggregation level
    if (aggregateByMonth) {
        // Create monthly buckets
        const currentDate = new Date(startDate);
        while (currentDate <= now) {
            const monthKey = getPeriodKey(currentDate);
            if (!trendMap.has(monthKey)) {
                const monthDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    1
                );
                trendMap.set(monthKey, {
                    date: monthDate,
                    created: 0,
                    votes: 0,
                    active: 0,
                    implemented: 0,
                    underReview: 0,
                    categories: {
                        UI: 0,
                        Platform: 0,
                        Performance: 0,
                        Integrations: 0,
                        Security: 0,
                    },
                    ideas: [],
                    topIdea: null,
                    period: "month",
                });
            }
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
    } else if (aggregateByWeek) {
        // Create weekly buckets
        const currentDate = new Date(startDate);
        while (currentDate <= now) {
            const weekKey = getPeriodKey(currentDate);
            if (!trendMap.has(weekKey)) {
                trendMap.set(weekKey, {
                    date: new Date(weekKey),
                    created: 0,
                    votes: 0,
                    active: 0,
                    implemented: 0,
                    underReview: 0,
                    categories: {
                        UI: 0,
                        Platform: 0,
                        Performance: 0,
                        Integrations: 0,
                        Security: 0,
                    },
                    ideas: [],
                    topIdea: null,
                    period: "week",
                });
            }
            currentDate.setDate(currentDate.getDate() + 7);
        }
    } else {
        // Daily buckets for shorter ranges
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            date.setHours(0, 0, 0, 0);
            const dateStr = date.toISOString().split("T")[0];
            trendMap.set(dateStr, {
                date: new Date(date),
                created: 0,
                votes: 0,
                active: 0,
                implemented: 0,
                underReview: 0,
                categories: {
                    UI: 0,
                    Platform: 0,
                    Performance: 0,
                    Integrations: 0,
                    Security: 0,
                },
                ideas: [],
                topIdea: null,
                period: "day",
            });
        }
    }

    // Process ideas within the time range
    store.items.forEach((idea) => {
        if (idea.createdAt) {
            const ideaDate = new Date(idea.createdAt);
            const periodKey = getPeriodKey(ideaDate);

            // Check if the idea is within our time range
            const periodData = trendMap.get(periodKey);
            if (periodData) {
                // Count created ideas
                periodData.created += 1;

                // Sum votes
                periodData.votes += idea.votes || 0;

                // Count by status
                if (idea.status === "Active") periodData.active += 1;
                else if (idea.status === "Implemented")
                    periodData.implemented += 1;
                else if (idea.status === "Under Review")
                    periodData.underReview += 1;

                // Count by category
                if (
                    idea.category &&
                    periodData.categories[idea.category] !== undefined
                ) {
                    periodData.categories[idea.category] += 1;
                }

                // Track ideas for this period
                periodData.ideas.push({
                    id: idea.id,
                    title: idea.title,
                    votes: idea.votes || 0,
                    status: idea.status,
                    category: idea.category,
                });

                // Update top idea for the period
                if (
                    !periodData.topIdea ||
                    (idea.votes || 0) > periodData.topIdea.votes
                ) {
                    periodData.topIdea = {
                        title: idea.title,
                        votes: idea.votes || 0,
                    };
                }
            }
        }
    });

    // Calculate moving averages and cumulative totals
    const dataArray = Array.from(trendMap.values()).sort(
        (a, b) => a.date - b.date
    );
    let cumulativeTotal = 0;

    dataArray.forEach((day, index) => {
        // Add cumulative total
        cumulativeTotal += day.created;
        day.cumulative = cumulativeTotal;

        // Calculate 7-day moving average (if we have enough data)
        if (index >= 6) {
            const last7Days = dataArray.slice(index - 6, index + 1);
            day.movingAvg =
                last7Days.reduce((sum, d) => sum + d.created, 0) / 7;
        } else {
            day.movingAvg = day.created; // Use actual value if not enough history
        }
    });

    // Include all days to show complete timeline
    let consolidatedArray = dataArray;

    // If we have no data points at all, return a minimal dataset
    if (consolidatedArray.length === 0) {
        return [
            {
                date: new Date(),
                created: 0,
                votes: 0,
                active: 0,
                implemented: 0,
                underReview: 0,
                categories: {
                    UI: 0,
                    Platform: 0,
                    Performance: 0,
                    Integrations: 0,
                    Security: 0,
                },
                ideas: [],
                topIdea: null,
                cumulative: 0,
                movingAvg: 0,
            },
        ];
    }

    return consolidatedArray;
});

// Generate activity data for calendar heatmap from actual idea data
const activityData = computed(() => {
    const activityMap = new Map();
    const today = new Date();
    const yearStart = new Date(currentYear.value, 0, 1);
    const yearEnd = new Date(currentYear.value, 11, 31);

    // Count ideas per day based on createdAt dates
    store.items.forEach((idea) => {
        if (idea.createdAt) {
            const ideaDate = new Date(idea.createdAt);

            // Only include ideas from the selected year
            if (
                ideaDate >= yearStart &&
                ideaDate <= yearEnd &&
                ideaDate <= today
            ) {
                // Use UTC date parts to create consistent date string
                const year = ideaDate.getUTCFullYear();
                const month = String(ideaDate.getUTCMonth() + 1).padStart(
                    2,
                    "0"
                );
                const day = String(ideaDate.getUTCDate()).padStart(2, "0");
                const dateStr = `${year}-${month}-${day}`;
                const currentCount = activityMap.get(dateStr) || 0;
                activityMap.set(dateStr, currentCount + 1);
            }
        }
    });

    // Convert map to array format expected by CalendarHeatmap
    return Array.from(activityMap, ([date, count]) => ({
        date,
        count,
    }));
});

// Methods
const exportData = () => {
    const dataStr = JSON.stringify(store.items, null, 2);
    const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `ideas-export-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
};

const refreshData = async () => {
    await store.refresh();
};

const resetData = async () => {
    console.log("Resetting data to seed...");
    resetToSeed();
    await store.refresh();
    console.log("Data reset complete. Items:", store.items.length, "items");
};

const handleTagClick = (tag) => {
    // Navigate to ideas page with tag filter
    const query = { tag: tag.text };
    if (brushSelection.value) {
        query.dateFrom = brushSelection.value.start.toISOString();
        query.dateTo = brushSelection.value.end.toISOString();
    }
    router.push({
        path: "/ideas",
        query,
    });
};

const handleCategoryClick = (categoryData) => {
    // Navigate to ideas page with category filter
    const query = { category: categoryData.category };
    if (brushSelection.value) {
        query.dateFrom = brushSelection.value.start.toISOString();
        query.dateTo = brushSelection.value.end.toISOString();
    }
    router.push({
        path: "/ideas",
        query,
    });
};

const handleDateClick = (dateData) => {
    // Navigate to ideas page with date filter
    const query = { date: dateData.dateStr };
    if (brushSelection.value) {
        query.dateFrom = brushSelection.value.start.toISOString();
        query.dateTo = brushSelection.value.end.toISOString();
    }
    router.push({
        path: "/ideas",
        query,
    });
};

const handleStatusClick = (status) => {
    // Navigate to ideas page with status filter
    const query = { status: status };
    if (brushSelection.value) {
        query.dateFrom = brushSelection.value.start.toISOString();
        query.dateTo = brushSelection.value.end.toISOString();
    }
    router.push({
        path: "/ideas",
        query,
    });
};

const handleTrendDateClick = (event) => {
    // Navigate to ideas page with date filter from the clicked chart point
    const dateStr = event.date.toISOString().split("T")[0];
    const query = { date: dateStr };
    if (brushSelection.value) {
        query.dateFrom = brushSelection.value.start.toISOString();
        query.dateTo = brushSelection.value.end.toISOString();
    }
    router.push({
        path: "/ideas",
        query,
    });
};

const handleBrushSelect = (selection) => {
    brushSelection.value = selection;
    updateQueryParams();
};

const clearFilter = () => {
    brushSelection.value = null;
    updateQueryParams();
};

const updateQueryParams = () => {
    const query = { ...route.query };

    if (brushSelection.value) {
        query.dateFrom = brushSelection.value.start.toISOString();
        query.dateTo = brushSelection.value.end.toISOString();
    } else {
        delete query.dateFrom;
        delete query.dateTo;
    }

    router.replace({ query });
};

const navigateToIdeas = () => {
    const query = {};
    if (brushSelection.value) {
        query.dateFrom = brushSelection.value.start.toISOString();
        query.dateTo = brushSelection.value.end.toISOString();
    }
    router.push({
        path: "/ideas",
        query,
    });
};

// Trigger resize for all D3 charts
const triggerChartsResize = () => {
    nextTick(() => {
        if (trendChartRef.value?.redraw) {
            trendChartRef.value.redraw();
        }
        if (categoryChartRef.value?.redraw) {
            categoryChartRef.value.redraw();
        }
        if (tagCloudRef.value?.redraw) {
            tagCloudRef.value.redraw();
        }
        if (calendarHeatmapRef.value?.redraw) {
            calendarHeatmapRef.value.redraw();
        }
    });
};

// Handle window resize with debounce
let resizeTimeout = null;
const handleWindowResize = () => {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
        triggerChartsResize();
    }, 250);
};

// Lifecycle
onMounted(async () => {
    console.log("Dashboard mounted, loading data...");
    await store.refresh();
    console.log("Loaded", store.items.length, "ideas");

    // Check for date range in query params
    if (route.query.dateFrom && route.query.dateTo) {
        brushSelection.value = {
            start: new Date(route.query.dateFrom),
            end: new Date(route.query.dateTo),
        };
    }

    // Add window resize listener
    window.addEventListener("resize", handleWindowResize);

    // Trigger initial resize after data load
    nextTick(() => {
        triggerChartsResize();
    });
});

onUnmounted(() => {
    // Remove window resize listener
    window.removeEventListener("resize", handleWindowResize);

    // Clear any pending resize timeout
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
});
</script>

<style scoped>
.dashboard-container {
    padding: 1rem;
    width: 100%;
    overflow-x: hidden;
    display: flex;
    justify-content: center;
}

.dashboard-content {
    width: 100%;
    max-width: 1400px;
}

.quick-actions {
    background: linear-gradient(
        135deg,
        var(--surface-50) 0%,
        var(--surface-0) 100%
    );
    padding: 1rem;
    border-radius: 8px;
}

:deep(.p-card) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

:deep(.p-card:hover) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Compact card for calendar heatmap */
.compact-card :deep(.p-card-content) {
    padding: 0.75rem;
}

.calendar-wrapper-compact {
    max-height: 180px;
    overflow: hidden;
}

:deep(.p-selectbutton .p-button) {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
}

/* Status badges container */
.status-badges-container {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* D3 Mosaic Grid Layout */
.d3-mosaic-container {
    width: 100%;
    padding: 0.5rem;
    box-sizing: border-box;
}

.mosaic-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: auto; /* Let rows size based on content */
    gap: 1rem;
    width: 100%;
    container-type: inline-size;
}

.mosaic-tile {
    min-height: 250px;
    display: flex;
    flex-direction: column;
    container-type: inline-size;
}

.mosaic-tile-wide {
    grid-column: span 4;
}

.mosaic-tile-category {
    grid-column: span 2;
}

.mosaic-tile-tags {
    grid-column: span 2;
}

/* Large screens: 4-column grid */
@media (min-width: 1600px) {
    .mosaic-tile-calendar {
        grid-column: span 4;
    }
}

/* Medium-large screens: 4-column grid */
@media (max-width: 1599px) {
    .mosaic-grid {
        grid-template-columns: repeat(4, 1fr);
    }

    .mosaic-tile-category {
        grid-column: span 2;
    }

    .mosaic-tile-tags {
        grid-column: span 2;
    }

    .mosaic-tile-calendar {
        grid-column: span 4;
    }
}

.mosaic-tile :deep(.p-card) {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
}

.mosaic-tile :deep(.p-card-body) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    padding: 1rem;
}

.mosaic-tile :deep(.p-card-content) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
}

/* D3 containers should be responsive to their parent */
.mosaic-tile :deep(.trend-chart-container),
.mosaic-tile :deep(.category-chart-container),
.mosaic-tile :deep(.tag-cloud-container) {
    width: 100%;
    height: auto;
    min-height: 200px;
    max-height: 400px;
}

/* Calendar has different height requirements */
.mosaic-tile-calendar {
    min-height: 180px;
}

.mosaic-tile-calendar :deep(.calendar-heatmap-container) {
    width: 100%;
    height: auto;
    min-height: 150px;
    max-height: 200px;
}

.calendar-card :deep(.p-card-body) {
    padding: 0.75rem;
}

.calendar-card :deep(.p-card-content) {
    padding: 0.5rem 0;
}

/* Responsive mosaic layout */
@media (max-width: 1400px) {
    .mosaic-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .mosaic-tile-wide {
        grid-column: span 2;
    }

    .mosaic-tile-category {
        grid-column: span 1;
    }

    .mosaic-tile-tags {
        grid-column: span 1;
    }

    .mosaic-tile-calendar {
        grid-column: span 2;
    }

    .mosaic-tile :deep(.trend-chart-container),
    .mosaic-tile :deep(.category-chart-container),
    .mosaic-tile :deep(.tag-cloud-container),
    .mosaic-tile :deep(.calendar-heatmap-container) {
        max-height: 350px;
    }
}

@media (max-width: 768px) {
    .d3-mosaic-container {
        padding: 0.25rem;
    }

    .mosaic-grid {
        grid-template-columns: 1fr;
        grid-auto-rows: auto;
        gap: 0.75rem;
    }

    .mosaic-tile {
        min-height: 200px;
    }

    .mosaic-tile,
    .mosaic-tile-wide,
    .mosaic-tile-category,
    .mosaic-tile-tags,
    .mosaic-tile-calendar {
        grid-column: span 1;
    }

    .mosaic-tile :deep(.p-card-body) {
        padding: 0.75rem;
    }

    .mosaic-tile :deep(.trend-chart-container),
    .mosaic-tile :deep(.category-chart-container),
    .mosaic-tile :deep(.tag-cloud-container) {
        min-height: 180px;
        max-height: 300px;
    }

    .mosaic-tile-calendar {
        min-height: 160px;
    }

    .mosaic-tile-calendar :deep(.calendar-heatmap-container) {
        min-height: 140px;
        max-height: 180px;
    }
}

/* Prevent overflow in tag cloud and calendar containers */
.tag-cloud-wrapper,
.calendar-wrapper {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
}

.tag-cloud-wrapper {
    padding: 0 10px;
}

.calendar-wrapper-compact {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    max-height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Ensure proper spacing on smaller screens */
@media (max-width: 1200px) {
    .tag-cloud-wrapper,
    .calendar-wrapper {
        min-height: 250px;
    }
}

@media (max-width: 768px) {
    .dashboard-container {
        padding: 0.5rem;
    }

    .tag-cloud-wrapper {
        overflow-x: hidden;
        min-height: 250px;
    }

    .calendar-wrapper {
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        max-width: 100%;
    }

    /* Make buttons smaller on mobile */
    :deep(.p-button) {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
    }

    /* Reduce card padding on mobile */
    :deep(.p-card .p-card-content) {
        padding: 0.75rem;
    }
}

/* Recent Ideas Card - Full width table within card boundaries */
.recent-ideas-card :deep(.p-card-body) {
    padding-bottom: 0;
}

.recent-ideas-card :deep(.p-card-content) {
    padding: 0;
    margin-left: -1rem;
    margin-right: -1rem;
    width: calc(100% + 2rem);
}

.recent-ideas-card :deep(.idea-table-container) {
    padding: 0;
}

.recent-ideas-card :deep(.card) {
    box-shadow: none;
    border-radius: 0;
    padding: 0;
    background: transparent;
}

.recent-ideas-card :deep(.p-datatable) {
    border-radius: 0;
}

.recent-ideas-card :deep(.p-datatable-wrapper) {
    border-radius: 0;
}

/* Add padding to first column to align with card heading */
.recent-ideas-card :deep(.p-datatable thead th:first-child),
.recent-ideas-card :deep(.p-datatable tbody td:first-child) {
    padding-left: 1rem;
}

/* Add padding to last column for balance */
.recent-ideas-card :deep(.p-datatable thead th:last-child),
.recent-ideas-card :deep(.p-datatable tbody td:last-child) {
    padding-right: 1rem;
}
</style>
