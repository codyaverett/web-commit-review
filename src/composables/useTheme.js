import { ref, computed, onMounted } from "vue";

const THEME_KEY = "app-theme";
const LIGHT_THEME = "saga-blue";
const DARK_THEME = "arya-blue";

const currentTheme = ref("light");

export function useTheme() {
    const isDark = computed(() => currentTheme.value === "dark");

    const loadTheme = (themeName) => {
        // Remove any existing theme link
        const existingLink = document.getElementById("theme-link");
        if (existingLink) {
            existingLink.remove();
        }

        // Create new theme link
        const link = document.createElement("link");
        link.id = "theme-link";
        link.rel = "stylesheet";
        link.href = `/node_modules/primevue/resources/themes/${themeName}/theme.css`;
        document.head.appendChild(link);

        // Apply theme class to document root
        if (themeName === DARK_THEME) {
            document.documentElement.classList.add("dark-theme");
            document.documentElement.classList.remove("light-theme");
        } else {
            document.documentElement.classList.add("light-theme");
            document.documentElement.classList.remove("dark-theme");
        }
    };

    const toggleTheme = () => {
        currentTheme.value = isDark.value ? "light" : "dark";
        const themeName = isDark.value ? DARK_THEME : LIGHT_THEME;
        loadTheme(themeName);
        localStorage.setItem(THEME_KEY, currentTheme.value);
    };

    const initTheme = () => {
        // Check localStorage first
        const savedTheme = localStorage.getItem(THEME_KEY);

        if (savedTheme) {
            currentTheme.value = savedTheme;
        } else {
            // Check system preference
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;
            currentTheme.value = prefersDark ? "dark" : "light";
        }

        const themeName =
            currentTheme.value === "dark" ? DARK_THEME : LIGHT_THEME;
        loadTheme(themeName);
    };

    // Listen for system theme changes
    onMounted(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e) => {
            // Only apply system preference if no saved preference
            if (!localStorage.getItem(THEME_KEY)) {
                currentTheme.value = e.matches ? "dark" : "light";
                const themeName = e.matches ? DARK_THEME : LIGHT_THEME;
                loadTheme(themeName);
            }
        };

        mediaQuery.addEventListener("change", handleChange);

        // Initialize theme on mount
        initTheme();

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    });

    return {
        currentTheme,
        isDark,
        toggleTheme,
        initTheme,
    };
}
