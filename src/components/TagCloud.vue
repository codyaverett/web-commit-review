<template>
    <div
        ref="cloudContainer"
        class="tag-cloud-container"
        :style="{ height: height + 'px' }"
    >
        <div v-if="loading" class="loading-spinner">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import * as d3 from "d3";
import cloud from "d3-cloud";
import { useD3Resize } from "../composables/useD3Resize";

const props = defineProps({
    tags: {
        type: Array,
        default: () => [],
        // Expected shape: [{ text: string, count: number }, ...]
    },
    height: {
        type: Number,
        default: 400,
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
            "#14B8A6",
            "#A855F7",
        ],
    },
    minFontSize: {
        type: Number,
        default: 16,
    },
    maxFontSize: {
        type: Number,
        default: 72,
    },
    padding: {
        type: Number,
        default: 5,
    },
    spiral: {
        type: String,
        default: "archimedean", // or 'rectangular'
    },
    rotations: {
        type: Number,
        default: 3, // Number of different rotation angles
    },
    clickable: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(["tag-click"]);

const cloudContainer = ref(null);
const loading = ref(false);

const processTagData = () => {
    if (!props.tags || props.tags.length === 0) {
        return [];
    }

    // Find min and max counts for scaling
    const counts = props.tags.map((t) => t.count);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);

    // Create scale for font sizes - responsive to container width
    const container = cloudContainer.value;
    const width = container.clientWidth;
    const isMobile = width < 500;

    // More aggressive font sizes to fill container
    const responsiveMaxFontSize = Math.min(
        props.maxFontSize,
        isMobile
            ? Math.min(32, width / 10)
            : Math.min(props.maxFontSize, width / 8)
    );

    const responsiveMinFontSize = Math.max(
        isMobile ? 12 : 16,
        Math.min(props.minFontSize, responsiveMaxFontSize / 3)
    );

    const fontScale = d3
        .scaleLinear()
        .domain([minCount, maxCount])
        .range([responsiveMinFontSize, responsiveMaxFontSize]);

    return props.tags.map((tag) => ({
        text: tag.text,
        size: fontScale(tag.count),
        count: tag.count,
        originalData: tag,
    }));
};

