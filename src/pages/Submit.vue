<!-- eslint-disable vue/no-template-shadow -->
<template>
    <Form
        ref="formRef"
        v-slot="{ errors: formErrors, meta, values }"
        :initial-values="formInitialValues"
        @submit="onSubmit"
    >
        <span style="display: none">{{ watchFormValues(values) }}</span>
        <!-- Main Form Content -->
        <div class="form-content">
            <div class="surface-card p-3 border-round shadow-1">
                <a
                    href="#form-actions"
                    class="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 bg-primary text-white p-2 border-round"
                    >Skip to form actions</a
                >
                <h2 id="form-title" class="mt-0">Submit Idea</h2>
                <p class="text-600">
                    Complete the form below to submit your idea. All fields
                    marked with * are required.
                </p>

                <!-- Validation Summary -->
                <Message
                    v-if="
                        showValidationSummary && Object.keys(formErrors).length
                    "
                    severity="error"
                    :closable="false"
                    class="mb-3"
                >
                    <ul class="m-0 pl-3">
                        <li v-for="error in formErrors" :key="error">
                            {{ error }}
                        </li>
                    </ul>
                </Message>

                <!-- Success Message removed to avoid duplication with toast -->

                <div class="grid">
                    <!-- Idea Basics Section -->
                    <div id="section-basics" class="col-12 section-panel">
                        <Panel
                            header="Idea Basics"
                            class="section-basics-panel"
                        >
                            <div class="grid">
                                <div class="col-12 lg:col-6">
                                    <Field
                                        v-slot="{
                                            field,
                                            errorMessage,
                                            meta: fieldMeta,
                                        }"
                                        name="title"
                                        :rules="validationRules.title"
                                    >
                                        <label class="block mb-2" for="title"
                                            >Title
                                            <span
                                                class="text-red-500"
                                                aria-label="required"
                                                >*</span
                                            >
                                            <i
                                                v-tooltip.right="
                                                    fieldHelp.title
                                                "
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <InputText
                                            id="title"
                                            v-bind="field"
                                            :class="{
                                                'p-invalid':
                                                    errorMessage &&
                                                    fieldMeta.touched,
                                            }"
                                            class="w-full"
                                            placeholder="Enter a descriptive title"
                                            aria-describedby="title-help"
                                            aria-required="true"
                                            aria-invalid="!!errorMessage && fieldMeta.touched"
                                        />
                                        <small
                                            id="title-help"
                                            class="text-600 block mt-1"
                                            >Choose a clear, concise title
                                            (3-100 characters)</small
                                        >
                                        <small
                                            v-if="
                                                errorMessage &&
                                                fieldMeta.touched
                                            "
                                            class="p-error block mt-1"
                                            role="alert"
                                        >
                                            {{ errorMessage }}
                                        </small>
                                    </Field>
                                </div>
                                <div class="col-12 lg:col-6">
                                    <Field
                                        v-slot="{
                                            errorMessage,
                                            meta: fieldMeta,
                                            value,
                                            handleChange,
                                        }"
                                        name="category"
                                        :rules="validationRules.category"
                                    >
                                        <label class="block mb-2" for="category"
                                            >Category
                                            <span
                                                class="text-red-500"
                                                aria-label="required"
                                                >*</span
                                            >
                                            <i
                                                v-tooltip.right="
                                                    fieldHelp.category
                                                "
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <Dropdown
                                            id="category"
                                            :model-value="value"
                                            :options="categories"
                                            placeholder="Select a category"
                                            :class="{
                                                'p-invalid':
                                                    errorMessage &&
                                                    fieldMeta.touched,
                                            }"
                                            class="w-full"
                                            aria-describedby="category-help"
                                            aria-required="true"
                                            aria-invalid="!!errorMessage && fieldMeta.touched"
                                            @update:model-value="handleChange"
                                        />
                                        <small
                                            id="category-help"
                                            class="text-600 block mt-1"
                                            >Select the category that best fits
                                            your idea</small
                                        >
                                        <small
                                            v-if="
                                                errorMessage &&
                                                fieldMeta.touched
                                            "
                                            class="p-error block mt-1"
                                            role="alert"
                                        >
                                            {{ errorMessage }}
                                        </small>
                                    </Field>
                                </div>
                                <div class="col-12">
                                    <Field
                                        v-slot="{
                                            field,
                                            errorMessage,
                                            meta: fieldMeta,
                                        }"
                                        name="description"
                                        :rules="validationRules.description"
                                    >
                                        <label class="block mb-2" for="desc"
                                            >Description
                                            <span
                                                class="text-red-500"
                                                aria-label="required"
                                                >*</span
                                            >
                                            <i
                                                v-tooltip.right="
                                                    fieldHelp.description
                                                "
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <Textarea
                                            id="desc"
                                            v-bind="field"
                                            rows="4"
                                            :auto-resize="true"
                                            :class="{
                                                'p-invalid':
                                                    errorMessage &&
                                                    fieldMeta.touched,
                                            }"
                                            class="w-full"
                                            placeholder="Describe your idea in detail (10-500 characters)"
                                            aria-describedby="desc-help desc-counter"
                                            aria-required="true"
                                            aria-invalid="!!errorMessage && fieldMeta.touched"
                                        />
                                        <div
                                            class="flex justify-content-between"
                                        >
                                            <small
                                                v-if="
                                                    errorMessage &&
                                                    fieldMeta.touched
                                                "
                                                class="p-error block mt-1"
                                            >
                                                {{ errorMessage }}
                                            </small>
                                            <small
                                                id="desc-help"
                                                class="text-600 block mt-1"
                                                >Provide a detailed explanation
                                                of your idea</small
                                            >
                                            <small
                                                id="desc-counter"
                                                class="text-600 mt-1"
                                                aria-live="polite"
                                            >
                                                {{
                                                    field.value?.length || 0
                                                }}/500 characters
                                            </small>
                                        </div>
                                    </Field>
                                </div>
                                <div class="col-12">
                                    <Field
                                        v-slot="{
                                            errorMessage,
                                            meta: fieldMeta,
                                            value,
                                            handleChange,
                                        }"
                                        name="tags"
                                        :rules="validationRules.tags"
                                    >
                                        <label class="block mb-2"
                                            >Tags
                                            <span class="text-red-500">*</span>
                                            <i
                                                v-tooltip.right="fieldHelp.tags"
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <Chips
                                            :model-value="value"
                                            separator=","
                                            :class="{
                                                'p-invalid':
                                                    errorMessage &&
                                                    fieldMeta.touched,
                                            }"
                                            class="w-full"
                                            placeholder="Add tags and press Enter"
                                            @update:model-value="handleChange"
                                        />
                                        <small
                                            v-if="
                                                errorMessage &&
                                                fieldMeta.touched
                                            "
                                            class="p-error block mt-1"
                                        >
                                            {{ errorMessage }}
                                        </small>
                                    </Field>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <!-- Impact & Priority Section -->
                    <div id="section-impact" class="col-12 section-panel">
                        <Panel
                            header="Impact & Priority"
                            class="section-impact-panel"
                        >
                            <div class="grid">
                                <div class="col-12 lg:col-6">
                                    <Field
                                        v-slot="{
                                            errorMessage,
                                            meta: fieldMeta,
                                            value,
                                            handleChange,
                                        }"
                                        name="personas"
                                        :rules="validationRules.personas"
                                    >
                                        <label class="block mb-2"
                                            >Target Personas
                                            <span class="text-red-500">*</span>
                                            <i
                                                v-tooltip.right="
                                                    fieldHelp.personas
                                                "
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <MultiSelect
                                            :model-value="value"
                                            :options="personas"
                                            option-label="label"
                                            display="chip"
                                            placeholder="Select target personas"
                                            :class="{
                                                'p-invalid':
                                                    errorMessage &&
                                                    fieldMeta.touched,
                                            }"
                                            class="w-full"
                                            @update:model-value="handleChange"
                                        />
                                        <small
                                            v-if="
                                                errorMessage &&
                                                fieldMeta.touched
                                            "
                                            class="p-error block mt-1"
                                        >
                                            {{ errorMessage }}
                                        </small>
                                    </Field>
                                </div>
                                <div class="col-12 md:col-6 lg:col-3">
                                    <Field
                                        v-slot="{
                                            errorMessage,
                                            meta: fieldMeta,
                                            value,
                                            handleChange,
                                        }"
                                        name="impact"
                                        :rules="validationRules.impact"
                                    >
                                        <label class="block mb-2"
                                            >Impact Score
                                            <i
                                                v-tooltip.right="
                                                    fieldHelp.impact
                                                "
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <Slider
                                            :model-value="value"
                                            :min="1"
                                            :max="10"
                                            :class="{
                                                'p-invalid':
                                                    errorMessage &&
                                                    fieldMeta.touched,
                                            }"
                                            @update:model-value="handleChange"
                                        />
                                        <div
                                            class="flex justify-content-between"
                                        >
                                            <small class="text-600">
                                                Score: {{ value || 5 }}
                                            </small>
                                            <small
                                                v-if="
                                                    errorMessage &&
                                                    fieldMeta.touched
                                                "
                                                class="p-error"
                                            >
                                                {{ errorMessage }}
                                            </small>
                                        </div>
                                    </Field>
                                </div>
                                <div class="col-12 md:col-6 lg:col-3">
                                    <Field
                                        v-slot="{
                                            errorMessage,
                                            meta: fieldMeta,
                                            value,
                                            handleChange,
                                        }"
                                        name="reach"
                                        :rules="validationRules.reach"
                                    >
                                        <label class="block mb-2"
                                            >Expected Reach
                                            <i
                                                v-tooltip.right="
                                                    fieldHelp.reach
                                                "
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <InputNumber
                                            :model-value="value"
                                            :min="1"
                                            :step="100"
                                            mode="decimal"
                                            placeholder="Number of users"
                                            :class="{
                                                'p-invalid':
                                                    errorMessage &&
                                                    fieldMeta.touched,
                                            }"
                                            class="w-full"
                                            @update:model-value="handleChange"
                                        />
                                        <small
                                            v-if="
                                                errorMessage &&
                                                fieldMeta.touched
                                            "
                                            class="p-error block mt-1"
                                        >
                                            {{ errorMessage }}
                                        </small>
                                    </Field>
                                </div>
                                <div class="col-12 md:col-6 lg:col-3">
                                    <Field
                                        v-slot="{
                                            errorMessage,
                                            meta: fieldMeta,
                                            value,
                                            handleChange,
                                        }"
                                        name="targetDate"
                                        :rules="validationRules.targetDate"
                                    >
                                        <label class="block mb-2"
                                            >Target Date
                                            <i
                                                v-tooltip.right="
                                                    fieldHelp.targetDate
                                                "
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <Calendar
                                            :model-value="value"
                                            :show-icon="true"
                                            :min-date="new Date()"
                                            date-format="mm/dd/yy"
                                            placeholder="Select target date"
                                            :class="{
                                                'p-invalid':
                                                    errorMessage &&
                                                    fieldMeta.touched,
                                            }"
                                            class="w-full"
                                            @update:model-value="handleChange"
                                        />
                                        <small
                                            v-if="
                                                errorMessage &&
                                                fieldMeta.touched
                                            "
                                            class="p-error block mt-1"
                                        >
                                            {{ errorMessage }}
                                        </small>
                                    </Field>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <!-- Technical Section -->
                    <div id="section-technical" class="col-12 section-panel">
                        <Panel
                            header="Technical Details"
                            class="section-technical-panel"
                        >
                            <div class="grid">
                                <div class="col-12 md:col-6 lg:col-4">
                                    <Field
                                        v-slot="{
                                            errorMessage,
                                            meta: fieldMeta,
                                            value,
                                            handleChange,
                                        }"
                                        name="complexity"
                                        :rules="validationRules.complexity"
                                    >
                                        <label class="block mb-2"
                                            >Complexity
                                            <span class="text-red-500">*</span>
                                            <i
                                                v-tooltip.right="
                                                    fieldHelp.complexity
                                                "
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <Dropdown
                                            :model-value="value"
                                            :options="complexityOptions"
                                            placeholder="Select complexity"
                                            :class="{
                                                'p-invalid':
                                                    errorMessage &&
                                                    fieldMeta.touched,
                                            }"
                                            class="w-full"
                                            @update:model-value="handleChange"
                                        />
                                        <small
                                            v-if="
                                                errorMessage &&
                                                fieldMeta.touched
                                            "
                                            class="p-error block mt-1"
                                        >
                                            {{ errorMessage }}
                                        </small>
                                    </Field>
                                </div>
                                <div class="col-12 md:col-6 lg:col-4">
                                    <Field
                                        v-slot="{ value, handleChange }"
                                        name="dependencies"
                                    >
                                        <label class="block mb-2"
                                            >Dependencies
                                            <i
                                                v-tooltip.right="
                                                    fieldHelp.dependencies
                                                "
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <Chips
                                            :model-value="value"
                                            separator=","
                                            placeholder="Add dependencies"
                                            class="w-full"
                                            @update:model-value="handleChange"
                                        />
                                    </Field>
                                </div>
                                <div class="col-12 md:col-6 lg:col-4">
                                    <Field
                                        v-slot="{
                                            field,
                                            errorMessage,
                                            meta: fieldMeta,
                                        }"
                                        name="repoUrl"
                                        :rules="validationRules.repoUrl"
                                    >
                                        <label class="block mb-2" for="repo"
                                            >Repository URL
                                            <i
                                                v-tooltip.right="
                                                    fieldHelp.repoUrl
                                                "
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <InputText
                                            id="repo"
                                            v-bind="field"
                                            placeholder="https://github.com/org/repo"
                                            :class="{
                                                'p-invalid':
                                                    errorMessage &&
                                                    fieldMeta.touched,
                                            }"
                                            class="w-full"
                                        />
                                        <small
                                            v-if="
                                                errorMessage &&
                                                fieldMeta.touched
                                            "
                                            class="p-error block mt-1"
                                        >
                                            {{ errorMessage }}
                                        </small>
                                    </Field>
                                </div>
                                <div class="col-12">
                                    <Field
                                        v-slot="{ value, handleChange }"
                                        name="privacy"
                                        :rules="validationRules.privacy"
                                    >
                                        <label class="block mb-2"
                                            >Privacy Setting
                                            <i
                                                v-tooltip.right="
                                                    fieldHelp.privacy
                                                "
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <div class="flex gap-3">
                                            <div
                                                class="flex align-items-center gap-2"
                                            >
                                                <RadioButton
                                                    :model-value="value"
                                                    input-id="privacy1"
                                                    name="privacy"
                                                    value="public"
                                                    @update:model-value="
                                                        handleChange
                                                    "
                                                />
                                                <label for="privacy1"
                                                    >Public</label
                                                >
                                            </div>
                                            <div
                                                class="flex align-items-center gap-2"
                                            >
                                                <RadioButton
                                                    :model-value="value"
                                                    input-id="privacy2"
                                                    name="privacy"
                                                    value="internal"
                                                    @update:model-value="
                                                        handleChange
                                                    "
                                                />
                                                <label for="privacy2"
                                                    >Internal</label
                                                >
                                            </div>
                                            <div
                                                class="flex align-items-center gap-2"
                                            >
                                                <RadioButton
                                                    :model-value="value"
                                                    input-id="privacy3"
                                                    name="privacy"
                                                    value="private"
                                                    @update:model-value="
                                                        handleChange
                                                    "
                                                />
                                                <label for="privacy3"
                                                    >Private</label
                                                >
                                            </div>
                                        </div>
                                    </Field>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <!-- Contact & Meta Section -->
                    <div id="section-contact" class="col-12 section-panel">
                        <Panel
                            header="Contact Information"
                            class="section-contact-panel"
                        >
                            <div class="grid">
                                <div class="col-12 md:col-6 lg:col-4">
                                    <Field
                                        v-slot="{
                                            field,
                                            errorMessage,
                                            meta: fieldMeta,
                                        }"
                                        name="requesterName"
                                        :rules="validationRules.requesterName"
                                    >
                                        <label class="block mb-2" for="name"
                                            >Your Name
                                            <span class="text-red-500">*</span>
                                            <i
                                                v-tooltip.right="
                                                    fieldHelp.requesterName
                                                "
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <InputText
                                            id="name"
                                            v-bind="field"
                                            placeholder="John Doe"
                                            :class="{
                                                'p-invalid':
                                                    errorMessage &&
                                                    fieldMeta.touched,
                                            }"
                                            class="w-full"
                                        />
                                        <small
                                            v-if="
                                                errorMessage &&
                                                fieldMeta.touched
                                            "
                                            class="p-error block mt-1"
                                        >
                                            {{ errorMessage }}
                                        </small>
                                    </Field>
                                </div>
                                <div class="col-12 md:col-6 lg:col-4">
                                    <Field
                                        v-slot="{
                                            field,
                                            errorMessage,
                                            meta: fieldMeta,
                                        }"
                                        name="requesterEmail"
                                        :rules="validationRules.requesterEmail"
                                    >
                                        <label class="block mb-2" for="email"
                                            >Your Email
                                            <span class="text-red-500">*</span>
                                            <i
                                                v-tooltip.right="
                                                    fieldHelp.requesterEmail
                                                "
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <InputText
                                            id="email"
                                            v-bind="field"
                                            type="email"
                                            placeholder="john@example.com"
                                            :class="{
                                                'p-invalid':
                                                    errorMessage &&
                                                    fieldMeta.touched,
                                            }"
                                            class="w-full"
                                        />
                                        <small
                                            v-if="
                                                errorMessage &&
                                                fieldMeta.touched
                                            "
                                            class="p-error block mt-1"
                                        >
                                            {{ errorMessage }}
                                        </small>
                                    </Field>
                                </div>
                                <div class="col-12 md:col-6 lg:col-4">
                                    <Field
                                        v-slot="{ value, handleChange }"
                                        name="notify"
                                    >
                                        <label class="block mb-2"
                                            >Email Notifications
                                            <i
                                                v-tooltip.right="
                                                    fieldHelp.notify
                                                "
                                                class="pi pi-info-circle ml-2 text-400 cursor-help"
                                        /></label>
                                        <div
                                            class="flex align-items-center h-3rem"
                                        >
                                            <InputSwitch
                                                :model-value="value"
                                                @update:model-value="
                                                    handleChange
                                                "
                                            />
                                            <span class="ml-2 text-600"
                                                >Receive updates about this
                                                idea</span
                                            >
                                        </div>
                                    </Field>
                                </div>
                                <div class="col-12">
                                    <Field
                                        v-slot="{
                                            errorMessage,
                                            value,
                                            handleChange,
                                        }"
                                        name="terms"
                                        :rules="validationRules.terms"
                                    >
                                        <div
                                            class="flex align-items-center gap-2"
                                        >
                                            <Checkbox
                                                :model-value="value"
                                                input-id="terms"
                                                :binary="true"
                                                :class="{
                                                    'p-invalid': errorMessage,
                                                }"
                                                @update:model-value="
                                                    handleChange
                                                "
                                            />
                                            <label for="terms"
                                                >I confirm the information
                                                provided is accurate and I agree
                                                to the terms of service
                                                <span class="text-red-500"
                                                    >*</span
                                                >
                                                <i
                                                    v-tooltip.right="
                                                        fieldHelp.terms
                                                    "
                                                    class="pi pi-info-circle ml-2 text-400 cursor-help"
                                            /></label>
                                        </div>
                                        <small
                                            v-if="errorMessage"
                                            class="p-error block mt-1"
                                        >
                                            {{ errorMessage }}
                                        </small>
                                    </Field>
                                </div>
                            </div>
                        </Panel>
                    </div>
                </div>

                <!-- Spacer for sticky footer -->
                <div class="footer-spacer" />
            </div>
        </div>

        <!-- Sticky Footer with Form Actions -->
        <div id="form-actions" class="sticky-footer">
            <div class="sticky-footer-content">
                <div class="footer-top-row">
                    <!-- Progress Bar with text inside -->
                    <div class="progress-bar-wrapper">
                        <ProgressBar
                            :value="formProgress"
                            :show-value="false"
                            class="custom-progress-bar"
                        />
                        <div class="progress-text-overlay">
                            <span class="font-semibold"
                                >{{ formProgress }}% complete</span
                            >
                            <span class="mx-2">•</span>
                            <span
                                >{{ filledFields }} of
                                {{ totalFields }} fields</span
                            >
                        </div>
                    </div>

                    <!-- Action buttons -->
                    <div class="flex gap-2">
                        <Button
                            label="Clear Form"
                            icon="pi pi-times"
                            severity="secondary"
                            type="button"
                            @click="clearForm"
                        />
                        <Button
                            label="Save Draft"
                            icon="pi pi-save"
                            severity="info"
                            type="button"
                            :disabled="!meta.dirty"
                            @click="() => saveDraft(values)"
                        />
                        <span
                            v-tooltip.top="
                                !meta.valid
                                    ? getMissingFieldsMessage(values)
                                    : ''
                            "
                            class="inline-block"
                        >
                            <Button
                                label="Submit Idea"
                                icon="pi pi-check"
                                type="submit"
                                :loading="isSubmitting"
                                :disabled="!meta.valid || isSubmitting"
                            />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </Form>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { Form, Field } from "vee-validate";
