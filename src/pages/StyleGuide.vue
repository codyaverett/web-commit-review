<template>
    <div class="style-guide">
        <div class="surface-card p-4 border-round shadow-1 mb-4">
            <h1 class="mt-0 mb-3">Style Guide</h1>
            <p class="text-600 mb-0">
                A comprehensive showcase of all UI components and design
                patterns used in the application.
            </p>
        </div>

        <!-- Colors Section -->
        <div class="surface-card p-4 border-round shadow-1 mb-4">
            <h2 class="mt-0 mb-4">Color Palette</h2>
            <div class="grid">
                <div
                    v-for="color in colors"
                    :key="color.name"
                    class="col-12 md:col-6 lg:col-3"
                >
                    <div
                        class="p-3 border-round-lg text-center"
                        :class="color.bgClass"
                    >
                        <div class="text-2xl mb-2" :class="color.textClass">
                            <i :class="color.icon" />
                        </div>
                        <div class="font-semibold" :class="color.textClass">
                            {{ color.label }}
                        </div>
                        <div
                            class="text-sm opacity-70"
                            :class="color.textClass"
                        >
                            {{ color.name }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Typography Section -->
        <div class="surface-card p-4 border-round shadow-1 mb-4">
            <h2 class="mt-0 mb-4">Typography</h2>
            <div class="grid">
                <div class="col-12">
                    <h1>Heading 1 - Main Page Title</h1>
                    <h2>Heading 2 - Section Title</h2>
                    <h3>Heading 3 - Subsection Title</h3>
                    <h4>Heading 4 - Card Title</h4>
                    <h5>Heading 5 - Small Title</h5>
                    <h6>Heading 6 - Smallest Title</h6>
                    <p class="text-xl">
                        Extra Large Text - For important callouts
                    </p>
                    <p class="text-lg">Large Text - For emphasis</p>
                    <p>Regular paragraph text - Default body text size</p>
                    <p class="text-sm">
                        Small text - For secondary information
                    </p>
                    <p class="text-xs">Extra small text - For metadata</p>
                </div>
            </div>
        </div>

        <!-- Buttons Section -->
        <div class="surface-card p-4 border-round shadow-1 mb-4">
            <h2 class="mt-0 mb-4">Buttons</h2>

            <h4>Standard Buttons</h4>
            <div class="flex flex-wrap gap-2 mb-4">
                <Button label="Primary" />
                <Button label="Secondary" severity="secondary" />
                <Button label="Success" severity="success" />
                <Button label="Info" severity="info" />
                <Button label="Warning" severity="warning" />
                <Button label="Danger" severity="danger" />
                <Button label="Help" severity="help" />
                <Button label="Text" text />
                <Button label="Link" link />
            </div>

            <h4>Button Variants</h4>
            <div class="flex flex-wrap gap-2 mb-4">
                <Button label="Raised" raised />
                <Button label="Rounded" rounded />
                <Button label="Outlined" outlined />
                <Button label="Plain" plain />
                <Button label="Text" text />
                <Button label="Small" size="small" />
                <Button label="Large" size="large" />
                <Button label="Disabled" disabled />
                <Button label="Loading" loading />
            </div>

            <h4>Icon Buttons</h4>
            <div class="flex flex-wrap gap-2 mb-4">
                <Button icon="pi pi-check" />
                <Button icon="pi pi-bookmark" rounded />
                <Button icon="pi pi-search" rounded outlined />
                <Button icon="pi pi-user" rounded raised />
                <Button icon="pi pi-sign-out" severity="danger" rounded />
                <Button label="With Icon" icon="pi pi-check" />
                <Button
                    label="Icon Right"
                    icon="pi pi-check"
                    icon-pos="right"
                />
            </div>
        </div>

        <!-- Form Controls Section -->
        <div class="surface-card p-4 border-round shadow-1 mb-4">
            <h2 class="mt-0 mb-4">Form Controls</h2>

            <div class="grid">
                <div class="col-12 md:col-6 lg:col-4">
                    <div class="field">
                        <label for="input1" class="block mb-2"
                            >Input Text</label
                        >
                        <InputText
                            id="input1"
                            v-model="formData.text"
                            placeholder="Enter text..."
                            class="w-full"
                        />
                    </div>
                </div>

                <div class="col-12 md:col-6 lg:col-4">
                    <div class="field">
                        <label for="input2" class="block mb-2"
                            >Input with Icon</label
                        >
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-search" />
                            <InputText
                                v-model="formData.search"
                                placeholder="Search..."
                                class="w-full"
                            />
                        </span>
                    </div>
                </div>

                <div class="col-12 md:col-6 lg:col-4">
                    <div class="field">
                        <label for="dropdown1" class="block mb-2"
                            >Dropdown</label
                        >
                        <Dropdown
                            id="dropdown1"
                            v-model="formData.selectedOption"
                            :options="dropdownOptions"
                            option-label="name"
                            placeholder="Select an option"
                            class="w-full"
                        />
                    </div>
                </div>

                <div class="col-12 md:col-6 lg:col-4">
                    <div class="field">
                        <label for="textarea1" class="block mb-2"
                            >Textarea</label
                        >
                        <Textarea
                            id="textarea1"
                            v-model="formData.description"
                            rows="3"
                            placeholder="Enter description..."
                            class="w-full"
                        />
                    </div>
                </div>

                <div class="col-12 md:col-6 lg:col-4">
                    <div class="field">
                        <label for="chips1" class="block mb-2"
                            >Chips (Tags)</label
                        >
                        <Chips
                            id="chips1"
                            v-model="formData.tags"
                            placeholder="Add tags..."
                            class="w-full"
                        />
                    </div>
                </div>

                <div class="col-12 md:col-6 lg:col-4">
                    <div class="field">
                        <label for="calendar1" class="block mb-2"
                            >Calendar</label
                        >
                        <Calendar
                            id="calendar1"
                            v-model="formData.date"
                            date-format="mm/dd/yy"
                            show-icon
                            class="w-full"
                        />
                    </div>
                </div>

                <div class="col-12 md:col-6">
                    <div class="field">
                        <label class="block mb-2">Radio Buttons</label>
                        <div class="flex flex-wrap gap-3">
                            <div class="flex align-items-center">
                                <RadioButton
                                    v-model="formData.radioValue"
                                    input-id="radio1"
                                    value="opt1"
                                />
                                <label for="radio1" class="ml-2"
                                    >Option 1</label
                                >
                            </div>
                            <div class="flex align-items-center">
                                <RadioButton
                                    v-model="formData.radioValue"
                                    input-id="radio2"
                                    value="opt2"
                                />
                                <label for="radio2" class="ml-2"
                                    >Option 2</label
                                >
                            </div>
                            <div class="flex align-items-center">
                                <RadioButton
                                    v-model="formData.radioValue"
                                    input-id="radio3"
                                    value="opt3"
                                />
                                <label for="radio3" class="ml-2"
                                    >Option 3</label
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 md:col-6">
                    <div class="field">
                        <label class="block mb-2">Checkboxes</label>
                        <div class="flex flex-wrap gap-3">
                            <div class="flex align-items-center">
                                <Checkbox
                                    v-model="formData.checkValues"
                                    input-id="check1"
                                    value="val1"
                                />
                                <label for="check1" class="ml-2">Check 1</label>
                            </div>
                            <div class="flex align-items-center">
                                <Checkbox
                                    v-model="formData.checkValues"
                                    input-id="check2"
                                    value="val2"
                                />
                                <label for="check2" class="ml-2">Check 2</label>
                            </div>
                            <div class="flex align-items-center">
                                <Checkbox
                                    v-model="formData.checkValues"
                                    input-id="check3"
                                    value="val3"
                                />
                                <label for="check3" class="ml-2">Check 3</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Badges and Tags Section -->
        <div class="surface-card p-4 border-round shadow-1 mb-4">
            <h2 class="mt-0 mb-4">Badges & Tags</h2>

            <h4>Status Badges</h4>
            <div class="flex flex-wrap gap-2 mb-4">
                <Tag value="Default" />
                <Tag severity="success" value="Success" />
                <Tag severity="info" value="Info" />
                <Tag severity="warning" value="Warning" />
                <Tag severity="danger" value="Danger" />
                <Tag severity="secondary" value="Secondary" />
            </div>

            <h4>Badge Variants</h4>
            <div class="flex flex-wrap gap-2 mb-4">
                <Tag value="Rounded" rounded />
                <Tag value="With Icon" icon="pi pi-user" />
                <Tag value="Icon Right" icon="pi pi-check" icon-pos="right" />
                <Badge value="2" />
                <Badge value="8+" severity="danger" />
                <Badge value="New" severity="success" />
            </div>
        </div>

        <!-- Cards Section -->
        <div class="surface-card p-4 border-round shadow-1 mb-4">
            <h2 class="mt-0 mb-4">Cards</h2>

            <div class="grid">
                <div class="col-12 md:col-6 lg:col-4">
                    <Card>
                        <template #header>
                            <div class="bg-primary-100 p-4 text-center">
                                <i class="pi pi-star text-4xl text-primary" />
                            </div>
                        </template>
                        <template #title> Card Title </template>
                        <template #subtitle> Card Subtitle </template>
                        <template #content>
                            <p>
                                This is the card content. It can contain any
                                information you want to display.
                            </p>
                        </template>
                        <template #footer>
                            <div class="flex gap-2">
                                <Button label="Action" size="small" />
                                <Button label="Cancel" size="small" outlined />
                            </div>
                        </template>
                    </Card>
                </div>

                <div class="col-12 md:col-6 lg:col-4">
                    <Card class="border-primary">
                        <template #title> Bordered Card </template>
                        <template #content>
                            <p>
                                This card has a custom border color to highlight
                                important content.
                            </p>
                            <div class="flex gap-2 mt-3">
                                <Tag value="Important" severity="warning" />
                                <Tag value="Featured" severity="info" />
                            </div>
                        </template>
                    </Card>
                </div>

                <div class="col-12 md:col-6 lg:col-4">
                    <Card class="surface-ground">
                        <template #title> Alternative Background </template>
                        <template #content>
                            <p>
                                Cards can have different background colors for
                                visual hierarchy.
                            </p>
                            <ProgressBar :value="65" class="mt-3" />
                        </template>
                    </Card>
                </div>
            </div>
        </div>

        <!-- Messages and Alerts Section -->
        <div class="surface-card p-4 border-round shadow-1 mb-4">
            <h2 class="mt-0 mb-4">Messages & Alerts</h2>

            <div class="grid">
                <div class="col-12">
                    <Message severity="success" :closable="false">
                        Success message example
                    </Message>
                </div>
                <div class="col-12">
                    <Message severity="info" :closable="false">
                        Info message example
                    </Message>
                </div>
                <div class="col-12">
                    <Message severity="warn" :closable="false">
                        Warning message example
                    </Message>
                </div>
                <div class="col-12">
                    <Message severity="error" :closable="false">
                        Error message example
                    </Message>
                </div>
            </div>
        </div>

        <!-- Loading States Section -->
        <div class="surface-card p-4 border-round shadow-1 mb-4">
            <h2 class="mt-0 mb-4">Loading States</h2>

            <div class="grid">
                <div class="col-12 md:col-6 lg:col-3">
                    <div class="text-center p-4">
                        <ProgressSpinner />
                        <p class="mt-3">Default Spinner</p>
                    </div>
                </div>

                <div class="col-12 md:col-6 lg:col-3">
                    <div class="text-center p-4">
                        <ProgressSpinner
                            style="width: 50px; height: 50px"
                            stroke-width="8"
                            animation-duration=".5s"
                        />
                        <p class="mt-3">Custom Spinner</p>
                    </div>
                </div>

                <div class="col-12 md:col-6">
                    <div class="p-4">
                        <p class="mb-2">Determinate Progress</p>
                        <ProgressBar :value="progressValue" />
                        <p class="mb-2 mt-3">Indeterminate Progress</p>
                        <ProgressBar mode="indeterminate" style="height: 6px" />
                    </div>
                </div>
            </div>

            <div class="grid mt-3">
                <div class="col-12">
                    <h4>Skeleton Loading</h4>
                    <div class="surface-ground p-3 border-round">
                        <div class="flex mb-3">
                            <Skeleton shape="circle" size="4rem" class="mr-2" />
                            <div class="flex-1">
                                <Skeleton width="10rem" class="mb-2" />
                                <Skeleton width="5rem" />
                            </div>
                        </div>
                        <Skeleton class="mb-2" />
                        <Skeleton class="mb-2" />
                        <Skeleton width="30%" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Icons Section -->
        <div class="surface-card p-4 border-round shadow-1 mb-4">
            <h2 class="mt-0 mb-4">Icons</h2>
            <p class="text-600 mb-3">
                Common icons used throughout the application
            </p>

            <div class="grid text-center">
                <div
                    v-for="icon in commonIcons"
                    :key="icon"
                    class="col-6 md:col-3 lg:col-2 p-3"
                >
                    <div class="surface-ground border-round p-3">
                        <i :class="`pi ${icon} text-2xl mb-2`" />
                        <div class="text-xs">
                            {{ icon }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import Chips from "primevue/chips";
import Calendar from "primevue/calendar";
import RadioButton from "primevue/radiobutton";
import Checkbox from "primevue/checkbox";
import Tag from "primevue/tag";
import Badge from "primevue/badge";
import Card from "primevue/card";
import Message from "primevue/message";
import ProgressBar from "primevue/progressbar";
import ProgressSpinner from "primevue/progressspinner";
import Skeleton from "primevue/skeleton";

// Color palette
const colors = ref([
    {
        name: "primary",
        label: "Primary",
        bgClass: "bg-primary",
        textClass: "text-white",
        icon: "pi pi-palette",
    },
    {
        name: "success",
        label: "Success",
        bgClass: "bg-green-500",
        textClass: "text-white",
        icon: "pi pi-check-circle",
    },
    {
        name: "warning",
        label: "Warning",
        bgClass: "bg-orange-500",
        textClass: "text-white",
        icon: "pi pi-exclamation-triangle",
    },
    {
        name: "danger",
        label: "Danger",
        bgClass: "bg-red-500",
        textClass: "text-white",
        icon: "pi pi-times-circle",
    },
    {
        name: "info",
        label: "Info",
        bgClass: "bg-blue-500",
        textClass: "text-white",
        icon: "pi pi-info-circle",
    },
    {
        name: "secondary",
        label: "Secondary",
        bgClass: "bg-gray-500",
        textClass: "text-white",
        icon: "pi pi-circle",
    },
    {
        name: "surface",
        label: "Surface",
        bgClass: "surface-card",
        textClass: "text-color",
        icon: "pi pi-box",
    },
    {
        name: "ground",
        label: "Ground",
        bgClass: "surface-ground",
        textClass: "text-color",
        icon: "pi pi-th-large",
    },
]);

// Form data
const formData = ref({
    text: "",
    search: "",
    selectedOption: null,
    description: "",
    tags: [],
    date: null,
    radioValue: "opt1",
    checkValues: ["val1"],
});

// Dropdown options
const dropdownOptions = ref([
    { name: "Option 1", code: "opt1" },
    { name: "Option 2", code: "opt2" },
    { name: "Option 3", code: "opt3" },
]);

// Progress value for animated demo
const progressValue = ref(0);
let progressInterval = null;

// Common icons
const commonIcons = ref([
    "pi-home",
    "pi-user",
    "pi-search",
    "pi-heart",
    "pi-star",
    "pi-bell",
    "pi-envelope",
    "pi-calendar",
    "pi-clock",
    "pi-check",
    "pi-times",
    "pi-plus",
    "pi-minus",
    "pi-pencil",
    "pi-trash",
    "pi-upload",
    "pi-download",
    "pi-refresh",
    "pi-cog",
    "pi-filter",
    "pi-sort",
    "pi-chart-bar",
    "pi-chart-line",
    "pi-globe",
    "pi-lock",
    "pi-unlock",
    "pi-eye",
    "pi-eye-slash",
    "pi-tag",
    "pi-bookmark",
]);

onMounted(() => {
    // Animate progress bar
    progressInterval = setInterval(() => {
        progressValue.value =
            progressValue.value >= 100 ? 0 : progressValue.value + 10;
    }, 800);
});

onUnmounted(() => {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
});
</script>

<style scoped>
.style-guide {
    max-width: 1400px;
    margin: 0 auto;
}

.border-primary {
    border: 2px solid var(--primary-color);
}
</style>
