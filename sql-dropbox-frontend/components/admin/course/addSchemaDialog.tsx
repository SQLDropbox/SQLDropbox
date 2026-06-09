"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import AlertDialog from "@/components/dialog/alertDialog";
import { schemaService } from "@/services/schemaService";
import { useTranslations } from "next-intl";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface SchemaForm {
    schemaName: string;
}

type FormErrors = Partial<Record<keyof SchemaForm, string>>;

const emptyForm: SchemaForm = {
    schemaName: "",
};

export default function AddSchemaDialog({ open, onClose, onSuccess }: Props) {
    const t = useTranslations("SchemaDialog");

    const [form, setForm] = useState<SchemaForm>(emptyForm);
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [errorDialog, setErrorDialog] = useState<string | null>(null);
    const [successDialog, setSuccessDialog] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        setForm(emptyForm);
        setImage(null);
        setPreviewUrl(null);
        setErrors({});
        setSubmitted(false);
        setErrorDialog(null);
        setSuccessDialog(null);
    }, [open]);

    if (!open) return null;

    function validate(form: SchemaForm): FormErrors {
        const errors: FormErrors = {};
        if (!form.schemaName.trim()) {
            errors.schemaName = t("errors.required");
        }
        return errors;
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const updated = { schemaName: e.target.value };
        setForm(updated);

        if (submitted) setErrors(validate(updated));
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;

        if (previewUrl) URL.revokeObjectURL(previewUrl);

        setImage(file);

        if (file) setPreviewUrl(URL.createObjectURL(file));
        else setPreviewUrl(null);
    }

    async function handleSubmit() {
        setSubmitted(true);

        const newErrors = validate(form);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            await schemaService.createSchema(form.schemaName, image);

            onSuccess?.();
            setSuccessDialog(t("success"));

            setTimeout(() => onClose(), 1200);
        } catch (err: any) {
            setErrorDialog(err?.message || t("errors.generic"));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-mono">
            <div className="relative w-full max-w-lg bg-paper-light text-ink border border-border shadow-2xl flex flex-col">
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
                <div className="px-6 py-4 flex flex-col gap-2">
                    {/* Schema name */}
                    <div className="py-2">
                        <label className="text-[11px] uppercase tracking-widest text-muted block mb-1">
                            {t("fields.name")}
                        </label>

                        <input
                            value={form.schemaName}
                            onChange={handleChange}
                            placeholder={t("placeholders.name")}
                            className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-1 text-sm placeholder:text-muted/50"
                        />

                        {submitted && errors.schemaName && (
                            <p className="text-[10px] text-error mt-1 uppercase tracking-wider">
                                {errors.schemaName}
                            </p>
                        )}
                    </div>

                    {/* Image */}
                    <div className="py-2">
                        <label className="text-[11px] uppercase tracking-widest text-muted block mb-2">
                            {t("fields.image")}
                        </label>

                        <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border-2 border-dashed border-border hover:border-accent hover:text-accent transition text-sm uppercase tracking-widest">
                            {t("actions.upload")}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>

                        {previewUrl && (
                            <div className="mt-4 border border-border p-2 bg-paper">
                                <img
                                    src={previewUrl}
                                    className="w-full max-h-64 object-contain"
                                />
                            </div>
                        )}

                        {image && (
                            <p className="text-xs text-muted mt-2">
                                {image.name}
                            </p>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="border-t border-border bg-surface-1 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-border text-muted hover:bg-ink hover:text-paper transition"
                    >
                        {t("actions.cancel")}
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-paper transition disabled:opacity-50"
                    >
                        {isSubmitting
                            ? t("actions.processing")
                            : t("actions.create")}
                    </button>
                </div>
            </div>

            {/* ERROR */}
            <AlertDialog
                open={!!errorDialog}
                onClose={() => setErrorDialog(null)}
                title={t("alert.title")}
                description={errorDialog || ""}
                type="error"
                buttonText={t("alert.button")}
            />

            {/* SUCCESS */}
            <AlertDialog
                open={!!successDialog}
                onClose={() => setSuccessDialog(null)}
                title={t("successAlert.title")}
                description={successDialog || ""}
                type="success"
                buttonText={t("successAlert.button")}
            />
        </div>
    );
}