import { useToast } from "../composables/useToast";
import { useIdeasStore } from "../stores/ideas";
import Panel from "primevue/panel";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import Chips from "primevue/chips";
import MultiSelect from "primevue/multiselect";
import Slider from "primevue/slider";
import InputNumber from "primevue/inputnumber";
import Calendar from "primevue/calendar";
import RadioButton from "primevue/radiobutton";
import Checkbox from "primevue/checkbox";
import InputSwitch from "primevue/inputswitch";
import Button from "primevue/button";
import Message from "primevue/message";
import ProgressBar from "primevue/progressbar";

const toast = useToast();
const ideasStore = useIdeasStore();

// Form state
const isSubmitting = ref(false);
const showValidationSummary = ref(false);
const submitSuccess = ref(false);
const autoSaveTimer = ref(null);
const activeSection = ref("basics");

// Section definitions
const sections = [
    {
        id: "basics",
        label: "Idea Basics",
        fields: ["title", "category", "description", "tags"],
    },
    {
        id: "impact",
        label: "Impact & Priority",
        fields: ["personas", "impact", "reach"],
    },
    {
        id: "technical",
        label: "Technical Details",
        fields: ["complexity", "privacy"],
    },
    {
        id: "contact",
        label: "Contact Information",
        fields: ["requesterName", "requesterEmail", "terms"],
    },
];

