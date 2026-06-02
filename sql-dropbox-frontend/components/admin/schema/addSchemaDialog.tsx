"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import AlertDialog from "@/components/dialog/alertDialog";
import { schemaService } from "@/services/schemaService";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddSchemaDialog({
    open,
    onClose,
    onSuccess,
}: Props) {
    const [schemaName, setSchemaName] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [successDialog, setSuccessDialog] = useState<string | null>(null);

    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;

        setSchemaName("");
        setImage(null);
        setPreviewUrl(null);
        setSubmitted(false);
        setError(null);
        setSuccessDialog(null);
    }, [open]);

    if (!open) return null;

    function handleImageChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = e.target.files?.[0] ?? null;

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setImage(file);

        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    }

    async function handleSubmit() {
        setSubmitted(true);

        if (!schemaName.trim()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await schemaService.createSchema(schemaName, image);

            onSuccess?.();

            setSuccessDialog("Schema created successfully.");

            setTimeout(() => {
                onClose();
            }, 1200);
        } catch (err: any) {
            setError(err?.message || "Failed to create schema.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="relative w-full max-w-lg bg-paper-light border border-border shadow-2xl">

                    {/* HEADER */}
                    <div className="border-b border-border px-6 py-4 flex justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted">
                                DATABASE STRUCTURE
                            </p>

                            <h2 className="font-display text-xl text-accent uppercase">
                                Create Schema
                            </h2>
                        </div>

                        <button onClick={onClose}>
                            <FaTimes />
                        </button>
                    </div>

                    {/* BODY */}
                    <div className="px-6 py-4 flex flex-col gap-5">

                        {/* SCHEMA NAME */}
                        <div>
                            <label className="text-[11px] uppercase tracking-widest text-muted block mb-1">
                                Schema Name
                            </label>

                            <input
                                value={schemaName}
                                onChange={(e) =>
                                    setSchemaName(e.target.value)
                                }
                                className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-1"
                                placeholder="animals"
                            />

                            {submitted && !schemaName.trim() && (
                                <p className="text-error text-xs mt-1">
                                    Schema name is required
                                </p>
                            )}
                        </div>

                        {/* IMAGE UPLOAD */}
                        <div>
                            <label className="text-[11px] uppercase tracking-widest text-muted block mb-2">
                                Schema Image (optional)
                            </label>

                            <div className="flex flex-col gap-3">

                                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border hover:border-accent hover:text-accent transition text-sm uppercase tracking-widest">
                                    Upload Image

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>

                                <p className="text-[11px] text-muted">
                                    Upload a schema diagram (PNG, JPG, etc.)
                                </p>
                            </div>

                            {/* PREVIEW */}
                            {previewUrl && (
                                <div className="mt-4 border border-border p-2 bg-paper">
                                    <img
                                        src={previewUrl}
                                        alt="Schema preview"
                                        className="w-full max-h-64 object-contain rounded"
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
                    <div className="border-t border-border px-6 py-4 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-border"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-paper"
                        >
                            {isSubmitting
                                ? "Creating..."
                                : "Create"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ERROR */}
            <AlertDialog
                open={!!error}
                onClose={() => setError(null)}
                title="SYS ERROR"
                description={error || ""}
                type="error"
                buttonText="ACKNOWLEDGE"
            />

            {/* SUCCESS */}
            <AlertDialog
                open={!!successDialog}
                onClose={() => setSuccessDialog(null)}
                title="SUCCESS"
                description={successDialog || ""}
                type="success"
                buttonText="OK"
            />
        </>
    );
}