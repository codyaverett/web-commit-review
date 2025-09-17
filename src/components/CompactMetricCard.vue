<template>
    <div class="compact-metric-card surface-card p-2 border-round shadow-1">
        <div class="flex flex-column align-items-center text-center">
            <div class="metric-icon-compact mb-1">
                <i :class="iconClass" class="text-xl" />
            </div>
            <div class="text-xs text-500">
                {{ title }}
            </div>
            <div class="text-lg font-bold mt-1" :class="valueColorClass">
                {{ displayValue }}
            </div>
            <div v-if="subtitle" class="text-xs text-500 mt-1">
                <span v-if="subtitle.bold" class="font-semibold">{{
                    subtitle.bold
                }}</span>
                {{ subtitle.text }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    value: {
        type: [Number, String],
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        default: "primary",
    },
    subtitle: {
        type: Object,
        default: null,
    },
    formatValue: {
        type: Function,
        default: null,
    },
});

const displayValue = computed(() => {
    if (props.formatValue) {
        return props.formatValue(props.value);
    }
    return props.value;
});

const colorMap = {
    primary: "text-primary",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
    blue: "text-blue-600",
    red: "text-red-600",
};

const valueColorClass = computed(
    () => colorMap[props.color] || colorMap.primary
);
const iconClass = computed(
    () => `${props.icon} ${colorMap[props.color] || colorMap.primary}`
);
</script>

<style scoped>
.compact-metric-card {
    transition: all 0.2s ease;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 90px;
}

.compact-metric-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.metric-icon-compact {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