// Progress tracking computed properties
const totalFields = 9; // Required fields that need user input (excluding those with defaults)

// Use reactive values that will be passed from the Form component
const currentFormValues = ref({});

const filledFields = computed(() => {
    let filled = 0;
    const form = currentFormValues.value;
    const fields = [
        form.title,
        form.category,
        form.description,
        form.tags?.length > 0,
        form.personas?.length > 0,
        form.complexity,
        form.requesterName,
        form.requesterEmail,
        form.terms === true, // Terms checkbox must be checked
    ];
    // Note: impact, reach, and privacy have default values so are not counted
    fields.forEach((field) => {
        if (field) filled++;
    });
    return filled;
});

const formProgress = computed(() => {
    return Math.round((filledFields.value / totalFields) * 100);
});

// Check if section is complete
function isSectionComplete(sectionId, values) {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return false;

    const requiredFields = {
        basics: ["title", "category", "description", "tags"],
        impact: ["personas", "impact", "reach"],
        technical: ["complexity", "privacy"],
        contact: ["requesterName", "requesterEmail", "terms"],
    };

    const fields = requiredFields[sectionId] || [];

    return fields.every((field) => {
        const value = values[field];
        if (field === "tags" || field === "personas") {
            return value && value.length > 0;
        }
        if (field === "terms") {
            return value === true;
        }
        if (field === "title" || field === "description") {
            return value && value.length >= (field === "title" ? 3 : 10);
        }
        if (field === "requesterEmail") {
            return value && isValidEmail(value);
        }
        return value !== null && value !== undefined && value !== "";
    });
}

