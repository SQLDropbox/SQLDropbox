"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: (newCourseId?: string) => void;
    courseName?: string;
    originalCourseId?: string;
    isDuplicating: boolean;
}

export default function DuplicateCourseModal({
    open,
    onClose,
    onConfirm,
    courseName,
    originalCourseId,
    isDuplicating,
}: Props) {
    const [newCourseIdInput, setNewCourseIdInput] = useState("");
    const t = useTranslations("DuplicateCourseModal");

    useEffect(() => {
        if (open) {
            setNewCourseIdInput("");
        }
    }, [open]);

    if (!open) return null;

    function handleConfirm() {
        const customId = newCourseIdInput.trim() || undefined;
        onConfirm(customId);
    }

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
            <div className="relative w-full max-w-xl bg-paper-light border border-border shadow-2xl font-mono">
                {/* Tape */}
                <div
                    className="
                absolute -top-3 left-1/2
                -translate-x-1/2 -rotate-2
                w-24 h-7
                bg-white/40
                border border-border/20
            "
                />

                {/* Header */}
                <div className="border-b border-border bg-paper px-6 py-4">
                    <h3 className="font-display text-xl">{t("title")}</h3>

                    <p className="text-[11px] text-muted mt-1">
                        {t("description", {
                            courseName: courseName ?? "",
                        })}
                    </p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    <div>
                        <label className="text-[11px] uppercase tracking-widest text-muted block mb-2">
                            {t("newCourseId")}
                        </label>

                        <input
                            type="text"
                            placeholder={t("placeholder", {
                                courseId: originalCourseId ?? "",
                            })}
                            value={newCourseIdInput}
                            onChange={(e) =>
                                setNewCourseIdInput(e.target.value)
                            }
                            className="
                        w-full
                        bg-transparent
                        border-b border-border
                        py-2
                        text-sm
                        outline-none
                        focus:border-accent
                    "
                        />
                    </div>

                    <p className="text-[11px] text-muted uppercase tracking-wider">
                        {t("autoGenerateHint")}
                    </p>
                </div>

                {/* Footer */}
                <div className="border-t border-border bg-surface-1 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="
                    px-4 py-2
                    border border-border
                    text-muted
                    hover:bg-ink
                    hover:text-paper
                    transition
                "
                    >
                        {t("cancel")}
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={isDuplicating}
                        className="
                    px-4 py-2
                    border-2 border-accent
                    text-accent
                    hover:bg-accent
                    hover:text-paper
                    transition
                    rotate-1
                    disabled:opacity-50
                "
                    >
                        {isDuplicating ? t("duplicating") : t("confirm")}
                    </button>
                </div>
            </div>
        </div>
    );
}
