import { computed } from "vue";

export function useFuzzySearch(items, searchTerm, searchFields) {
    const fuzzyMatch = (str, pattern) => {
        if (!pattern) return true;

        pattern = pattern.toLowerCase();
        str = String(str).toLowerCase();

        let patternIdx = 0;
        let strIdx = 0;
        let matchCount = 0;

        while (strIdx < str.length && patternIdx < pattern.length) {
            if (str[strIdx] === pattern[patternIdx]) {
                patternIdx++;
                matchCount++;
            }
            strIdx++;
        }

        return patternIdx === pattern.length ? matchCount : 0;
    };

    const scoreItem = (item, term) => {
        if (!term) return { item, score: 1 };

        let maxScore = 0;
        const termLower = term.toLowerCase();

        for (const field of searchFields) {
            let value = item;
            const fieldPath = field.split(".");

            for (const key of fieldPath) {
                value = value?.[key];
            }

            if (value === null || value === undefined) continue;

            if (Array.isArray(value)) {
                for (const v of value) {
                    const strValue = String(v).toLowerCase();

                    if (strValue.includes(termLower)) {
                        maxScore = Math.max(maxScore, 100);
                    }

                    const fuzzyScore = fuzzyMatch(v, term);
                    if (fuzzyScore > 0) {
                        maxScore = Math.max(maxScore, fuzzyScore * 10);
                    }
                }
            } else {
                const strValue = String(value).toLowerCase();

                if (strValue === termLower) {
                    maxScore = Math.max(maxScore, 1000);
                } else if (strValue.startsWith(termLower)) {
                    maxScore = Math.max(maxScore, 500);
                } else if (strValue.includes(termLower)) {
                    maxScore = Math.max(maxScore, 100);
                }

                const fuzzyScore = fuzzyMatch(value, term);
                if (fuzzyScore > 0) {
                    maxScore = Math.max(maxScore, fuzzyScore * 10);
                }
            }
        }

        return { item, score: maxScore };
    };

    const filteredItems = computed(() => {
        const term = searchTerm.value?.trim();

        if (!term) {
            return items.value;
        }

        const scored = items.value
            .map((item) => scoreItem(item, term))
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score);

        return scored.map(({ item }) => item);
    });

    return {
        filteredItems,
        fuzzyMatch,
        scoreItem,
    };
}