// Track active section on scroll
onMounted(() => {
    const handleScroll = () => {
        // Handle active section detection
        const scrollPosition = window.scrollY + 100;

        for (const section of sections) {
            const element = document.getElementById(`section-${section.id}`);
            if (element) {
                const { top, bottom } = element.getBoundingClientRect();
                const elementTop = top + window.scrollY;
                const elementBottom = bottom + window.scrollY;

                if (
                    scrollPosition >= elementTop &&
                    scrollPosition <= elementBottom
                ) {
                    activeSection.value = section.id;
                    break;
                }
            }
        }
    };

    window.addEventListener("scroll", handleScroll);

    // Load draft on mount
    const draft = localStorage.getItem("draft_submit_idea");
    if (draft) {
        try {
            const draftData = JSON.parse(draft);
            // Update initial values with draft data
            formInitialValues.value = {
                ...formInitialValues.value,
                ...draftData,
            };

            // If formRef is available, set the values directly
            if (formRef.value) {
                formRef.value.setValues(draftData);
            }

            toast.add({
                severity: "info",
                summary: "Draft Loaded",
                detail: "Your previous draft has been restored.",
                life: 3000,
            });
        } catch (error) {
            console.error("Failed to load draft:", error);
        }
    }

    // Cleanup
    onUnmounted(() => {
        window.removeEventListener("scroll", handleScroll);
        if (autoSaveTimer.value) {
            clearTimeout(autoSaveTimer.value);
        }
    });
});

