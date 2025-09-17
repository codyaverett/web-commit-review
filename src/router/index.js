import { createRouter, createWebHistory } from "vue-router";

const routes = [
    { path: "/", redirect: "/dashboard" },
    { path: "/submit", component: () => import("../pages/Submit.vue") },
    { path: "/dashboard", component: () => import("../pages/Dashboard.vue") },
    { path: "/ideas", component: () => import("../pages/Ideas.vue") },
    {
        path: "/style-guide",
        component: () => import("../pages/StyleGuide.vue"),
    },
];

export default createRouter({ history: createWebHistory(), routes });
