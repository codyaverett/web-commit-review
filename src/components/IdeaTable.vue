<template>
    <div
        class="card position-relative idea-table-container"
        :class="{ limited: props.limit }"
    >
        <LoadingOverlay
            :visible="isLoading"
            :message="loadingMessage"
            :progress="loadingProgress"
        />
        <Toolbar v-if="!props.limit" ref="toolbarRef" class="toolbar-header">
            <template #start>
                <!-- Mobile toolbar -->
                <div class="mobile-toolbar">
                    <div class="mobile-left">
                        <Button
                            icon="pi pi-bars"
                            severity="secondary"
                            text
                            aria-label="Toggle filters"
                            @click="mobileMenuOpen = !mobileMenuOpen"
                        />
                        <div class="search-box mobile-search">
                            <i class="pi pi-search" />
                            <InputText
                                v-model="search"
                                placeholder="Search..."
                                class="search-input"
                            />
                        </div>
                    </div>
                    <div class="mobile-right">
                        <Button
                            icon="pi pi-plus"
                            severity="primary"
                            text
                            aria-label="New idea"
                            title="New idea"
                            @click="openNew"
                        />
                        <Button
                            icon="pi pi-refresh"
                            severity="secondary"
                            text
                            :loading="isLoading"
                            aria-label="Refresh"
                            title="Refresh"
                            @click="handleRefresh"
                        />
                        <Button
                            :icon="grid ? 'pi pi-list' : 'pi pi-th-large'"
                            severity="secondary"
                            text
                            aria-label="Toggle view"
                            :title="
                                grid
                                    ? 'Switch to list view'
                                    : 'Switch to grid view'
                            "
                            @click="grid = !grid"
                        />
                    </div>
                </div>

                <!-- Desktop toolbar -->
                <div class="desktop-toolbar">
                    <!-- Search Input -->
                    <div class="search-box">
                        <i class="pi pi-search" />
                        <InputText
                            v-model="search"
                            placeholder="Search all fields..."
                            class="w-15rem"
                        />
                    </div>
                    <!-- Filters Group -->
                    <div class="flex gap-2 filters-group">
                        <MultiSelect
                            v-model="filters.status"
                            :options="statuses"
                            placeholder="Status"
                            class="w-10rem"
                            :max-selected-labels="1"
                            :show-clear="true"
                            panel-class="compact-panel"
                        >
                            <template #value="slotProps">
                                <div
                                    v-if="
                                        slotProps.value &&
                                        slotProps.value.length
                                    "
                                    class="flex align-items-center gap-1"
                                >
                                    <i class="pi pi-flag text-xs" />
                                    <span
                                        >{{
                                            slotProps.value.length
                                        }}
                                        selected</span
                                    >
                                </div>
                                <span v-else>{{ slotProps.placeholder }}</span>
                            </template>
                        </MultiSelect>

                        <MultiSelect
                            v-model="filters.category"
                            :options="categories"
                            placeholder="Category"
                            class="w-10rem"
                            :max-selected-labels="1"
                            :show-clear="true"
                        >
                            <template #value="slotProps">
                                <div
                                    v-if="
                                        slotProps.value &&
                                        slotProps.value.length
                                    "
                                    class="flex align-items-center gap-1"
                                >
                                    <i class="pi pi-folder text-xs" />
                                    <span
                                        >{{
                                            slotProps.value.length
                                        }}
                                        selected</span
                                    >
                                </div>
                                <span v-else>{{ slotProps.placeholder }}</span>
                            </template>
                        </MultiSelect>

                        <MultiSelect
                            v-model="filters.tags"
                            :options="availableTags"
                            placeholder="Tags"
                            class="w-10rem"
                            :max-selected-labels="1"
                            :show-clear="true"
                        >
                            <template #value="slotProps">
                                <div
                                    v-if="
                                        slotProps.value &&
                                        slotProps.value.length
                                    "
                                    class="flex align-items-center gap-1"
                                >
                                    <i class="pi pi-tag text-xs" />
                                    <span
                                        >{{ slotProps.value.length }} tags</span
                                    >
                                </div>
                                <span v-else>{{ slotProps.placeholder }}</span>
                            </template>
                        </MultiSelect>
                    </div>

                    <!-- Date Range -->
                    <div class="date-picker">
                        <Calendar
                            v-model="filters.dateRange"
                            selection-mode="range"
                            placeholder="Date Range"
                            date-format="mm/dd/yy"
                            :show-clear="true"
                            :show-button-bar="true"
                            class="w-12rem"
                        />
                    </div>

                    <!-- Action buttons -->
                    <div class="action-buttons ml-auto">
                        <Button
                            icon="pi pi-plus"
                            severity="primary"
                            text
                            aria-label="New idea"
                            title="New idea"
                            @click="openNew"
                        />
                        <Button
                            icon="pi pi-refresh"
                            severity="secondary"
                            text
                            :loading="isLoading"
                            aria-label="Refresh"
                            title="Refresh"
                            @click="handleRefresh"
                        />
                        <Button
                            :icon="grid ? 'pi pi-list' : 'pi pi-th-large'"
                            severity="secondary"
                            text
                            aria-label="Toggle view"
                            :title="
                                grid
                                    ? 'Switch to list view'
                                    : 'Switch to grid view'
                            "
                            @click="grid = !grid"
                        />
                    </div>
                </div>

                <!-- Mobile collapsible filters -->
                <div
                    class="mobile-filters"
                    :class="{ 'mobile-open': mobileMenuOpen }"
                >
                    <MultiSelect
                        v-model="filters.status"
                        :options="statuses"
                        placeholder="Status"
                        class="w-full"
                        :max-selected-labels="1"
                        :show-clear="true"
                    />
                    <MultiSelect
                        v-model="filters.category"
                        :options="categories"
                        placeholder="Category"
                        class="w-full"
                        :max-selected-labels="1"
                        :show-clear="true"
                    />
                    <MultiSelect
                        v-model="filters.tags"
                        :options="availableTags"
                        placeholder="Tags"
                        class="w-full"
                        :max-selected-labels="1"
                        :show-clear="true"
                    />
                    <Calendar
                        v-model="filters.dateRange"
                        selection-mode="range"
                        placeholder="Date Range"
                        date-format="mm/dd/yy"
                        :show-clear="true"
                        :show-button-bar="true"
                        class="w-full"
                    />
                </div>
            </template>
        </Toolbar>

        <!-- Enhanced pagination for grid view -->
        <div v-if="grid" class="grid-view-container">
            <div class="scrollable-content">
                <TransitionGroup name="masonry" tag="div" class="masonry-grid">
                    <div
                        v-for="i in paginatedItems"
                        :key="i.id"
                        class="masonry-item"
                    >
                        <div class="surface-card p-3 border-round shadow-1">
                            <div
                                class="flex justify-content-between align-items-center mb-2"
                            >
                                <h3 class="mt-0 mb-0 text-xl">
                                    {{ i.title }}
                                </h3>
                                <div
                                    class="vote-count"
                                    :class="{ voting: votingId === i.id }"
                                    @click="vote(i)"
                                >
                                    <i class="pi pi-angle-up" />
                                    <span class="vote-number">{{
                                        i.votes || 0
                                    }}</span>
                                </div>
                            </div>
                            <p class="text-600 mb-2">
                                {{ i.description }}
                            </p>
                            <div class="flex gap-2 mb-2 align-items-center">
                                <span class="category-text">{{
                                    i.category
                                }}</span>
                                <Tag
                                    :value="i.status"
                                    :severity="statusSeverity(i.status)"
                                />
                            </div>
                            <div class="flex flex-wrap gap-1 mt-2">
                                <Tag
                                    v-for="tag in i.tags || []"
                                    :key="tag"
                                    severity="secondary"
                                    class="text-xs cursor-pointer custom-tag"
                                    :class="{
                                        'tag-active':
                                            filters.tags.includes(tag),
                                    }"
                                    @click="addTagFilter(tag)"
                                >
                                    <i class="pi pi-tag text-xs mr-1" />{{
                                        tag
                                    }}
                                </Tag>
                                <span
                                    v-if="!i.tags || i.tags.length === 0"
                                    class="text-500 text-sm"
                                    >No tags</span
                                >
                            </div>
                            <div class="flex justify-content-end gap-1">
                                <Button
                                    icon="pi pi-pencil"
                                    severity="secondary"
                                    text
                                    @click="editRow(i)"
                                /><Button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    text
                                    @click="removeRow(i)"
                                />
                            </div>
                        </div>
                    </div>
                </TransitionGroup>
            </div>
            <!-- Pagination for grid view -->
            <div v-if="!props.limit" class="pagination-wrapper">
                <Paginator
                    v-if="totalRecords > rowsPerPage"
                    :rows="rowsPerPage"
                    :total-records="totalRecords"
                    :rows-per-page-options="[6, 12, 24, 48]"
                    :first="currentPage * rowsPerPage"
                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    @page="onPageChange"
                >
                    <template #start>
                        <span class="text-600">
                            Showing {{ currentPage * rowsPerPage + 1 }} to
                            {{
                                Math.min(
                                    (currentPage + 1) * rowsPerPage,
                                    totalRecords
                                )
                            }}
                            of {{ totalRecords }}
                        </span>
                    </template>
                </Paginator>
                <div v-else class="text-600 p-3">
                    Showing
                    {{ Math.min(paginatedItems.length, totalRecords) }} of
                    {{ totalRecords }} ideas
                </div>
            </div>
            <!-- Simple count for limited views -->
            <div v-else class="text-600 p-3 text-center">
                Showing {{ Math.min(paginatedItems.length, totalRecords) }} most
                recent ideas
            </div>
        </div>

        <div v-else class="table-view-container">
            <DataTable
                :value="filtered"
                :loading="store.loading"
                data-key="id"
                :paginator="!props.limit"
                :rows="rowsPerPage"
                :rows-per-page-options="[5, 10, 20, 50]"
                class="p-datatable-sm full-height-table"
                :paginator-template="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
                :current-page-report-template="'Showing {first} to {last} of {totalRecords} ideas'"
                scrollable
                :scroll-height="props.limit ? 'auto' : 'flex'"
                @page="onPageChange"
            >
                <template #empty>
                    <div class="p-3 text-600">No ideas found.</div>
                </template>
                <template #loading>
                    <div class="p-3">Loading ideas…</div>
                </template>
                <Column
                    field="votes"
                    header="Votes"
                    sortable
                    style="width: 5rem"
                >
                    <template #body="{ data }">
                        <div
                            class="vote-count"
                            :class="{ voting: votingId === data.id }"
                            @click="vote(data)"
                        >
                            <i class="pi pi-angle-up" />
                            <span class="vote-number">{{
                                data.votes || 0
                            }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="title" header="Title" sortable>
                    <template #body="{ data }">
                        <div>
                            <div class="font-semibold">
                                {{ data.title }}
                            </div>
                            <div class="text-sm text-600 mt-1">
                                {{ data.description?.substring(0, 100)
                                }}{{
                                    data.description?.length > 100 ? "..." : ""
                                }}
                            </div>
                        </div>
                    </template>
                </Column>
                <Column
                    field="category"
                    header="Category"
                    header-class="text-right"
                >
                    <template #body="{ data }">
                        <div class="text-right category-text">
                            {{ data.category }}
                        </div>
                    </template>
                </Column>
                <Column field="status" header="Status">
                    <template #body="{ data }">
                        <div>
                            <Tag
                                :value="data.status"
                                :severity="statusSeverity(data.status)"
                            />
                        </div>
                    </template>
                </Column>
                <Column field="tags" header="Tags" header-class="text-right">
                    <template #body="{ data }">
                        <div class="flex flex-wrap gap-1 justify-content-end">
                            <Tag
                                v-for="tag in data.tags || []"
                                :key="tag"
                                severity="secondary"
                                class="text-xs cursor-pointer custom-tag"
                                :class="{
                                    'tag-active': filters.tags.includes(tag),
                                }"
                                @click="addTagFilter(tag)"
                            >
                                <i class="pi pi-tag text-xs mr-1" />{{ tag }}
                            </Tag>
                            <span
                                v-if="!data.tags || data.tags.length === 0"
                                class="text-500"
                                >—</span
                            >
                        </div>
                    </template>
                </Column>
                <Column
                    header="Actions"
                    style="width: 10rem"
                    header-class="text-right"
                >
                    <template #body="{ data }">
                        <div class="flex justify-content-end gap-1">
                            <Button
                                icon="pi pi-pencil"
                                severity="secondary"
                                text
                                @click="editRow(data)"
                            /><Button
                                icon="pi pi-trash"
                                severity="danger"
                                text
                                @click="removeRow(data)"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <IdeaForm v-model="showForm" :value="editing" @submit="saveRow" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { useIdeasStore } from "../stores/ideas";