// Options
const categories = [
    "Platform",
    "UI",
    "Performance",
    "Integrations",
    "Security",
];
const personas = [
    { label: "Admin", value: "admin" },
    { label: "Developer", value: "developer" },
    { label: "Analyst", value: "analyst" },
    { label: "End User", value: "end-user" },
];
const complexityOptions = ["Low", "Medium", "High"];

// Field help content for tooltips (same as original)
const fieldHelp = {
    title: `A concise, descriptive title for your idea.`,
    category: `Select the area most impacted by your idea.`,
    description: `Explain your idea in detail.`,
    tags: `Add keywords to help categorize your idea.`,
    personas: `Select all user groups who will benefit.`,
    impact: `Rate the potential impact (1-10).`,
    reach: `Estimated number of users affected.`,
    targetDate: `When should this be implemented?`,
    complexity: `Technical implementation difficulty.`,
    dependencies: `List any prerequisites or related items.`,
    repoUrl: `Link to relevant code repository.`,
    privacy: `Who can view this idea?`,
    requesterName: `Your full name for follow-up.`,
    requesterEmail: `Valid email for notifications.`,
    notify: `Email notification preferences.`,
    terms: `Agreement to submission terms.`,
};

// Initial form values (reactive for draft loading)
const formInitialValues = ref({
    title: "",
    description: "",
    category: "",
    tags: [],
    personas: [],
    impact: 5,
    reach: 100,
    targetDate: null,
    complexity: "",
    dependencies: [],
    repoUrl: "",
    privacy: "internal",
    requesterName: "",
    requesterEmail: "",
    notify: false,
    terms: false,
});