const drawCloud = () => {
    if (!cloudContainer.value) return;

    loading.value = true;

    // Clear previous cloud
    d3.select(cloudContainer.value).selectAll("*").remove();

    const container = cloudContainer.value;
    const containerRect = container.getBoundingClientRect();
    const availableWidth = Math.min(
        containerRect.width,
        window.innerWidth - 40 // Leave margin for mobile
    );
    const width = availableWidth > 0 ? availableWidth : container.clientWidth;
    const height = Math.min(props.height, window.innerHeight * 0.4);

    // Don't draw if container is too small
    if (width < 100 || height < 100) {
        loading.value = false;
        return;
    }

    const processedTags = processTagData();

    if (processedTags.length === 0) {
        d3.select(cloudContainer.value)
            .append("div")
            .attr("class", "no-tags-message")
            .style("text-align", "center")
            .style("padding-top", `${height / 2 - 20}px`)
            .style("color", "#6b7280")
            .text("No tags available");
        loading.value = false;
        return;
    }

    // Color scale
    const colorScale = d3.scaleOrdinal().range(props.colors);

    // Create tooltip
    const tooltip = d3
        .select(cloudContainer.value)
        .append("div")
        .attr("class", "tag-tooltip")
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

    const draw = (words) => {
        const svg = d3
            .select(cloudContainer.value)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const g = svg
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        g.selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-size", (d) => `${d.size}px`)
            .style("font-family", "system-ui, -apple-system, sans-serif")
            .style("font-weight", "bold")
            .style("fill", (d, i) => colorScale(i))
            .style("cursor", props.clickable ? "pointer" : "default")
            .attr("text-anchor", "middle")
            .attr(
                "transform",
                (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`
            )
            .text((d) => d.text)
            .style("opacity", 0)
            .transition()
            .duration(800)
            .delay((d, i) => i * 20)
            .style("opacity", 1);

        // Add interactivity
        g.selectAll("text")
            .on("mouseover", function (event, d) {
                if (!props.clickable) return;

                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 0.7)
                    .style("font-size", `${d.size * 1.2}px`);

                tooltip.transition().duration(200).style("opacity", 1);

                tooltip.html(`
                    <div style="font-weight: bold; margin-bottom: 4px;">${d.text}</div>
                    <div>Count: ${d.count}</div>
                    <div style="font-size: 10px; margin-top: 4px; opacity: 0.8;">Click to filter</div>
                `);

                // Position tooltip based on mouse position
                const rect = cloudContainer.value.getBoundingClientRect();
                tooltip
                    .style("left", event.clientX - rect.left + 10 + "px")
                    .style("top", event.clientY - rect.top - 10 + "px");
            })
            .on("mousemove", function (event) {
                if (!props.clickable) return;

                // Update tooltip position as mouse moves
                const rect = cloudContainer.value.getBoundingClientRect();
                tooltip
                    .style("left", event.clientX - rect.left + 10 + "px")
                    .style("top", event.clientY - rect.top - 10 + "px");
            })
            .on("mouseout", function (event, d) {
                if (!props.clickable) return;

                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("font-size", `${d.size}px`);

                tooltip.transition().duration(200).style("opacity", 0);
            })
            .on("click", function (event, d) {
                if (!props.clickable) return;

                // Add click animation
                d3.select(this)
                    .transition()
                    .duration(100)
                    .style("font-size", `${d.size * 0.9}px`)
                    .transition()
                    .duration(100)
                    .style("font-size", `${d.size}px`);

                emit(
                    "tag-click",
                    d.originalData || { text: d.text, count: d.count }
                );
            });

        loading.value = false;
    };

    // Mobile-optimized configuration
    const isMobile = width < 500;
    const mobilePadding = isMobile ? 2 : props.padding;
    const mobileSpiral = isMobile ? "rectangular" : props.spiral;

    // Show more tags to better fill space
    const wordsToProcess = isMobile
        ? processedTags.slice(0, Math.min(20, processedTags.length))
        : processedTags.slice(0, Math.min(40, processedTags.length));

    // Use more of the available container space
    const safeWidth = isMobile ? width - 30 : width - 10;
    const safeHeight = isMobile ? height - 20 : height - 10;

    // Configure and start the word cloud layout
    const layout = cloud()
        .size([Math.max(100, safeWidth), Math.max(100, safeHeight)])
        .words(wordsToProcess)
        .padding(mobilePadding)
        .rotate(() => {
            // Limited rotation for better readability but visual interest
            if (isMobile) return 0;
            const angles = [-30, -15, 0, 15, 30];
            return angles[Math.floor(Math.random() * angles.length)];
        })
        .font("system-ui")
        .fontWeight("bold")
        .fontSize((d) => d.size)
        .spiral(mobileSpiral)
        .on("end", draw);

    layout.start();
};

// Animation for hover effect
const addHoverAnimation = () => {
    const style = document.createElement("style");
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
};

// Use resize composable
useD3Resize(cloudContainer, drawCloud, 200);

// Add hover animation styles once
const addHoverAnimationOnce = (() => {
    let added = false;
    return () => {
        if (!added) {
            addHoverAnimation();
            added = true;
        }
    };
})();

addHoverAnimationOnce();

// Redraw when tags change
watch(
    () => props.tags,
    () => {
        drawCloud();
    },
    { deep: true }
);

defineExpose({
    redraw: drawCloud,
});
</script>

<style scoped>
.tag-cloud-container {
    position: relative;
    width: 100%;
    max-width: 100%;
    background: linear-gradient(
        135deg,
        var(--surface-50) 0%,
        var(--surface-0) 100%
    );
    border-radius: 8px;
    overflow: hidden;
    box-sizing: border-box;
}

.tag-cloud-container svg {
    max-width: 100%;
    width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
    overflow: hidden;
}

.loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--primary-color);
}

.no-tags-message {
    font-size: 14px;
    color: #6b7280;
}

:deep(text) {
    transition: all 0.3s ease;
    user-select: none;
}

:deep(text:hover) {
    filter: brightness(1.2);
}

:deep(.tag-tooltip) {
    transition: opacity 0.2s ease;
}

/* Mobile specific styles */
@media (max-width: 400px) {
    .tag-cloud-container {
        padding: 0 5px;
    }

    :deep(.tag-tooltip) {
        font-size: 10px !important;
        padding: 6px 8px !important;
        max-width: 150px;
    }

    :deep(text) {
        pointer-events: all;
    }
}
</style>
