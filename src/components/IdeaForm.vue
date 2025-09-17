<template>
    <Dialog
        v-model:visible="visible"
        modal
        :header="props.value?.id ? 'Edit Idea' : 'New Idea'"
        :style="{ width: '45rem' }"
        :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
        class="idea-form-dialog"
    >
        <form class="idea-form" @submit.prevent="save">
            <!-- Title Field -->
            <div class="field">
                <label for="idea-title" class="field-label">
                    Title <span class="required">*</span>
                </label>
                <InputText
                    id="idea-title"
                    v-model="form.title"
                    placeholder="Enter a clear, concise title for your idea"
                    class="w-full"
                    :class="{ 'p-invalid': errors.title }"
                    autofocus
                    @blur="validateTitle"
                />
                <small v-if="errors.title" class="p-error">{{
                    errors.title
                }}</small>
            </div>

            <!-- Description Field -->
            <div class="field">
                <label for="idea-description" class="field-label">
                    Description
                </label>
                <Textarea
                    id="idea-description"
                    v-model="form.description"
                    rows="5"
                    auto-resize
                    placeholder="Describe your idea in detail. What problem does it solve? How would it work?"
                    class="w-full"
                    :max-length="500"
                />
                <small class="text-600">
                    {{ form.description?.length || 0 }}/500 characters
                </small>
            </div>

            <!-- Category and Status Row -->
            <div class="grid">
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="idea-category" class="field-label">
                            Category <span class="required">*</span>
                        </label>
                        <Dropdown
                            id="idea-category"
                            v-model="form.category"
                            :options="categories"
                            placeholder="Select a category"
                            class="w-full"
                            :class="{ 'p-invalid': errors.category }"
                            @blur="validateCategory"
                        >
                            <template #value="slotProps">
                                <div
                                    v-if="slotProps.value"
                                    class="flex align-items-center gap-2"
                                >
                                    <i
                                        :class="
                                            getCategoryIcon(slotProps.value)
                                        "
                                    />
                                    <span>{{ slotProps.value }}</span>
                                </div>
                                <span v-else>{{ slotProps.placeholder }}</span>
                            </template>
                            <template #option="slotProps">
                                <div class="flex align-items-center gap-2">
                                    <i
                                        :class="
                                            getCategoryIcon(slotProps.option)
                                        "
                                    />
                                    <span>{{ slotProps.option }}</span>
                                </div>
                            </template>
                        </Dropdown>
                        <small v-if="errors.category" class="p-error">{{
                            errors.category
                        }}</small>
                    </div>
                </div>
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="idea-status" class="field-label">
                            Status
                        </label>
                        <Dropdown
                            id="idea-status"
                            v-model="form.status"
                            :options="statuses"
                            placeholder="Select status"
                            class="w-full"
                        >
                            <template #value="slotProps">
                                <div
                                    v-if="slotProps.value"
                                    class="flex align-items-center gap-2"
                                >
                                    <span
                                        class="status-indicator"
                                        :class="
                                            'status-' +
                                            slotProps.value
                                                .toLowerCase()
                                                .replace(' ', '-')
                                        "
                                    />
                                    <span>{{ slotProps.value }}</span>
                                </div>
                                <span v-else>{{ slotProps.placeholder }}</span>
                            </template>
                            <template #option="slotProps">
                                <div class="flex align-items-center gap-2">
                                    <span
                                        class="status-indicator"
                                        :class="
                                            'status-' +
                                            slotProps.option
                                                .toLowerCase()
                                                .replace(' ', '-')
                                        "
                                    />
                                    <span>{{ slotProps.option }}</span>
                                </div>
                            </template>
                        </Dropdown>
                    </div>
                </div>
            </div>

            <!-- Tags Field -->
            <div class="field">
                <label for="idea-tags" class="field-label">
                    Tags
                    <small class="text-600 font-normal ml-2"
                        >(Press Enter or comma to add)</small
                    >
                </label>
                <Chips
                    id="idea-tags"
                    v-model="form.tags"
                    separator=","
                    placeholder="Add tags to categorize your idea"
                    class="w-full"
                    :max="10"
                />
                <small class="text-600">
                    Add up to 10 tags to help others find your idea
                </small>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
                <Button
                    label="Cancel"
                    severity="secondary"
                    text
                    @click="close"
                />
                <Button
                    :label="props.value?.id ? 'Update' : 'Submit'"
                    type="submit"
                    :disabled="!isFormValid"
                    icon="pi pi-check"
                />
            </div>
        </form>
    </Dialog>