// Validation rules (same as original)
const validationRules = {
    title: (value) => {
        if (!value) return "Title is required";
        if (value.length < 3) return "Title must be at least 3 characters";
        if (value.length > 100) return "Title must be less than 100 characters";
        return true;
    },
    description: (value) => {
        if (!value) return "Description is required";
        if (value.length < 10)
            return "Description must be at least 10 characters";
        if (value.length > 500)
            return "Description must be less than 500 characters";
        return true;
    },
    category: (value) => {
        if (!value) return "Category is required";
        return true;
    },
    tags: (value) => {
        if (!value || value.length === 0) return "At least one tag is required";
        return true;
    },
    personas: (value) => {
        if (!value || value.length === 0)
            return "At least one persona must be selected";
        return true;
    },
    impact: (value) => {
        if (!value || value < 1 || value > 10)
            return "Impact score must be between 1 and 10";
        return true;
    },
    reach: (value) => {
        if (!value || value < 1) return "Expected reach must be at least 1";
        return true;
    },
    targetDate: (value) => {
        if (value) {
            const date = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date < today) return "Target date must be in the future";
        }
        return true;
    },
    complexity: (value) => {
        if (!value) return "Complexity is required";
        return true;
    },
    repoUrl: (value) => {
        if (value) {
            const urlPattern = /^https?:\/\/.+/;
            if (!urlPattern.test(value)) return "Must be a valid URL";
        }
        return true;
    },
    privacy: (value) => {
        if (!value) return "Privacy setting is required";
        return true;
    },
    requesterName: (value) => {
        if (!value) return "Name is required";
        if (value.length < 2) return "Name must be at least 2 characters";
        if (value.length > 50) return "Name must be less than 50 characters";
        return true;
    },
    requesterEmail: (value) => {
        if (!value) return "Email is required";
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) return "Must be a valid email address";
        return true;
    },
    terms: (value) => {
        if (!value) return "You must accept the terms";
        return true;
    },
};

// Form submission
async function onSubmit(values, { resetForm }) {
    // Prevent double submission
    if (isSubmitting.value) return;

    showValidationSummary.value = true;
    isSubmitting.value = true;

    try {
        // Transform data for API
        const ideaData = {
            title: values.title,
            description: values.description,
            category: values.category,
            tags: values.tags,
            status: "Active",
            personas: values.personas,
            impact: values.impact,
            reach: values.reach,
            targetDate: values.targetDate,
            complexity: values.complexity,
            dependencies: values.dependencies,
            repoUrl: values.repoUrl,
            privacy: values.privacy,
            requester: {
                name: values.requesterName,
                email: values.requesterEmail,
            },
            notify: values.notify,
        };

        await ideasStore.add(ideaData);

        // Clear saved draft
        localStorage.removeItem("draft_submit_idea");

        // Show success with prominent toast (only one)
        toast.add({
            severity: "success",
            summary: "Idea Submitted Successfully!",
            detail: "Your idea has been submitted and will be reviewed by our team. Thank you for your contribution!",
            life: 8000,
        });

        // Don't show the inline message to avoid duplication
        // submitSuccess.value = true;

        // Reset form after a short delay
        setTimeout(() => {
            resetForm();
            showValidationSummary.value = false;
            submitSuccess.value = false;
        }, 3000);
    } catch (error) {
        toast.add({
            severity: "error",
            summary: "Submission Failed",
            detail:
                error.message ||
                "Failed to submit your idea. Please check your connection and try again.",
            life: 6000,
        });
    } finally {
        isSubmitting.value = false;
    }
}

// Form ref for access to form methods
const formRef = ref(null);

// Save draft to localStorage
function saveDraft(values, showToast = true) {
    localStorage.setItem("draft_submit_idea", JSON.stringify(values));
    if (showToast) {
        toast.add({
            severity: "success",
            summary: "Draft Saved",
            detail: "Your draft has been saved locally and will be restored when you return.",
            life: 3000,
        });
    }
}