import { useFuzzySearch } from "../composables/useFuzzySearch";
import { useDebounceFn, onClickOutside } from "@vueuse/core";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Tag from "primevue/tag";
import Toolbar from "primevue/toolbar";
import MultiSelect from "primevue/multiselect";
import Paginator from "primevue/paginator";
import Calendar from "primevue/calendar";
import IdeaForm from "./IdeaForm.vue";
import LoadingOverlay from "./LoadingOverlay.vue";
import { useLoading } from "../composables/useLoading";

const props = defineProps({
    limit: {
        type: Number,
        default: null,
    },
    initialTagFilter: {
        type: String,
        default: null,
    },
    initialCategoryFilter: {
        type: String,
        default: null,
    },
    initialDateFilter: {
        type: String,
        default: null,
    },
    initialStatusFilter: {
        type: String,
        default: null,
    },
    initialDateRangeFilter: {
        type: Object,
        default: null,
    },
});

const store = useIdeasStore();
const categories = [
    "Platform",
    "UI",
    "Performance",
    "Integrations",
    "Security",
];
const statuses = ["Active", "Under Review", "Implemented"];
const search = ref("");
const filters = ref({ status: [], category: [], tags: [], dateRange: null });
const grid = ref(false);
const votingId = ref(null);
const sortField = ref(null);
const sortOrder = ref(1);
const currentPage = ref(0);
const rowsPerPage = ref(10);
const mobileMenuOpen = ref(false);
const toolbarRef = ref(null);

