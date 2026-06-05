"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { userService } from "@/services/userService";
import AlertDialog from "@/components/dialog/alertDialog";
import { useTranslations } from "next-intl";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface LecturerForm {
    userCode: string;
    firstName: string;
    lastName: string;
    email: string;
}

type FormErrors = Partial<Record<keyof LecturerForm, string>>;

const emptyForm: LecturerForm = {
    userCode: "",
    firstName: "",
    lastName: "",
    email: "",
};

export default function AddLecturerDialog({ open, onClose, onSuccess }: Props) {
    const t = useTranslations("LecturerDialog");

    const [form, setForm] = useState<LecturerForm>(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorDialog, setErrorDialog] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setErrors({});
        setSubmitted(false);
        setForm(emptyForm);
    }, [open]);

    if (!open) return null;

    function validateForm(form: LecturerForm): FormErrors {
        const errors: FormErrors = {};

        if (!form.userCode.trim()) errors.userCode = t("errors.userCode");
        if (!form.firstName.trim()) errors.firstName = t("errors.firstName");
        if (!form.lastName.trim()) errors.lastName = t("errors.lastName");

        if (!form.email.trim()) {
            errors.email = t("errors.emailRequired");
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            errors.email = t("errors.emailInvalid");
        }

        return errors;
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;

        const updated = { ...form, [name]: value };
        setForm(updated);

        if (submitted) setErrors(validateForm(updated));
    }

    async function handleSubmit() {
        setSubmitted(true);

        const newErrors = validateForm(form);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            await userService.addLecturer(form);
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setErrorDialog(err?.message || t("errors.generic"));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="relative w-full max-w-lg bg-paper-light text-ink border border-border shadow-2xl flex flex-col font-mono">
                {/* TAPE */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-surface-1/50 border border-border/20 rotate-2 z-10" />

                {/* HEADER */}
                <div className="border-b border-border bg-paper px-6 py-4 flex justify-between items-start">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted">
                            {t("subtitle")}
                        </p>

                        <h2 className="font-display text-xl text-accent uppercase">
                            {t("title")}
                        </h2>

                        <p className="text-[11px] text-muted mt-1 uppercase tracking-widest">
                            {t("role")}
                        </p>
                    </div>

                    <button onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* BODY */}
                <div className="flex flex-col gap-2 px-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field
                            label={t("fields.firstName")}
                            error={errors.firstName}
                        >
                            <input
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                placeholder={t("placeholders.firstName")}
                                className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-1 text-sm placeholder:text-muted/50"
                            />
                        </Field>

                        <Field
                            label={t("fields.lastName")}
                            error={errors.lastName}
                        >
                            <input
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                placeholder={t("placeholders.lastName")}
                                className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-1 text-sm placeholder:text-muted/50"
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field
                            label={t("fields.userCode")}
                            error={errors.userCode}
                        >
                            <input
                                name="userCode"
                                value={form.userCode}
                                onChange={handleChange}
                                placeholder={t("placeholders.userCode")}
                                className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-1 text-sm placeholder:text-muted/50"
                            />
                        </Field>

                        <Field label={t("fields.email")} error={errors.email}>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder={t("placeholders.email")}
                                className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-1 text-sm placeholder:text-muted/50"
                            />
                        </Field>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="border-t border-border bg-surface-1 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 border border-border text-muted hover:bg-ink hover:text-paper transition"
                    >
                        {t("actions.cancel")}
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-paper transition disabled:opacity-50 rotate-1"
                    >
                        {isSubmitting
                            ? t("actions.processing")
                            : t("actions.register")}
                    </button>
                </div>
            </div>

            <AlertDialog
                open={!!errorDialog}
                onClose={() => setErrorDialog(null)}
                title="SYS ERROR"
                description={errorDialog || ""}
                type="error"
                buttonText="ACKNOWLEDGE"
            />
        </div>
    );
}

/* ------------------------ field ------------------------ */
function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="py-2">
            <label className="text-[11px] uppercase tracking-widest text-muted block mb-1">
                {label}
            </label>
            {children}
            {error && (
                <p className="text-[10px] text-error mt-1 uppercase tracking-wider">
                    {error}
                </p>
            )}
        </div>
    );
}
