import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import process from "node:process";

export default defineConfig({
    plugins: [vue()],
    base:
        process.env.NODE_ENV === "production"
            ? "/vue-primevue-feedback-project/"
            : "/",
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