// Loading state
const { isLoading, loadingMessage, loadingProgress, withLoading } =
    useLoading();

// Fuzzy search setup
const { filteredItems: fuzzyFiltered } = useFuzzySearch(
    computed(() => store.items),
    search,
    ["title", "description", "tags", "category", "status", "requesterName"]
);

const filtered = computed(() => {
    let list = fuzzyFiltered.value;

    // Multi-select filtering
    if (filters.value.status && filters.value.status.length > 0) {
        list = list.filter((i) => filters.value.status.includes(i.status));
    }
    if (filters.value.category && filters.value.category.length > 0) {
        list = list.filter((i) => filters.value.category.includes(i.category));
    }
    if (filters.value.tags && filters.value.tags.length > 0) {
        list = list.filter((i) => {
            if (!i.tags || i.tags.length === 0) return false;
            return filters.value.tags.some((tag) => i.tags.includes(tag));
        });
    }

    // Date range filtering
    if (filters.value.dateRange) {
        if (
            Array.isArray(filters.value.dateRange) &&
            filters.value.dateRange.length === 2
        ) {
            // Date range from calendar picker
            const [startDate, endDate] = filters.value.dateRange;
            if (startDate && endDate) {
                list = list.filter((i) => {
                    if (!i.createdAt) return false;
                    const ideaDate = new Date(i.createdAt);

                    // Get UTC date string for the idea
                    const ideaYear = ideaDate.getUTCFullYear();
                    const ideaMonth = String(
                        ideaDate.getUTCMonth() + 1
                    ).padStart(2, "0");
                    const ideaDay = String(ideaDate.getUTCDate()).padStart(
                        2,
                        "0"
                    );
                    const ideaDateStr = `${ideaYear}-${ideaMonth}-${ideaDay}`;

                    // Get UTC date strings for start and end to match dashboard heatmap
                    // The filter dates come from query params which are already in UTC format (YYYY-MM-DD)
                    // So we use the dates directly as UTC dates
                    const startYear = startDate.getUTCFullYear();
                    const startMonth = String(
                        startDate.getUTCMonth() + 1
                    ).padStart(2, "0");
                    const startDay = String(startDate.getUTCDate()).padStart(
                        2,
                        "0"
                    );
                    const startDateStr = `${startYear}-${startMonth}-${startDay}`;

                    const endYear = endDate.getUTCFullYear();
                    const endMonth = String(endDate.getUTCMonth() + 1).padStart(
                        2,
                        "0"
                    );
                    const endDay = String(endDate.getUTCDate()).padStart(
                        2,
                        "0"
                    );
                    const endDateStr = `${endYear}-${endMonth}-${endDay}`;

                    // Compare date strings
                    return (
                        ideaDateStr >= startDateStr && ideaDateStr <= endDateStr
                    );
                });
            }
        }
    }

    // Enhanced sorting
    if (sortField.value) {
        list = [...list].sort((a, b) => {
            let aVal = a[sortField.value];
            let bVal = b[sortField.value];

            // Handle null/undefined values
            if (aVal == null) aVal = "";
            if (bVal == null) bVal = "";

            // Numeric comparison for votes and id
            if (sortField.value === "votes" || sortField.value === "id") {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
            }

            // Date comparison for dates
            if (
                sortField.value === "createdAt" ||
                sortField.value === "targetDate"
            ) {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }

            if (aVal < bVal) return -sortOrder.value;
            if (aVal > bVal) return sortOrder.value;
            return 0;
        });
    }

    // Apply limit if provided
    if (props.limit && props.limit > 0) {
        list = list.slice(0, props.limit);
    }

    return list;
});