</template>
<script setup>
import { reactive, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Chips from "primevue/chips";

const props = defineProps({
    modelValue: Boolean,
    value: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const categories = [
    "Platform",
    "UI",
    "Performance",
    "Integrations",
    "Security",
];

const statuses = ["Active", "Under Review", "Implemented"];

const form = reactive({
    title: "",
    description: "",
    category: "",
    status: "Active",
    tags: [],
});

const errors = reactive({
    title: "",
    category: "",
});

// Form validation
const isFormValid = computed(() => {
    return (
        form.title?.trim() && form.category && !errors.title && !errors.category
    );
});

// Validation functions
function validateTitle() {
    if (!form.title?.trim()) {
        errors.title = "Title is required";
    } else if (form.title.length < 3) {
        errors.title = "Title must be at least 3 characters";
    } else if (form.title.length > 100) {
        errors.title = "Title must be less than 100 characters";
    } else {
        errors.title = "";
    }
}

function validateCategory() {
    if (!form.category) {
        errors.category = "Category is required";
    } else {
        errors.category = "";
    }
}

// Helper function to get category icons
function getCategoryIcon(category) {
    const icons = {
        Platform: "pi pi-server",
        UI: "pi pi-palette",
        Performance: "pi pi-bolt",
        Integrations: "pi pi-link",
        Security: "pi pi-shield",
    };
    return icons[category] || "pi pi-tag";
}

// Reset form and errors
function resetForm() {
    Object.assign(form, {
        title: "",
        description: "",
        category: "",
        status: "Active",
        tags: [],
    });
    errors.title = "";
    errors.category = "";
}

watch(
    () => props.value,
    (v) => {
        if (v) {
            Object.assign(form, {
                title: "",
                description: "",
                category: "",
                status: "Active",
                tags: [],
                ...v,
            });
        } else {
            resetForm();
        }
        // Clear errors when form is populated
        errors.title = "";
        errors.category = "";
    },
    { immediate: true }
);

const visible = computed({
    get: () => props.modelValue,
    set: (v) => {
        emit("update:modelValue", v);
        if (!v) {
            // Reset form when closing
            setTimeout(resetForm, 300);
        }
    },
});

function close() {
    visible.value = false;
}

function save() {
    // Validate all fields
    validateTitle();
    validateCategory();

    if (!isFormValid.value) {
        return;
    }

    emit("submit", { ...form });
    close();
}
</script>

<style scoped>
.idea-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field-label {
    font-weight: 600;
    color: var(--text-color);
    font-size: 0.875rem;
    display: block;
}

.required {
    color: var(--red-500);
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--surface-border);
    margin-top: 0.5rem;
}

/* Status indicators */
.status-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.status-active {
    background-color: var(--blue-500);
}

.status-under-review {
    background-color: var(--orange-500);
}

.status-implemented {
    background-color: var(--green-500);
}

/* Input focus styles */
:deep(.p-inputtext:focus),
:deep(.p-textarea:focus),
:deep(.p-dropdown:focus) {
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

/* Error state */
:deep(.p-invalid) {
    border-color: var(--red-500);
}

.p-error {
    color: var(--red-500);
    font-size: 0.75rem;
    margin-top: 0.25rem;
}

/* Chips styling */
:deep(.p-chips) {
    display: flex;
    flex-wrap: wrap;
}

:deep(.p-chips .p-chips-token) {
    background-color: var(--surface-100);
    color: var(--text-color);
    padding: 0.25rem 0.5rem;
    margin: 0.125rem;
    border-radius: 1rem;
}

:deep(.p-chips .p-chips-token-icon) {
    margin-left: 0.5rem;
    cursor: pointer;
}

/* Dialog header styling */
:deep(.p-dialog-header) {
    background: var(--surface-50);
    border-bottom: 1px solid var(--surface-border);
}

/* Responsive adjustments */
@media (max-width: 640px) {
    .idea-form {
        gap: 1rem;
    }

    .form-actions {
        flex-direction: column-reverse;
    }

    .form-actions button {
        width: 100%;
    }
}
</style>
