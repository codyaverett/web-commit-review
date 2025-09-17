import { useForm, useField } from "vee-validate";
import {
    required,
    email,
    url,
    min,
    max,
    min_value,
    max_value,
} from "@vee-validate/rules";
import { defineRule, configure } from "vee-validate";

// Register rules
defineRule("required", required);
defineRule("email", email);
defineRule("url", url);
defineRule("min", min);
defineRule("max", max);
defineRule("min_value", min_value);
defineRule("max_value", max_value);

// Custom rules
defineRule("githubUrl", (value) => {
    if (!value || value.length === 0) return true;
    const githubPattern =
        /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubPattern.test(value) || "Must be a valid GitHub repository URL";
});

defineRule("futureDate", (value) => {
    if (!value) return true;
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today || "Date must be in the future";
});

defineRule("atLeastOne", (value) => {
    if (Array.isArray(value)) {
        return value.length > 0 || "Select at least one option";
    }
    return !!value || "This field is required";
});

// Configure error messages
configure({
    generateMessage: (context) => {
        const messages = {
            required: `${context.field} is required`,
            email: `${context.field} must be a valid email`,
            url: `${context.field} must be a valid URL`,
            min: `${context.field} must be at least ${context.rule.params[0]} characters`,
            max: `${context.field} must be no more than ${context.rule.params[0]} characters`,
            min_value: `${context.field} must be at least ${context.rule.params[0]}`,
            max_value: `${context.field} must be no more than ${context.rule.params[0]}`,
            githubUrl: "Must be a valid GitHub repository URL",
            futureDate: "Date must be in the future",
            atLeastOne: "Select at least one option",
        };
        return messages[context.rule.name] || `${context.field} is invalid`;
    },
});

export function useFormValidation() {
    // Define validation schema
    const validationSchema = {
        // Idea Basics
        title: "required|min:3|max:100",
        description: "required|min:10|max:500",
        category: "required",
        tags: "atLeastOne",

        // Impact & Priority
        personas: "atLeastOne",
        impact: "required|min_value:1|max_value:10",
        reach: "required|min_value:1",
        targetDate: "futureDate",

        // Technical
        complexity: "required",
        dependencies: "",
        repoUrl: "url|githubUrl",
        privacy: "required",

        // Contact & Meta
        "requester.name": "required|min:2|max:50",
        "requester.email": "required|email",
        notify: "",
        terms: "required",
    };

    const {
        handleSubmit,
        errors,
        values,
        isSubmitting,
        validate,
        resetForm,
        setFieldError,
        setErrors,
        meta,
    } = useForm({
        validationSchema,
    });

    // Helper to check if form has errors
    const hasErrors = () => {
        return Object.keys(errors.value).some((key) => errors.value[key]);
    };

    // Helper to validate specific field
    const validateField = async (fieldName) => {
        const result = await validate({ mode: "force" });
        return result.errors[fieldName];
    };

    // Helper to get field state
    const getFieldState = (fieldName) => {
        const error = errors.value[fieldName];
        const isDirty = meta.value.dirty;
        const isTouched = meta.value.touched;

        return {
            error,
            isDirty,
            isTouched,
            isValid: !error && (isDirty || isTouched),
        };
    };

    return {
        errors,
        values,
        isSubmitting,
        handleSubmit,
        validate,
        resetForm,
        setFieldError,
        setErrors,
        hasErrors,
        validateField,
        getFieldState,
        useField,
    };
}

// Export helper for field-level validation
export function useFieldValidation(name, rules, options = {}) {
    const { value, errorMessage, handleBlur, handleChange, meta } = useField(
        name,
        rules,
        options
    );

    return {
        value,
        errorMessage,
        handleBlur,
        handleChange,
        meta,
        isValid: !errorMessage.value && meta.touched,
        isDirty: meta.dirty,
        isTouched: meta.touched,
    };
}