// Pagination computed values
const paginatedItems = computed(() => {
    const start = currentPage.value * rowsPerPage.value;
    const end = start + rowsPerPage.value;
    return filtered.value.slice(start, end);
});

const totalRecords = computed(() => filtered.value.length);

// Get all unique tags from all ideas
const availableTags = computed(() => {
    const tagSet = new Set();
    store.items.forEach((item) => {
        if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach((tag) => tagSet.add(tag));
        }
    });
    return Array.from(tagSet).sort();
});

// Reset page when filters change
watch([search, filters], () => {
    currentPage.value = 0;
});

// Handle initial tag filter from props
watch(
    () => props.initialTagFilter,
    (newTag) => {
        if (newTag && !filters.value.tags.includes(newTag)) {
            filters.value.tags = [newTag];
        } else if (!newTag) {
            filters.value.tags = [];
        }
    },
    { immediate: true }
);

// Handle initial category filter from props
watch(
    () => props.initialCategoryFilter,
    (newCategory) => {
        if (newCategory && !filters.value.category.includes(newCategory)) {
            filters.value.category = [newCategory];
        } else if (!newCategory) {
            filters.value.category = [];
        }
    },
    { immediate: true }
);

// Handle initial date filter from props (from heatmap click)
watch(
    () => props.initialDateFilter,
    (newDate) => {
        if (newDate) {
            // Create UTC date from the date string (YYYY-MM-DD format)
            // This ensures consistency with how the heatmap counts dates
            const [year, month, day] = newDate.split("-").map(Number);
            const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
            filters.value.dateRange = [date, date];

            // Clear other filters when navigating with date
            if (!props.initialTagFilter) filters.value.tags = [];
            if (!props.initialCategoryFilter) filters.value.category = [];
            if (!props.initialStatusFilter) filters.value.status = [];
        } else {
            // Clear date range if no initial filter
            filters.value.dateRange = null;
        }
    },
    { immediate: true }
);

