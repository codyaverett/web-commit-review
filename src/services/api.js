// Mock API for ideas with localStorage
import seed from "../assets/ideas.json";
import { v4 as uuid } from "uuid";
const LS_IDEAS = "pv_ideas";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const read = () => {
    try {
        const r = localStorage.getItem(LS_IDEAS);
        return r ? JSON.parse(r) : null;
    } catch {
        return null;
    }
};
const write = (v) => localStorage.setItem(LS_IDEAS, JSON.stringify(v));
(() => {
    if (!read()) write(seed);
})();

// Force reset to seed data (useful for development)
export function resetToSeed() {
    write(seed);
    return seed;
}
export async function listIdeas() {
    await sleep(300);
    return read() || [];
}
export async function createIdea(p) {
    await sleep(250);
    const ideas = read() || [];
    const it = {
        id: uuid(),
        votes: 0,
        createdAt: new Date().toISOString(),
        ...p,
    };
    ideas.unshift(it);
    write(ideas);
    return it;
}
export async function updateIdea(id, patch) {
    await sleep(250);
    const ideas = read() || [];
    const i = ideas.findIndex((x) => x.id === id);
    if (i < 0) throw new Error("not found");
    ideas[i] = { ...ideas[i], ...patch };
    write(ideas);
    return ideas[i];
}
export async function deleteIdea(id) {
    await sleep(200);
    write((read() || []).filter((x) => x.id !== id));
    return { id };
}
export async function upvote(id) {
    await sleep(150);
    const ideas = read() || [];
    const i = ideas.findIndex((x) => x.id === id);
    if (i < 0) throw new Error("not found");
    ideas[i].votes = (ideas[i].votes || 0) + 1;
    write(ideas);
    return { id, votes: ideas[i].votes };
}
