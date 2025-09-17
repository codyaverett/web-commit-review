<template>
    <div class="app-container surface-ground text-color">
        <Toast />
        <HeaderBar />
        <main class="main-content">
            <router-view v-slot="{ Component }">
                <transition name="page" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>
    </div>
</template>
<script setup>
import { onMounted } from "vue";
import HeaderBar from "./components/HeaderBar.vue";
import { useTheme } from "./composables/useTheme";
import Toast from "./components/Toast.vue";

const { initTheme } = useTheme();

onMounted(() => {
    // Remove preload class after initial load to enable transitions
    document.documentElement.classList.add("preload");
    initTheme();
    setTimeout(() => {
        document.documentElement.classList.remove("preload");
    }, 100);
});
</script>

<style>
.app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    max-width: 100vw;
    overflow-x: hidden;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 100%;
    overflow-x: hidden;
    position: relative;
}

/* Only apply full-height layout to Ideas page */
.main-content > .ideas-page {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Other pages should scroll normally */
.main-content > *:not(.ideas-page) {
    flex: 1;
}

/* Custom toast styles are now handled in the Toast component */
</style>