// Handle initial status filter from props (from status badges click)
watch(
    () => props.initialStatusFilter,
    (newStatus) => {
        if (newStatus && !filters.value.status.includes(newStatus)) {
            filters.value.status = [newStatus];
            // Clear other filters when navigating with status
            if (!props.initialTagFilter) filters.value.tags = [];
            if (!props.initialCategoryFilter) filters.value.category = [];
            if (!props.initialDateFilter) filters.value.dateRange = null;
        } else if (!newStatus) {
            filters.value.status = [];
        }
    },
    { immediate: true }
);

// Handle initial date range filter from props (from dashboard brush)
watch(
    () => props.initialDateRangeFilter,
    (newDateRange) => {
        if (newDateRange) {
            filters.value.dateRange = [newDateRange.from, newDateRange.to];

            // Clear other filters
            if (!props.initialTagFilter) filters.value.tags = [];
            if (!props.initialCategoryFilter) filters.value.category = [];
            if (!props.initialStatusFilter) filters.value.status = [];
        } else if (!newDateRange && !props.initialDateFilter) {
            filters.value.dateRange = null;
        }
    },
    { immediate: true }
);

function statusSeverity(s) {
    return s === "Implemented"
        ? "success"
        : s === "Active"
          ? "info"
          : s === "Under Review"
            ? "warning"
            : "secondary";
}
const showForm = ref(false),
    editing = ref(null);
function openNew() {
    editing.value = {
        title: "",
        description: "",
        category: "",
        status: "Active",
        tags: [],
    };
    showForm.value = true;
}
function editRow(row) {
    editing.value = { ...row };
    showForm.value = true;
}
async function saveRow(form) {
    if (editing.value?.id) await store.patch(editing.value.id, form);
    else await store.add(form);
}
async function removeRow(row) {
    if (confirm("Delete this idea?")) await store.remove(row.id);
}
// Debounced voting function
const debouncedVote = useDebounceFn(async (row) => {
    votingId.value = row.id;
    try {
        await store.upvoteIdea(row.id);
    } finally {
        votingId.value = null;
    }
}, 300);

