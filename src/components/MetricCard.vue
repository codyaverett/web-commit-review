<template>
    <div class="metric-card surface-card p-4 border-round shadow-2">
        <div class="flex align-items-center justify-content-between mb-3">
            <div>
                <span class="text-500 text-sm block mb-2">{{ title }}</span>
                <div class="text-3xl font-bold" :class="valueColorClass">
                    {{ displayValue }}
                </div>
            </div>
            <div
                class="metric-icon border-round p-3"
                :class="iconBackgroundClass"
            >
                <i :class="iconClass" class="text-2xl" />
            </div>
        </div>
        <div v-if="$slots.footer || trend || subtitle" class="metric-footer">
            <slot name="footer">
                <div v-if="trend" class="flex align-items-center">
                    <Tag
                        :value="`${trend.value}${trend.suffix || ''}`"
                        :severity="trend.severity || 'success'"
                        class="text-xs"
                    />
                    <span v-if="trend.label" class="text-500 text-sm ml-2">{{
                        trend.label
                    }}</span>
                </div>
                <div v-else-if="subtitle" class="text-500 text-sm">
                    <span v-if="subtitle.bold" class="font-semibold">{{
                        subtitle.bold
                    }}</span>
                    {{ subtitle.text }}
                </div>
            </slot>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import Tag from "primevue/tag";

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
    trend: {
        type: Object,
        default: null,
        // Expected shape: { value: '+5%', severity: 'success', label: 'vs last week', suffix: '%' }
    },
    subtitle: {
        type: Object,
        default: null,
        // Expected shape: { bold: '25%', text: 'of total' }
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

const backgroundMap = {
    primary: "bg-primary-100",
    green: "bg-green-100",
    orange: "bg-orange-100",
    purple: "bg-purple-100",
    blue: "bg-blue-100",
    red: "bg-red-100",
};

const valueColorClass = computed(
    () => colorMap[props.color] || colorMap.primary
);
const iconBackgroundClass = computed(
    () => backgroundMap[props.color] || backgroundMap.primary
);
const iconClass = computed(
    () => `${props.icon} ${colorMap[props.color] || colorMap.primary}`
);
</script>

<style scoped>
.metric-card {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    height: 100%;
}

.metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.metric-icon {
    background: linear-gradient(
        135deg,
        rgba(139, 92, 246, 0.1) 0%,
        rgba(139, 92, 246, 0.05) 100%
    );
}

.metric-footer {
    min-height: 24px;
}
</style>
