<template>
    <div
        class="status-card surface-card p-3 border-round shadow-1 hover:shadow-3 transition-all transition-duration-300"
    >
        <div class="flex align-items-center justify-content-between">
            <div>
                <div class="text-500 text-sm mb-1">
                    {{ status }}
                </div>
                <div class="text-2xl font-bold">
                    {{ count }}
                </div>
            </div>
            <Tag :value="status" :severity="severity" />
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import Tag from "primevue/tag";

const props = defineProps({
    status: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        required: true,
    },
    severityMap: {
        type: Object,
        default: () => ({
            Active: "success",
            "Under Review": "warning",
            Implemented: "info",
            Archived: "secondary",
        }),
    },
});

const severity = computed(() => {
    return props.severityMap[props.status] || "secondary";
});
</script>

<style scoped>
.status-card {
    cursor: pointer;
    height: 100%;
}

.status-card:hover {
    transform: translateY(-1px);
}
</style>