async function vote(row) {
    if (votingId.value === row.id) return;
    debouncedVote(row);
}

// Handle refresh with loading state
async function handleRefresh() {
    await withLoading(async () => {
        // Simulate network delay for demo
        await new Promise((resolve) => setTimeout(resolve, 500));
        store.refresh();
    }, "Refreshing ideas...");
}

// Toggle tag filter when clicked
function addTagFilter(tag) {
    if (!filters.value.tags.includes(tag)) {
        // Add tag to filter
        filters.value.tags = [...filters.value.tags, tag];
    } else {
        // Remove tag from filter
        filters.value.tags = filters.value.tags.filter((t) => t !== tag);
    }
}

// Pagination functions
function onPageChange(event) {
    currentPage.value = event.page;
    rowsPerPage.value = event.rows;
}

// Close mobile menu when clicking outside
onClickOutside(toolbarRef, () => {
    mobileMenuOpen.value = false;
});

// Close mobile menu when window resizes to desktop
function handleResize() {
    if (window.innerWidth > 768) {
        mobileMenuOpen.value = false;
    }
}

onMounted(() => {
    store.refresh();
    window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.position-relative {
    position: relative;
}

/* Full height container setup */
.idea-table-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    position: relative;
}

/* For dashboard view with limit */
.idea-table-container.limited {
    height: auto;
    overflow: visible;
}

.toolbar-header {
    flex-shrink: 0;
    margin-bottom: 0.75rem;
    position: relative;
}

/* Grid view container */
.grid-view-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    overflow: hidden;
}

/* Scrollable content for Ideas page */
.idea-table-container:not(.limited) .scrollable-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 70px; /* Space for fixed paginator + spacing */
    min-height: 0;
}

/* Auto height for Dashboard */
.idea-table-container.limited .scrollable-content {
    height: auto;
    overflow: visible;
    padding-bottom: 1rem;
}

/* Auto height for limited grid view */
.idea-table-container.limited .grid-view-container {
    height: auto;
}

.idea-table-container:not(.limited) .pagination-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    border-top: 1px solid var(--surface-border);
    padding: 1rem;
    background: var(--surface-card);
    margin: 0;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

/* Normal position for limited view */
.idea-table-container.limited .pagination-wrapper {
    position: relative;
    border-top: 1px solid var(--surface-border);
    padding: 1rem;
    background: var(--surface-card);
}

/* Table view container */
.table-view-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    position: relative;
    overflow: hidden;
}

/* Full height table for Ideas page */
.idea-table-container:not(.limited) .full-height-table {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
}

/* Limited height table for Dashboard */
.idea-table-container.limited .full-height-table {
    height: auto;
}

/* Make DataTable wrapper scrollable for Ideas page */
.idea-table-container:not(.limited)
    .full-height-table
    :deep(.p-datatable-wrapper) {
    flex: 1;
    overflow-y: auto;
    overflow-x: auto;
    min-height: 0;
    padding-bottom: 60px; /* Space for fixed paginator */
}

/* Auto height for Dashboard */
.idea-table-container.limited .full-height-table :deep(.p-datatable-wrapper) {
    height: auto;
    overflow: visible;
}

/* Fixed paginator at bottom for Ideas page */
.idea-table-container:not(.limited) .full-height-table :deep(.p-paginator) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: var(--surface-card);
    border-top: 1px solid var(--surface-border);
    margin: 0;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

/* Hide paginator for Dashboard */
.idea-table-container.limited .full-height-table :deep(.p-paginator) {
    display: none;
}

/* Mobile toolbar - hidden on desktop */
.mobile-toolbar {
    display: none;
}

/* Desktop toolbar - visible on desktop */
.desktop-toolbar {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    width: 100%;
}

/* Mobile filters - hidden by default */
.mobile-filters {
    display: none;
}

/* Enhanced input and filter styling */
.search-box {
    position: relative;
}

.search-box .p-inputtext,
.search-box .search-input {
    border-radius: 20px;
    padding-left: 2.5rem;
}

.search-box i {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-color-secondary);
    z-index: 1;
}

.date-picker .p-calendar {
    width: 100%;
}