// Auto-save draft with debounce
function autoSaveDraft(values) {
    if (autoSaveTimer.value) {
        clearTimeout(autoSaveTimer.value);
    }

    if (submitSuccess.value) {
        return;
    }

    autoSaveTimer.value = setTimeout(() => {
        saveDraft(values, false);

        // Show toast notification for auto-save
        toast.add({
            severity: "success",
            summary: "Draft Saved",
            detail: "Your progress has been automatically saved",
            life: 2000,
        });
    }, 10000);
}

// Watch form values for changes
const lastFormValues = ref(null);
function watchFormValues(values) {
    // Update currentFormValues for computed properties
    currentFormValues.value = values;

    if (JSON.stringify(values) !== JSON.stringify(lastFormValues.value)) {
        lastFormValues.value = { ...values };
        autoSaveDraft(values);
    }
    return "";
}

// Get missing required fields message for tooltip
function getMissingFieldsMessage(values) {
    const sections = {};

    // Check each section
    if (!isSectionComplete("basics", values)) {
        sections["Idea Basics"] = [];
        if (!values.title || values.title.length < 3)
            sections["Idea Basics"].push("Title");
        if (!values.category) sections["Idea Basics"].push("Category");
        if (!values.description || values.description.length < 10)
            sections["Idea Basics"].push("Description");
        if (!values.tags || values.tags.length === 0)
            sections["Idea Basics"].push("Tags");
    }

    if (!isSectionComplete("impact", values)) {
        sections["Impact & Priority"] = [];
        if (!values.personas || values.personas.length === 0)
            sections["Impact & Priority"].push("Target Personas");
        if (!values.impact) sections["Impact & Priority"].push("Impact Score");
        if (!values.reach || values.reach < 1)
            sections["Impact & Priority"].push("Expected Reach");
    }

    if (!isSectionComplete("technical", values)) {
        sections["Technical Details"] = [];
        if (!values.complexity)
            sections["Technical Details"].push("Complexity");
        if (!values.privacy)
            sections["Technical Details"].push("Privacy Setting");
    }

    if (!isSectionComplete("contact", values)) {
        sections["Contact Information"] = [];
        if (!values.requesterName || values.requesterName.length < 2)
            sections["Contact Information"].push("Your Name");
        if (!values.requesterEmail || !isValidEmail(values.requesterEmail))
            sections["Contact Information"].push("Your Email");
        if (!values.terms)
            sections["Contact Information"].push("Terms Agreement");
    }

    if (Object.keys(sections).length === 0) {
        return "";
    }

    let message = "Missing required fields:\n\n";
    for (const [section, fields] of Object.entries(sections)) {
        if (fields.length > 0) {
            message += `${section}:\n`;
            fields.forEach((field) => {
                message += `  • ${field}\n`;
            });
            message += "\n";
        }
    }

    return message.trim();
}

// Helper function to validate email
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Clear form
function clearForm() {
    if (
        confirm(
            "Are you sure you want to clear all form data? This cannot be undone."
        )
    ) {
        if (autoSaveTimer.value) {
            clearTimeout(autoSaveTimer.value);
        }

        if (formRef.value) {
            formRef.value.resetForm();
        }
        localStorage.removeItem("draft_submit_idea");
        showValidationSummary.value = false;
        submitSuccess.value = false;

        toast.add({
            severity: "info",
            summary: "Form Cleared",
            detail: "All form data has been cleared.",
            life: 3000,
        });
    }
}
</script>

<style scoped>
/* Footer Layout */
.footer-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}

/* Progress Bar with Text Overlay */
.progress-bar-wrapper {
    position: relative;
    flex: 1;
    min-width: 250px;
    max-width: 400px;
}

.custom-progress-bar {
    height: 32px;
}

.custom-progress-bar :deep(.p-progressbar-value) {
    background: var(--primary-color);
}

.progress-text-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--text-color);
    font-size: 0.875rem;
    white-space: nowrap;
    pointer-events: none;
    text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
    font-weight: 500;
}

/* Responsive text utilities */
.text-sm {
    font-size: 0.875rem;
}

.text-xs {
    font-size: 0.75rem;
}

.text-600 {
    color: var(--text-color-secondary);
}

.text-primary {
    color: var(--primary-color);
}

.font-semibold {
    font-weight: 600;
}

.mx-2 {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
}

.white-space-nowrap {
    white-space: nowrap;
}

/* Hide/show on mobile */
@media (max-width: 576px) {
    .hidden.sm\:inline {
        display: none !important;
    }
    .inline.sm\:hidden {
        display: inline !important;
    }
}

@media (min-width: 577px) {
    .hidden.sm\:inline {
        display: inline !important;
    }
    .inline.sm\:hidden {
        display: none !important;
    }
}

/* Form Content Adjustments */
.form-content {
    padding-bottom: 70px; /* Space for sticky footer */
    padding-top: 0; /* Remove any top padding */
}

.section-panel {
    scroll-margin-top: 60px; /* Account for header */
}

.section-status {
    margin-right: 0.5rem;
}

