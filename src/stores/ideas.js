import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
    listIdeas,
    createIdea,
    updateIdea,
    deleteIdea,
    upvote,
} from "../services/api";

export const useIdeasStore = defineStore("ideas", () => {
    const items = ref([]);
    const loading = ref(false);
    const error = ref(null);
    async function refresh() {
        loading.value = true;
        error.value = null;
        try {
            items.value = await listIdeas();
        } catch (e) {
            error.value = e?.message || "Failed to load ideas";
        } finally {
            loading.value = false;
        }
    }
    async function add(p) {
        await createIdea(p);
        await refresh();
    }
    async function patch(id, p) {
        await updateIdea(id, p);
        await refresh();
    }
    async function remove(id) {
        await deleteIdea(id);
        await refresh();
    }
    async function upvoteIdea(id) {
        await upvote(id);
        const it = items.value.find((i) => i.id === id);
        if (it) it.votes = (it.votes || 0) + 1;
    }
    const stats = computed(() => {
        const byStatus = items.value.reduce((a, i) => {
            a[i.status] = (a[i.status] || 0) + 1;
            return a;
        }, {});
        const total = items.value.length;
        const mostVoted =
            items.value
                .slice()
                .sort((a, b) => (b.votes || 0) - (a.votes || 0))[0] || null;
        return { total, byStatus, mostVoted };
    });
    return {
        items,
        loading,
        error,
        refresh,
        add,
        patch,
        remove,
        upvoteIdea,
        stats,
    };
});