.filters-group .p-multiselect,
.date-picker .p-calendar,
.sort-dropdown {
    border-radius: 8px;
    width: 10rem;
}

.filters-group .p-multiselect:hover,
.date-picker .p-calendar:hover,
.sort-dropdown:hover,
.search-box .p-inputtext:hover {
    border-color: var(--primary-color);
}

.filters-group .p-multiselect:focus,
.date-picker .p-calendar:focus,
.sort-dropdown:focus,
.search-box .p-inputtext:focus {
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

/* Vote count styling */
.vote-count {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.2s;
    color: var(--text-color-secondary);
}

.vote-count:hover {
    background-color: var(--surface-100);
    color: var(--primary-color);
}

.vote-count.voting {
    opacity: 0.5;
    cursor: not-allowed;
}

.vote-count .vote-number {
    font-weight: 700;
    font-size: 1rem;
}

/* Right-align column headers */
:deep(.p-datatable .p-column-header-content) {
    display: flex;
    align-items: center;
}

/* Right-align specific column headers */
:deep(.p-datatable th:nth-child(3) .p-column-header-content), /* Category */
:deep(.p-datatable th:nth-child(5) .p-column-header-content), /* Tags */
:deep(.p-datatable th:nth-child(6) .p-column-header-content) {
    /* Actions */
    justify-content: flex-end;
}

/* Prevent status tags from wrapping */
:deep(.p-tag) {
    white-space: nowrap;
}

/* Category text styling */
.category-text {
    font-weight: 600;
    color: var(--primary-color);
    font-size: 0.875rem;
}

/* Custom tag styling with icon */
.custom-tag {
    display: inline-flex;
    align-items: center;
    background-color: var(--surface-100) !important;
    color: var(--text-color-secondary) !important;
    padding: 0.125rem 0.5rem !important;
    border: 1px solid transparent;
    transition: all 0.2s;
}

.custom-tag:hover {
    background-color: var(--surface-200) !important;
}

.custom-tag.tag-active {
    background-color: var(--primary-color) !important;
    color: white !important;
    border-color: var(--primary-color);
}

.custom-tag.tag-active:hover {
    background-color: var(--primary-color) !important;
    color: white !important;
    opacity: 0.9;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.custom-tag i {
    font-size: 0.625rem;
    opacity: 0.7;
}

.custom-tag.tag-active i {
    opacity: 1;
}

/* Masonry grid layout */
.masonry-grid {
    column-count: 1;
    column-gap: 1rem;
    width: 100%;
}

.masonry-item {
    break-inside: avoid;
    margin-bottom: 1rem;
    display: inline-block;
    width: 100%;
}

/* Masonry transitions */
.masonry-enter-active,
.masonry-leave-active {
    transition: all 0.3s ease;
}

.masonry-enter-from {
    opacity: 0;
    transform: scale(0.9);
}

.masonry-leave-to {
    opacity: 0;
    transform: scale(0.8);
}

/* Responsive masonry columns */
@media (min-width: 768px) {
    .masonry-grid {
        column-count: 2;
    }
}

@media (min-width: 992px) {
    .masonry-grid {
        column-count: 3;
    }
}

@media (min-width: 1200px) {
    .masonry-grid {
        column-count: 4;
    }
}

/* Responsive toolbar */
@media (max-width: 768px) {
    /* Hide desktop toolbar */
    .desktop-toolbar {
        display: none;
    }

    /* Show mobile toolbar */
    .mobile-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        gap: 0.5rem;
    }

    /* Mobile left section */
    .mobile-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }

    /* Mobile right section */
    .mobile-right {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-shrink: 0;
    }

    /* Mobile search box */
    .mobile-search {
        flex: 1;
        min-width: 0;
    }

    /* Make mobile buttons smaller */
    .mobile-right .p-button {
        width: 2rem;
        height: 2rem;
    }

    /* Mobile filters dropdown */
    .mobile-filters {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--surface-card);
        border: 1px solid var(--surface-border);
        border-top: none;
        padding: 1rem;
        z-index: 100;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        flex-direction: column;
        gap: 0.75rem;
    }

    /* Show filters when open */
    .mobile-filters.mobile-open {
        display: flex;
    }

    /* Full width controls on mobile */
    .mobile-filters > * {
        width: 100% !important;
    }
}
</style>
<style scoped>
.card {
    background: var(--surface-card);
    border-radius: var(--border-radius);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    padding: 1rem;
}
</style>
