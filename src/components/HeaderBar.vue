<template>
    <div class="surface-0 shadow-1">
        <div
            class="container mx-auto px-3 py-2 flex align-items-center justify-content-between"
        >
            <div class="flex align-items-center gap-2">
                <i class="pi pi-comments text-2xl" />
                <router-link
                    to="/dashboard"
                    class="text-xl font-bold text-color no-underline"
                >
                    Ideas
                </router-link>
            </div>
            <div class="flex align-items-center gap-2">
                <router-link
                    to="/dashboard"
                    class="p-button p-component p-button-text"
                    title="Dashboard"
                >
                    <i class="pi pi-chart-bar mobile-icon" />
                    <span class="p-button-label">Dashboard</span>
                </router-link>
                <router-link
                    to="/ideas"
                    class="p-button p-component p-button-text"
                    title="Ideas"
                >
                    <i class="pi pi-list mobile-icon" />
                    <span class="p-button-label">Ideas</span>
                </router-link>
                <router-link
                    to="/submit"
                    class="p-button p-component p-button-text"
                    title="Submit"
                >
                    <i class="pi pi-plus mobile-icon" />
                    <span class="p-button-label">Submit</span>
                </router-link>
                <router-link
                    to="/style-guide"
                    class="p-button p-component p-button-text"
                    title="Style Guide"
                >
                    <i class="pi pi-palette mobile-icon" />
                    <span class="p-button-label">Style Guide</span>
                </router-link>
                <button
                    class="p-button p-component p-button-text p-button-rounded p-button-icon-only theme-toggle"
                    :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
                    @click="toggleTheme"
                >
                    <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" />
                </button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { useTheme } from "../composables/useTheme";

const { isDark, toggleTheme } = useTheme();
</script>
<style scoped>
/* Remove underlines from all links */
a {
    text-decoration: none !important;
}

.p-button {
    text-decoration: none !important;
}

.theme-toggle {
    width: 2.5rem;
    height: 2.5rem;
    transition: all 0.3s ease;
}

.theme-toggle:hover {
    background-color: var(--surface-100);
}

.theme-toggle i {
    font-size: 1.2rem;
    transition: transform 0.3s ease;
}

.theme-toggle:hover i {
    transform: rotate(20deg);
}

/* Hide mobile icons on desktop */
.mobile-icon {
    display: none;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
    .container {
        padding: 0.5rem !important;
    }

    /* Show icons, hide text labels on mobile */
    .mobile-icon {
        display: inline-block;
        font-size: 1.2rem;
    }

    .p-button-label {
        display: none;
    }

    .p-button {
        padding: 0.5rem;
        min-width: auto;
    }

    .theme-toggle {
        width: 2rem;
        height: 2rem;
    }

    .theme-toggle i {
        font-size: 1rem;
    }
}

@media (min-width: 769px) {
    .p-button-label {
        display: inline;
        margin-left: 0.5rem;
    }
}
</style>
