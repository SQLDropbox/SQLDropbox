"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { userService } from "@/services/userService";
import AlertDialog from "@/components/dialog/alertDialog";

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
        if (!form.userCode.trim()) errors.userCode = "User Code is required";
        if (!form.firstName.trim()) errors.firstName = "First name is required";
        if (!form.lastName.trim()) errors.lastName = "Last name is required";
        if (!form.email.trim()) errors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Invalid email format";
        return errors;
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        const updated = { ...form, [name]: value };
        setForm(updated);

        if (submitted) {
            setErrors(validateForm(updated));
        }
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
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            setErrorDialog(err?.message || "Failed to register personnel.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="relative w-full max-w-lg bg-paper-light text-ink border border-border shadow-2xl flex flex-col font-mono">
                
                {/* TAPE DETAIL */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-surface-1/50 border border-border/20 shadow-[0_1px_2px_rgba(0,0,0,0.05)] rotate-2 z-10" />

                {/* HEADER STRIP */}
                <div className="border-b border-border bg-paper px-6 py-4 flex justify-between items-start">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted">
                            PERSONNEL DOSSIER / DATABASE ENTRY
                        </p>
                        <h2 className="font-display text-xl text-accent uppercase">
                            Register Instructor
                        </h2>
                        <p className="text-[11px] text-muted mt-1 uppercase tracking-widest">
                            SYS. ROLE: LECTURER
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="opacity-70 hover:opacity-100 transition"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* FORM BODY */}
                <div className="flex flex-col gap-2 px-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="First Name" error={errors.firstName}>
                            <input
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                placeholder="e.g. Lector-Joran"
                                className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-1 text-sm placeholder:text-muted/50"
                            />
                        </Field>

                        <Field label="Last Name" error={errors.lastName}>
                            <input
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                placeholder="e.g. Dirix"
                                className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-1 text-sm placeholder:text-muted/50"
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="User Code" error={errors.userCode}>
                            <input
                                name="userCode"
                                value={form.userCode}
                                onChange={handleChange}
                                placeholder="e.g. u1234567"
                                className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-1 text-sm placeholder:text-muted/50"
                            />
                        </Field>

                        <Field label="Email" error={errors.email}>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="e.g. u1234567@ucll.be"
                                className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-1 text-sm placeholder:text-muted/50"
                            />
                        </Field>
                    </div>
                </div>

                {/* FOOTER CONTROL STRIP */}
                <div className="border-t border-border bg-surface-1 px-6 py-4 flex justify-end gap-3 mt-2">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 border border-border text-muted hover:bg-ink hover:text-paper transition"
                    >
                        CANCEL
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-paper transition rotate-1 disabled:opacity-50"
                    >
                        {isSubmitting ? "PROCESSING..." : "REGISTER"}
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

/* ------------------------ field block ------------------------ */
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