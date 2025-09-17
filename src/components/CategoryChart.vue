<template>
    <div
        ref="chartContainer"
        class="category-chart-container"
        :style="{ height: height + 'px' }"
    />
</template>

<script setup>
import { ref, watch, computed } from "vue";
import * as d3 from "d3";
import { useD3Resize } from "../composables/useD3Resize";

const props = defineProps({
    data: {
        type: Array,
        default: () => [],
        // Expected shape: [{ category: string, count: number }, ...]
    },
    height: {
        type: Number,
        default: 300,
    },
    colors: {
        type: Array,
        default: () => [
            "#8B5CF6",
            "#EC4899",
            "#10B981",
            "#F59E0B",
            "#3B82F6",
            "#EF4444",
        ],
    },
    innerRadiusRatio: {
        type: Number,
        default: 0.5,
    },
    showLabels: {
        type: Boolean,
        default: true,
    },
    showCenterText: {
        type: Boolean,
        default: true,
    },
    centerText: {
        type: Object,
        default: null,
        // Expected shape: { value: '25', label: 'Total' }
    },
    clickable: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(["category-click"]);

const chartContainer = ref(null);

// Check if dark theme is active
const isDarkTheme = computed(() => {
    return document.documentElement.classList.contains("dark-theme");
});

const drawChart = () => {
    if (!chartContainer.value) return;

    // Clear previous chart
    d3.select(chartContainer.value).selectAll("*").remove();

    const container = chartContainer.value;
    const containerWidth = container.clientWidth || container.offsetWidth;
    const width = Math.min(containerWidth, window.innerWidth - 40); // Account for padding
    const height = Math.min(props.height, window.innerHeight * 0.5);

    // Don't draw if container is too small
    if (width < 100 || height < 100) {
        return;
    }

    // Responsive sizing for mobile
    const isMobile = width < 400;
    const padding = isMobile ? 10 : 20;
    const effectiveWidth = width - padding * 2;
    const effectiveHeight = height - padding * 2;

    const radius = Math.min(effectiveWidth, effectiveHeight) / 2;

    if (!props.data || props.data.length === 0) {
        // Show "No Data" message
        d3.select(chartContainer.value)
            .append("div")
            .attr("class", "no-data-message")
            .style("text-align", "center")
            .style("padding-top", `${height / 2 - 20}px`)
            .style("color", "var(--text-color-secondary, #6b7280)")
            .text("No data available");
        return;
    }

    const svg = d3
        .select(chartContainer.value)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3
        .scaleOrdinal()
        .domain(props.data.map((d) => d.category))
        .range(props.colors);

    const pie = d3
        .pie()
        .value((d) => d.count)
        .sort(null);

    const arc = d3
        .arc()
        .innerRadius(radius * props.innerRadiusRatio)
        .outerRadius(radius * 0.8);

    const labelArc = d3
        .arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    // Create tooltip
    const tooltip = d3
        .select(chartContainer.value)
        .append("div")
        .attr("class", "chart-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "10");

    // Pie slices
    const arcs = g
        .selectAll(".arc")
        .data(pie(props.data))
        .enter()
        .append("g")
        .attr("class", "arc");

    // Add paths with animation
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", (d) => color(d.data.category))
        .attr(
            "stroke",
            isDarkTheme.value ? "var(--surface-ground, #121212)" : "white"
        )
        .attr("stroke-width", 2)
        .style("cursor", props.clickable ? "pointer" : "default")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .style("opacity", 1)
        .attrTween("d", function (d) {
            const interpolate = d3.interpolate(
                { startAngle: 0, endAngle: 0 },
                d
            );
            return function (t) {
                return arc(interpolate(t));
            };
        });

    // Add interactivity
    arcs.select("path")
        .on("mouseover", function (event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("transform", "scale(1.05)");

            const percentage = (
                (d.data.count / d3.sum(props.data, (item) => item.count)) *
                100
            ).toFixed(1);

            tooltip.transition().duration(200).style("opacity", 1);

            tooltip.html(
                `
                <div><strong>${d.data.category}</strong></div>
                <div>Count: ${d.data.count}</div>
                <div>Percentage: ${percentage}%</div>
                ${props.clickable ? '<div style="font-size: 10px; margin-top: 4px; opacity: 0.8;">Click to filter</div>' : ""}
            `
            );

            // Position tooltip based on mouse position
            const rect = chartContainer.value.getBoundingClientRect();
            tooltip
                .style("left", event.clientX - rect.left + 10 + "px")
                .style("top", event.clientY - rect.top - 10 + "px");
        })
        .on("mousemove", function (event) {
            // Update tooltip position as mouse moves
            const rect = chartContainer.value.getBoundingClientRect();
            tooltip
                .style("left", event.clientX - rect.left + 10 + "px")
                .style("top", event.clientY - rect.top - 10 + "px");
        })
        .on("mouseout", function () {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("transform", "scale(1)");

            tooltip.transition().duration(200).style("opacity", 0);
        })
        .on("click", function (event, d) {
            if (!props.clickable) return;

            // Add click animation
            d3.select(this)
                .transition()
                .duration(100)
                .attr("transform", "scale(0.95)")
                .transition()
                .duration(100)
                .attr("transform", "scale(1)");

            emit("category-click", d.data);
        });

    // Labels - hide on very small screens
    if (props.showLabels && !isMobile) {
        const darkMode =
            document.documentElement.classList.contains("dark-theme");
        arcs.append("text")
            .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .style("fill", darkMode ? "#e5e7eb" : "#1f2937")
            .style(
                "text-shadow",
                darkMode
                    ? "0 1px 2px rgba(0, 0, 0, 0.8)"
                    : "0 1px 2px rgba(255, 255, 255, 0.8)"
            )
            .style("opacity", 0)
            .text((d) => {
                if (d.data.count === 0) return "";
                // Shorter labels on mobile
                const label = isMobile
                    ? d.data.category
                    : `${d.data.category} (${d.data.count})`;
                return label.length > 15
                    ? label.substring(0, 12) + "..."
                    : label;
            })
            .transition()
            .delay(800)
            .duration(300)
            .style("opacity", 1);
    }

    // Center text
    if (props.showCenterText) {
        const centerData = props.centerText || {
            value: d3.sum(props.data, (d) => d.count).toString(),
            label: "Total",
        };

        const centerGroup = g
            .append("g")
            .attr("class", "center-text")
            .style("opacity", 0);

        centerGroup
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.5em")
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .style("fill", "var(--text-color, #1f2937)")
            .text(centerData.value);

        centerGroup
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1em")
            .style("font-size", "14px")
            .style("fill", "var(--text-color-secondary, #6b7280)")
            .text(centerData.label);

        centerGroup.transition().delay(1000).duration(300).style("opacity", 1);
    }
};

// Use resize composable
useD3Resize(chartContainer, drawChart, 150);

// Redraw when data changes
watch(
    () => props.data,
    () => {
        drawChart();
    },
    { deep: true }
);

defineExpose({
    redraw: drawChart,
});
</script>

<style scoped>
.category-chart-container {
    position: relative;
    width: 100%;
}

.no-data-message {
    font-size: 14px;
    color: #6b7280;
}

:deep(.arc path) {
    transition: transform 0.2s ease;
}

:deep(.chart-tooltip) {
    transition: opacity 0.2s ease;
}
</style>