/* Sticky Footer Styles */
.sticky-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface-card);
    border-top: 1px solid var(--surface-border);
    padding: 1rem;
    z-index: 99;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.sticky-footer-content {
    max-width: 1200px;
    margin: 0 auto;
}

.footer-spacer {
    height: 0px;
}

/* Dark theme adjustments */
.dark-theme .sticky-footer {
    background: var(--surface-card);
    border-top-color: var(--surface-600);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
}

.dark-theme .progress-text-overlay {
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
}

/* Existing styles from original */
.p-invalid {
    border-color: var(--red-500) !important;
}

.p-error {
    color: var(--red-500);
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.sr-only:focus,
.focus\:not-sr-only:focus {
    position: absolute;
    width: auto;
    height: auto;
    padding: 0.5rem;
    margin: 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
}

:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

/* Section Color Coding - Subtle tints */
.section-basics-panel :deep(.p-panel-header) {
    background: linear-gradient(
        135deg,
        rgba(102, 126, 234, 0.1) 0%,
        rgba(118, 75, 162, 0.1) 100%
    );
    border-bottom: 2px solid rgba(102, 126, 234, 0.3);
}

.section-basics-panel :deep(.p-panel-header .p-panel-title) {
    color: #667eea;
    font-weight: 600;
}

.section-impact-panel :deep(.p-panel-header) {
    background: linear-gradient(
        135deg,
        rgba(102, 126, 234, 0.1) 0%,
        rgba(118, 75, 162, 0.1) 100%
    );
    border-bottom: 2px solid rgba(102, 126, 234, 0.3);
}

.section-impact-panel :deep(.p-panel-header .p-panel-title) {
    color: #667eea;
    font-weight: 600;
}

.section-technical-panel :deep(.p-panel-header) {
    background: linear-gradient(
        135deg,
        rgba(102, 126, 234, 0.1) 0%,
        rgba(118, 75, 162, 0.1) 100%
    );
    border-bottom: 2px solid rgba(102, 126, 234, 0.3);
}

.section-technical-panel :deep(.p-panel-header .p-panel-title) {
    color: #667eea;
    font-weight: 600;
}

.section-contact-panel :deep(.p-panel-header) {
    background: linear-gradient(
        135deg,
        rgba(102, 126, 234, 0.1) 0%,
        rgba(118, 75, 162, 0.1) 100%
    );
    border-bottom: 2px solid rgba(102, 126, 234, 0.3);
}

.section-contact-panel :deep(.p-panel-header .p-panel-title) {
    color: #667eea;
    font-weight: 600;
}

/* Dark theme adjustments for section colors */
.dark-theme .section-basics-panel :deep(.p-panel-header) {
    background: linear-gradient(
        135deg,
        rgba(102, 126, 234, 0.15) 0%,
        rgba(118, 75, 162, 0.15) 100%
    );
    border-bottom: 2px solid rgba(102, 126, 234, 0.4);
}

.dark-theme .section-basics-panel :deep(.p-panel-header .p-panel-title) {
    color: #8b9ef0;
}

.dark-theme .section-impact-panel :deep(.p-panel-header) {
    background: linear-gradient(
        135deg,
        rgba(102, 126, 234, 0.15) 0%,
        rgba(118, 75, 162, 0.15) 100%
    );
    border-bottom: 2px solid rgba(102, 126, 234, 0.4);
}

.dark-theme .section-impact-panel :deep(.p-panel-header .p-panel-title) {
    color: #8b9ef0;
}

.dark-theme .section-technical-panel :deep(.p-panel-header) {
    background: linear-gradient(
        135deg,
        rgba(102, 126, 234, 0.15) 0%,
        rgba(118, 75, 162, 0.15) 100%
    );
    border-bottom: 2px solid rgba(102, 126, 234, 0.4);
}

.dark-theme .section-technical-panel :deep(.p-panel-header .p-panel-title) {
    color: #8b9ef0;
}

.dark-theme .section-contact-panel :deep(.p-panel-header) {
    background: linear-gradient(
        135deg,
        rgba(102, 126, 234, 0.15) 0%,
        rgba(118, 75, 162, 0.15) 100%
    );
    border-bottom: 2px solid rgba(102, 126, 234, 0.4);
}

.dark-theme .section-contact-panel :deep(.p-panel-header .p-panel-title) {
    color: #8b9ef0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .progress-steps {
        gap: 0.5rem;
    }

    .step-indicator {
        width: 32px;
        height: 32px;
        font-size: 0.875rem;
    }

    .step-label {
        font-size: 0.75rem;
    }

    .footer-top-row {
        flex-direction: column;
        align-items: stretch;
    }

    .progress-bar-wrapper {
        max-width: 100%;
        width: 100%;
        margin-bottom: 1rem;
    }

    .footer-top-row > div:last-child {
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
    }

    .footer-top-row > div:last-child > button,
    .footer-top-row > div:last-child > span {
        width: 100%;
    }

    .footer-top-row > div:last-child > span > button {
        width: 100%;
    }

    .footer-spacer {
        height: 140px;
    }
}

@media (max-width: 576px) {
    .surface-card {
        padding: 1rem !important;
    }

    .p-panel .p-panel-content {
        padding: 1rem;
    }

    .step-label {
        display: none;
    }

    .progress-tracker-container {
        padding: 0.75rem 0;
    }
}
</style>
