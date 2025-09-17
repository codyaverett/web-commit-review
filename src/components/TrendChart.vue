<template>
    <div
        ref="chartContainer"
        class="trend-chart-container"
        :style="{ height: height + 'px' }"
    />
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue";
import * as d3 from "d3";
import { useD3Resize } from "../composables/useD3Resize";

const props = defineProps({
    data: {
        type: Array,
        default: () => [],
        // Enhanced data shape with multiple metrics
    },
    height: {
        type: Number,
        default: 300,
    },
    timeRange: {
        type: String,
        default: "7d",
    },
    color: {
        type: String,
        default: "#8B5CF6",
    },
    showDots: {
        type: Boolean,
        default: true,
    },
    showArea: {
        type: Boolean,
        default: true,
    },
    margin: {
        type: Object,
        default: () => ({ top: 35, right: 30, bottom: 40, left: 60 }),
    },
    showVotes: {
        type: Boolean,
        default: false,
    },
    showMovingAverage: {
        type: Boolean,
        default: false,
    },
    showStatusBreakdown: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(["date-click", "brush-select"]);

const chartContainer = ref(null);

const drawChart = () => {
    if (!chartContainer.value) return;

    // Clear previous chart and tooltips
    d3.select(chartContainer.value).selectAll("*").remove();
    d3.select("body").selectAll(".d3-tooltip").remove();

    const container = chartContainer.value;
    const width = container.clientWidth || container.offsetWidth;
    const height = Math.min(props.height, window.innerHeight * 0.5);

    // Don't draw if container is too small
    if (width < 100 || height < 100) {
        return;
    }

    // Responsive margins
    const isMobile = width < 600;
    const margin = isMobile
        ? { top: 35, right: 20, bottom: 30, left: 40 }
        : props.margin;

    // Use provided data or generate sample data
    let chartData = props.data;
    if (!chartData || chartData.length === 0) {
        const days =
            props.timeRange === "7d"
                ? 7
                : props.timeRange === "30d"
                  ? 30
                  : props.timeRange === "90d"
                    ? 90
                    : props.timeRange === "180d"
                      ? 180
                      : 30;
        chartData = Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - i - 1));
            return {
                date: date,
                created: Math.floor(Math.random() * 10 + 5 + i * 0.5),
                votes: Math.floor(Math.random() * 20 + 10),
                active: Math.floor(Math.random() * 5),
                implemented: Math.floor(Math.random() * 2),
                underReview: Math.floor(Math.random() * 3),
                movingAvg: Math.floor(Math.random() * 8 + 4),
            };
        });
    }

    const svg = d3
        .select(chartContainer.value)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
        .scaleTime()
        .domain(d3.extent(chartData, (d) => d.date))
        .range([0, width - margin.left - margin.right]);

    // Scale for ideas created (primary y-axis)
    const maxValue = props.showStatusBreakdown
        ? d3.max(chartData, (d) => d.created || 0)
        : d3.max(chartData, (d) =>
              Math.max(
                  d.created || 0,
                  d.active || 0,
                  d.implemented || 0,
                  d.underReview || 0
              )
          );

    const y = d3
        .scaleLinear()
        .domain([0, maxValue])
        .nice()
        .range([height - margin.top - margin.bottom, 0]);

    // Scale for votes (secondary y-axis)
    const yVotes = d3
        .scaleLinear()
        .domain([0, d3.max(chartData, (d) => d.votes || 0)])
        .nice()
        .range([height - margin.top - margin.bottom, 0]);

    // Create stacked area chart for status breakdown
    if (props.showStatusBreakdown) {
        // Define colors for each status
        const statusColors = {
            active: "#3b82f6", // Blue
            underReview: "#f59e0b", // Amber
            implemented: "#10b981", // Green
        };

        // Stack the data
        const stack = d3
            .stack()
            .keys(["implemented", "underReview", "active"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        const stackedData = stack(
            chartData.map((d) => ({
                date: d.date,
                active: d.active || 0,
                underReview: d.underReview || 0,
                implemented: d.implemented || 0,
            }))
        );

        // Create area generator
        const area = d3
            .area()
            .x((d, i) => x(chartData[i].date))
            .y0((d) => y(d[0]))
            .y1((d) => y(d[1]))
            .curve(d3.curveMonotoneX);

        // Add the areas
        g.selectAll(".status-area")
            .data(stackedData)
            .enter()
            .append("path")
            .attr("class", (d) => `status-area status-${d.key}`)
            .attr("fill", (d) => statusColors[d.key])
            .attr("d", area)
            .style("opacity", 0.7)
            .on("mouseover", function () {
                // Highlight this area
                d3.selectAll(".status-area").style("opacity", 0.3);
                d3.select(this).style("opacity", 0.9);
            })
            .on("mouseout", function () {
                // Reset opacity
                d3.selectAll(".status-area").style("opacity", 0.7);
            });

        // Add dots for each status where there's data
        if (props.showDots) {
            // Add dots for implemented ideas
            g.selectAll(".dot-implemented")
                .data(chartData.filter((d) => d.implemented > 0))
                .enter()
                .append("circle")
                .attr("class", "dot-implemented")
                .attr("cx", (d) => x(d.date))
                .attr("cy", (d) => y(d.implemented))
                .attr("r", 3)
                .attr("fill", statusColors.implemented)
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .style("opacity", 0)
                .transition()
                .delay((d, i) => i * 30)
                .duration(300)
                .style("opacity", 1);

            // Add dots for under review ideas (stacked on top of implemented)
            g.selectAll(".dot-underReview")
                .data(chartData.filter((d) => d.underReview > 0))
                .enter()
                .append("circle")
                .attr("class", "dot-underReview")
                .attr("cx", (d) => x(d.date))
                .attr("cy", (d) => y(d.implemented + d.underReview))
                .attr("r", 3)
                .attr("fill", statusColors.underReview)
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .style("opacity", 0)
                .transition()
                .delay((d, i) => i * 30)
                .duration(300)
                .style("opacity", 1);

            // Add dots for active ideas (stacked on top of implemented + underReview)
            g.selectAll(".dot-active")
                .data(chartData.filter((d) => d.active > 0))
                .enter()
                .append("circle")
                .attr("class", "dot-active")
                .attr("cx", (d) => x(d.date))
                .attr("cy", (d) => y(d.implemented + d.underReview + d.active))
                .attr("r", 3)
                .attr("fill", statusColors.active)
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .style("opacity", 0)
                .transition()
                .delay((d, i) => i * 30)
                .duration(300)
                .style("opacity", 1);
        }
    } else if (props.showArea) {
        // Original single area for total created
        const gradient = svg
            .append("defs")
            .append("linearGradient")
            .attr("id", "trend-gradient-created")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0)
            .attr("y1", y(0))
            .attr("x2", 0)
            .attr("y2", y(d3.max(chartData, (d) => d.created || 0)));

        gradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", props.color)
            .attr("stop-opacity", 0.1);

        gradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", props.color)
            .attr("stop-opacity", 0.6);

        // Area for created ideas
        const areaCreated = d3
            .area()
            .x((d) => x(d.date))
            .y0(y(0))
            .y1((d) => y(d.created || 0))
            .curve(d3.curveMonotoneX);

        g.append("path")
            .datum(chartData)
            .attr("fill", "url(#trend-gradient-created)")
            .attr("d", areaCreated)
            .style("opacity", 0)
            .transition()
            .duration(800)
            .style("opacity", 1);
    }

    // Line for created ideas
    const lineCreated = d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(d.created || 0))
        .curve(d3.curveMonotoneX);

    const pathCreated = g
        .append("path")
        .datum(chartData)
        .attr("fill", "none")
        .attr("stroke", props.color)
        .attr("stroke-width", 2.5)
        .attr("d", lineCreated);

    // Animate line drawing
    const totalLengthCreated = pathCreated.node().getTotalLength();
    pathCreated
        .attr("stroke-dasharray", totalLengthCreated + " " + totalLengthCreated)
        .attr("stroke-dashoffset", totalLengthCreated)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    // Moving average line
    if (props.showMovingAverage && chartData.some((d) => d.movingAvg)) {
        const lineMovingAvg = d3
            .line()
            .x((d) => x(d.date))
            .y((d) => y(d.movingAvg || 0))
            .curve(d3.curveMonotoneX);

        g.append("path")
            .datum(chartData)
            .attr("fill", "none")
            .attr("stroke", "#94a3b8")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "5,5")
            .attr("d", lineMovingAvg)
            .style("opacity", 0.7);
    }

    // Votes line (secondary metric)
    if (props.showVotes && chartData.some((d) => d.votes > 0)) {
        const lineVotes = d3
            .line()
            .x((d) => x(d.date))
            .y((d) => yVotes(d.votes || 0))
            .curve(d3.curveMonotoneX);

        g.append("path")
            .datum(chartData)
            .attr("fill", "none")
            .attr("stroke", "#fbbf24")
            .attr("stroke-width", 2)
            .attr("d", lineVotes)
            .style("opacity", 0.8);
    }

    // Interactive dots with tooltips
    if (props.showDots) {
        // Create tooltip div
        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(0, 0, 0, 0.9)")
            .style("color", "white")
            .style("padding", "8px 12px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", "1000");

        g.selectAll(".dot-created")
            .data(chartData)
            .enter()
            .append("circle")
            .attr("class", "dot-created")
            .attr("cx", (d) => x(d.date))
            .attr("cy", (d) => y(d.created || 0))
            .attr("r", 0)
            .attr("fill", props.color)
            .style("cursor", "pointer")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("r", 6);

                let formatDate, periodLabel;
                if (d.period === "month") {
                    formatDate = d3.timeFormat("%B %Y");
                    periodLabel = "Month of ";
                } else if (d.period === "week") {
                    formatDate = d3.timeFormat("%b %d, %Y");
                    periodLabel = "Week of ";
                } else {
                    formatDate = d3.timeFormat("%b %d, %Y");
                    periodLabel = "";
                }

                let content = `<strong>${periodLabel}${formatDate(d.date)}</strong><br/>`;
                content += `Ideas Created: <strong>${d.created || 0}</strong><br/>`;

                if (d.active > 0 || d.implemented > 0 || d.underReview > 0) {
                    content += `<br/>Status Breakdown:<br/>`;
                    if (d.active > 0)
                        content += `&nbsp;&nbsp;Active: ${d.active}<br/>`;
                    if (d.implemented > 0)
                        content += `&nbsp;&nbsp;Implemented: ${d.implemented}<br/>`;
                    if (d.underReview > 0)
                        content += `&nbsp;&nbsp;Under Review: ${d.underReview}<br/>`;
                }

                if (d.topIdea && d.topIdea.votes > 0) {
                    content += `<br/><em>Most voted (${d.topIdea.votes} votes):<br/>${d.topIdea.title.substring(0, 40)}...</em>`;
                }

                tooltip.html(content).style("visibility", "visible");

                // Calculate tooltip position to keep it on screen
                const tooltipNode = tooltip.node();
                const tooltipRect = tooltipNode.getBoundingClientRect();
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;

                let left = event.pageX + 10;
                let top = event.pageY - 10;

                // Check if tooltip goes off right edge
                if (left + tooltipRect.width > windowWidth - 10) {
                    left = event.pageX - tooltipRect.width - 10;
                }

                // Check if tooltip goes off bottom edge
                if (top + tooltipRect.height > windowHeight - 10) {
                    top = event.pageY - tooltipRect.height - 10;
                }

                // Check if tooltip goes off top edge
                if (top < 10) {
                    top = 10;
                }

                tooltip.style("left", left + "px").style("top", top + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("r", 4);
                tooltip.style("visibility", "hidden");
            })
            .on("click", function (event, d) {
                emit("date-click", { date: d.date, data: d });
            })
            .transition()
            .delay((d, i) => i * 50)
            .duration(300)
            .attr("r", 4);
    }

    // X Axis
    const days =
        props.timeRange === "7d"
            ? 7
            : props.timeRange === "30d"
              ? 30
              : props.timeRange === "90d"
                ? 90
                : props.timeRange === "180d"
                  ? 180
                  : chartData.length;

    // Determine tick format based on time range
    let tickFormat, tickCount;
    if (props.timeRange === "7d") {
        tickFormat = d3.timeFormat("%a");
        tickCount = days;
    } else if (props.timeRange === "30d") {
        tickFormat = d3.timeFormat("%b %d");
        tickCount = 6;
    } else if (props.timeRange === "180d") {
        tickFormat = d3.timeFormat("%b");
        tickCount = 6;
    } else if (props.timeRange === "all" && days > 365) {
        tickFormat = d3.timeFormat("%b %Y");
        tickCount = 6;
    } else if (props.timeRange === "all" && days > 90) {
        tickFormat = d3.timeFormat("%b");
        tickCount = 8;
    } else {
        tickFormat = d3.timeFormat("%b %d");
        tickCount = 6;
    }

    g.append("g")
        .attr(
            "transform",
            `translate(0,${height - margin.top - margin.bottom})`
        )
        .call(d3.axisBottom(x).tickFormat(tickFormat).ticks(tickCount))
        .style("color", "#6b7280");

    // Y Axis (left - for ideas) - format as integers with unique values
    const yTickCount = Math.min(maxValue, 5); // Don't show more ticks than the max value

    g.append("g")
        .call(d3.axisLeft(y).ticks(yTickCount).tickFormat(d3.format("d")))
        .style("color", "#6b7280")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -(height - margin.top - margin.bottom) / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#6b7280")
        .style("font-size", "12px")
        .text("Ideas Created");

    // Secondary Y Axis (right - for votes) if showing votes
    if (props.showVotes && chartData.some((d) => d.votes > 0)) {
        g.append("g")
            .attr(
                "transform",
                `translate(${width - margin.left - margin.right}, 0)`
            )
            .call(d3.axisRight(yVotes).ticks(5))
            .style("color", "#fbbf24")
            .append("text")
            .attr("transform", "rotate(90)")
            .attr("y", -margin.right - 10)
            .attr("x", (height - margin.top - margin.bottom) / 2)
            .attr("text-anchor", "middle")
            .style("fill", "#fbbf24")
            .style("font-size", "12px")
            .text("Votes");
    }

    // Add grid lines
    g.append("g")
        .attr("class", "grid")
        .attr(
            "transform",
            `translate(0,${height - margin.top - margin.bottom})`
        )
        .call(
            d3
                .axisBottom(x)
                .tickSize(-(height - margin.top - margin.bottom))
                .tickFormat("")
                .ticks(tickCount)
        )
        .style("stroke-dasharray", "2,2")
        .style("opacity", 0.3);

    g.append("g")
        .attr("class", "grid")
        .call(
            d3
                .axisLeft(y)
                .tickSize(-(width - margin.left - margin.right))
                .tickFormat("")
                .ticks(yTickCount)
        )
        .style("stroke-dasharray", "2,2")
        .style("opacity", 0.3);

    // Add legend for status breakdown or other series
    const legendData = [];

    if (props.showStatusBreakdown) {
        legendData.push({ label: "Implemented", color: "#10b981" });
        legendData.push({ label: "Under Review", color: "#f59e0b" });
        legendData.push({ label: "Active", color: "#3b82f6" });
    } else if (props.showVotes) {
        legendData.push({ label: "Ideas Created", color: props.color });
        legendData.push({ label: "Votes", color: "#fbbf24" });
    }

    // Show legend if we have data to display
    if (legendData.length > 0) {
        const legend = g
            .append("g")
            .attr("class", "legend")
            .attr(
                "transform",
                `translate(${(width - margin.left - margin.right) / 2 - 150}, -25)`
            );

        legendData.forEach((item, i) => {
            const legendItem = legend
                .append("g")
                .attr("transform", `translate(${i * 100}, 0)`);

            if (item.dashed) {
                legendItem
                    .append("line")
                    .attr("x1", 0)
                    .attr("x2", 20)
                    .attr("y1", 5)
                    .attr("y2", 5)
                    .attr("stroke", item.color)
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", "5,5");
            } else {
                legendItem
                    .append("rect")
                    .attr("width", 12)
                    .attr("height", 12)
                    .attr("fill", item.color)
                    .attr("rx", 2);
            }

            legendItem
                .append("text")
                .attr("x", item.dashed ? 25 : 18)
                .attr("y", 9)
                .style("font-size", "11px")
                .style("fill", "#6b7280")
                .text(item.label);
        });
    }

    // Add brush functionality
    const brush = d3
        .brushX()
        .extent([
            [0, 0],
            [
                width - margin.left - margin.right,
                height - margin.top - margin.bottom,
            ],
        ])
        .on("end", function (event) {
            if (!event.selection) {
                // No selection, clear filter
                emit("brush-select", null);
                return;
            }

            // Get the selected date range
            const [x0, x1] = event.selection;
            const dateRange = [x.invert(x0), x.invert(x1)];

            // Emit the selected range
            emit("brush-select", {
                start: dateRange[0],
                end: dateRange[1],
            });
        });

    // Add brush area with lower opacity
    const brushGroup = g
        .append("g")
        .attr("class", "brush")
        .style("opacity", 0.3)
        .call(brush);

    // Style the brush selection
    brushGroup
        .selectAll(".selection")
        .style("fill", "#8B5CF6")
        .style("fill-opacity", 0.3)
        .style("stroke", "#8B5CF6")
        .style("stroke-width", 1);
};

// Use resize composable
useD3Resize(chartContainer, drawChart, 150);

// Redraw when props change
watch(
    () => [
        props.data,
        props.timeRange,
        props.color,
        props.showVotes,
        props.showMovingAverage,
    ],
    () => {
        drawChart();
    }
);

// Cleanup tooltips on unmount
onUnmounted(() => {
    d3.select("body").selectAll(".d3-tooltip").remove();
});

defineExpose({
    redraw: drawChart,
});
</script>

<style scoped>
.trend-chart-container {
    position: relative;
    width: 100%;
}

:deep(.grid line) {
    stroke: #e5e7eb;
}

:deep(.grid path) {
    stroke-width: 0;
}

:deep(.dot-created) {
    cursor: pointer;
    transition: r 0.2s ease;
}

:deep(.dot-created:hover) {
    r: 6;
}
</style>
