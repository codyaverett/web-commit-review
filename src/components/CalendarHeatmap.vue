<template>
    <div ref="heatmapContainer" class="calendar-heatmap-container">
        <div v-if="loading" class="loading-spinner">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import * as d3 from "d3";
import { useD3Resize } from "../composables/useD3Resize";

const props = defineProps({
    data: {
        type: Array,
        default: () => [],
        // Expected shape: [{ date: string/Date, count: number }, ...]
    },
    year: {
        type: Number,
        default: new Date().getFullYear(),
    },
    colorScheme: {
        type: String,
        default: "greens", // greens, blues, purples, oranges, reds
    },
    cellSize: {
        type: Number,
        default: 15,
    },
    cellPadding: {
        type: Number,
        default: 2,
    },
    showMonthLabels: {
        type: Boolean,
        default: true,
    },
    showDayLabels: {
        type: Boolean,
        default: true,
    },
    clickable: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(["date-click"]);

const heatmapContainer = ref(null);
const loading = ref(false);

// Check if dark theme is active
const isDarkTheme = computed(() => {
    return document.documentElement.classList.contains("dark-theme");
});

// Get appropriate color scheme based on theme
const getColorScheme = () => {
    if (isDarkTheme.value) {
        // Use brighter color schemes for dark theme
        const darkSchemes = {
            greens: d3.interpolateTurbo,
            blues: d3.interpolateCool,
            purples: d3.interpolatePlasma,
            oranges: d3.interpolateWarm,
            reds: d3.interpolateInferno,
        };
        return darkSchemes[props.colorScheme] || darkSchemes.greens;
    } else {
        // Original color schemes for light theme
        const lightSchemes = {
            greens: d3.interpolateGreens,
            blues: d3.interpolateBlues,
            purples: d3.interpolatePurples,
            oranges: d3.interpolateOranges,
            reds: d3.interpolateReds,
        };
        return lightSchemes[props.colorScheme] || lightSchemes.greens;
    }
};

const drawHeatmap = () => {
    if (!heatmapContainer.value) return;

    loading.value = true;

    // Clear previous heatmap
    d3.select(heatmapContainer.value).selectAll("*").remove();

    const container = heatmapContainer.value;
    const containerWidth = container.clientWidth || container.offsetWidth;

    // Don't draw if container is too small
    if (containerWidth < 50) {
        loading.value = false;
        return;
    }

    // Calculate dimensions - responsive for mobile
    const isMobile = containerWidth < 600;
    const isTablet = containerWidth < 900;
    const cellSize = isMobile
        ? Math.max(8, Math.floor(containerWidth / 60))
        : isTablet
          ? Math.min(12, props.cellSize)
          : props.cellSize;
    const cellPadding = isMobile ? 1 : props.cellPadding;
    const yearHeight = cellSize * 7 + cellPadding * 6;
    const monthLabelHeight = props.showMonthLabels ? 20 : 0;
    const dayLabelWidth = props.showDayLabels && !isMobile ? 30 : 0;
    const legendHeight = 40;

    // Get the first Sunday before or on the start date (using UTC)
    const firstSunday = d3.utcSunday.floor(
        new Date(Date.UTC(props.year, 0, 1))
    );

    // Calculate weeks in UTC
    const weeks = d3.utcWeeks(
        firstSunday,
        new Date(Date.UTC(props.year + 1, 0, 1))
    );
    const weekCount = weeks.length;

    const width = Math.min(
        containerWidth,
        dayLabelWidth + weekCount * (cellSize + cellPadding) + 20
    );
    const height = monthLabelHeight + yearHeight + legendHeight + 20;

    // Process data into a map for quick lookup
    const dataMap = new Map();
    props.data.forEach((d) => {
        // Add one day to correct the off-by-one display issue
        const adjustedDate = new Date(d.date);
        adjustedDate.setUTCDate(adjustedDate.getUTCDate());
        const dateStr = d3.utcFormat("%Y-%m-%d")(adjustedDate);
        dataMap.set(dateStr, d.count);
    });

    // Get max count for color scale
    const maxCount = d3.max(props.data, (d) => d.count) || 1;

    // Use theme-aware color scheme
    const colorScale = d3
        .scaleSequential()
        .domain([0, maxCount])
        .interpolator(getColorScheme());

    // Create SVG
    const svg = d3
        .select(heatmapContainer.value)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create main group
    const g = svg
        .append("g")
        .attr("transform", `translate(${dayLabelWidth}, ${monthLabelHeight})`);

    // Create tooltip
    const tooltip = d3
        .select(heatmapContainer.value)
        .append("div")
        .attr("class", "heatmap-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.85)")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "100")
        .style("box-shadow", "0 2px 8px rgba(0, 0, 0, 0.2)");

    // Day labels
    if (props.showDayLabels) {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        svg.selectAll(".day-label")
            .data([1, 3, 5]) // Show Mon, Wed, Fri
            .enter()
            .append("text")
            .attr("class", "day-label")
            .attr("x", dayLabelWidth - 5)
            .attr(
                "y",
                (d) =>
                    monthLabelHeight +
                    d * (cellSize + cellPadding) +
                    cellSize / 2
            )
            .attr("text-anchor", "end")
            .attr("alignment-baseline", "middle")
            .style("font-size", "10px")
            .style("fill", "var(--text-color-secondary, #6b7280)")
            .text((d) => days[d]);
    }

    // Month labels
    if (props.showMonthLabels) {
        const months = d3.utcMonths(
            new Date(Date.UTC(props.year, 0, 1)),
            new Date(Date.UTC(props.year + 1, 0, 1))
        );
        svg.selectAll(".month-label")
            .data(months)
            .enter()
            .append("text")
            .attr("class", "month-label")
            .attr("x", (d) => {
                const weekNumber = d3.utcWeek.count(firstSunday, d);
                return dayLabelWidth + weekNumber * (cellSize + cellPadding);
            })
            .attr("y", monthLabelHeight - 5)
            .style("font-size", "11px")
            .style("fill", "var(--text-color-secondary, #374151)")
            .text((d) => d3.utcFormat("%b")(d));
    }

    // Create cells for each day
    // Create days from Jan 1 to Dec 31 of the specified year
    // Use UTC to avoid timezone issues
    const days = d3.utcDays(
        new Date(Date.UTC(props.year, 0, 1)),
        new Date(Date.UTC(props.year + 1, 0, 1))
    );

    g.selectAll(".day-cell")
        .data(days)
        .enter()
        .append("rect")
        .attr("class", "day-cell")
        .attr("x", (d) => {
            const weekNumber = d3.utcWeek.count(firstSunday, d);
            return weekNumber * (cellSize + cellPadding);
        })
        .attr("y", (d) => d.getUTCDay() * (cellSize + cellPadding))
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("rx", 2)
        .attr("ry", 2)
        .style("fill", (d) => {
            const dateStr = d3.utcFormat("%Y-%m-%d")(d);
            const count = dataMap.get(dateStr) || 0;
            return count === 0
                ? "var(--surface-border, #e5e7eb)"
                : colorScale(count);
        })
        .style("stroke", "var(--surface-ground, #fff)")
        .style("stroke-width", 1)
        .style("cursor", props.clickable ? "pointer" : "default")
        .style("opacity", 0)
        .transition()
        .duration(300)
        .delay((d, i) => i * 2)
        .style("opacity", 1)
        .selection()
        .on("mouseover", function (event, d) {
            const dateStr = d3.utcFormat("%Y-%m-%d")(d);
            const count = dataMap.get(dateStr) || 0;

            d3.select(this)
                .transition()
                .duration(100)
                .style("stroke", "var(--primary-color, #374151)")
                .style("stroke-width", 2);

            tooltip.transition().duration(200).style("opacity", 1);

            const formattedDate = d3.utcFormat("%B %d, %Y")(d);
            const dayName = d3.utcFormat("%A")(d);

            tooltip.html(`
                <div style="font-weight: bold; margin-bottom: 4px;">${formattedDate}</div>
                <div style="font-size: 10px; opacity: 0.8; margin-bottom: 2px;">${dayName}</div>
                <div>${count} ${count === 1 ? "idea" : "ideas"}</div>
                ${props.clickable ? '<div style="font-size: 10px; margin-top: 4px; opacity: 0.8;">Click to view</div>' : ""}
            `);

            // Position tooltip
            const rect = heatmapContainer.value.getBoundingClientRect();
            tooltip
                .style("left", event.clientX - rect.left + 10 + "px")
                .style("top", event.clientY - rect.top - 10 + "px");
        })
        .on("mousemove", function (event) {
            const rect = heatmapContainer.value.getBoundingClientRect();
            tooltip
                .style("left", event.clientX - rect.left + 10 + "px")
                .style("top", event.clientY - rect.top - 10 + "px");
        })
        .on("mouseout", function () {
            d3.select(this)
                .transition()
                .duration(100)
                .style("stroke", "var(--surface-ground, #fff)")
                .style("stroke-width", 1);

            tooltip.transition().duration(200).style("opacity", 0);
        })
        .on("click", function (event, d) {
            if (!props.clickable) return;

            const dateStr = d3.utcFormat("%Y-%m-%d")(d);
            const count = dataMap.get(dateStr) || 0;

            // Click animation
            d3.select(this)
                .transition()
                .duration(100)
                .attr("transform", "scale(0.9)")
                .transition()
                .duration(100)
                .attr("transform", "scale(1)");

            emit("date-click", {
                date: d,
                dateStr: dateStr,
                count: count,
            });
        });

    // Add legend
    const legendWidth = 200;
    const legendX = width - legendWidth - 20;
    const legendY = height - 30;

    const legendGroup = svg
        .append("g")
        .attr("transform", `translate(${legendX}, ${legendY})`);

    // Legend label
    legendGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("font-size", "11px")
        .style("fill", "var(--text-color-secondary, #6b7280)")
        .text("Less");

    // Legend cells
    const legendScale = d3.scaleLinear().domain([0, 4]).range([0, maxCount]);

    const legendCells = [0, 1, 2, 3, 4];

    legendGroup
        .selectAll(".legend-cell")
        .data(legendCells)
        .enter()
        .append("rect")
        .attr("class", "legend-cell")
        .attr("x", (d) => 30 + d * (cellSize + cellPadding))
        .attr("y", -cellSize / 2)
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("rx", 2)
        .attr("ry", 2)
        .style("fill", (d) =>
            d === 0
                ? "var(--surface-border, #e5e7eb)"
                : colorScale(legendScale(d))
        )
        .style("stroke", "var(--surface-ground, #fff)")
        .style("stroke-width", 1);

    legendGroup
        .append("text")
        .attr("x", 30 + 5 * (cellSize + cellPadding))
        .attr("y", 0)
        .style("font-size", "11px")
        .style("fill", "var(--text-color-secondary, #6b7280)")
        .text("More");

    loading.value = false;
};

// Use resize composable with longer debounce for complex heatmap
useD3Resize(heatmapContainer, drawHeatmap, 250);

// Redraw when data changes
watch(
    () => [props.data, props.year],
    () => {
        drawHeatmap();
    },
    { deep: true }
);

defineExpose({
    redraw: drawHeatmap,
});
</script>

<style scoped>
.calendar-heatmap-container {
    position: relative;
    width: 100%;
    min-height: 200px;
}

.loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--primary-color);
}

:deep(.day-cell) {
    transition: all 0.2s ease;
}

:deep(.day-cell:hover) {
    filter: brightness(1.1);
}

:deep(.heatmap-tooltip) {
    transition: opacity 0.2s ease;
}
</style>
