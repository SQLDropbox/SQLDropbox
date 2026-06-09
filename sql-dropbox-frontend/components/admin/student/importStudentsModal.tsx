"use client";

import { useRef, useState } from "react";
import { FaTimes, FaUpload } from "react-icons/fa";
import { useTranslations } from "next-intl";

import { userService } from "@/services/userService";
import { User } from "@/types/types";
import AlertDialog from "@/components/dialog/alertDialog";

interface Props {
    courseId: string;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = "upload" | "load";

export default function ImportStudentsModal({
    courseId,
    onClose,
    onSuccess,
}: Props) {
    const t = useTranslations("StudentTable");
    const [step, setStep] = useState<Step>("upload");

    const [file, setFile] = useState<File | null>(null);
    const [students, setStudents] = useState<User[]>([]);
    const [skipped, setSkipped] = useState<User[]>([]);
    
    const [submitting, setSubmitting] = useState(false);
    const [errorDialog, setErrorDialog] = useState<string | null>(null);

    const [dragging, setDragging] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement | null>(null);

    // ------------------------------------
    // VALIDATE FILE
    // ------------------------------------
    function validateFile(selected: File | null) {
        setUploadError(null);

        if (!selected) {
            setFile(null);
            return;
        }

        const isCsv =
            selected.type === "text/csv" ||
            selected.name.toLowerCase().endsWith(".csv");

        if (!isCsv) {
            setUploadError(t("modal.onlyCsv"));
            setFile(null);
            return;
        }

        setFile(selected);
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        validateFile(e.target.files?.[0] || null);
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragging(false);
        validateFile(e.dataTransfer.files?.[0] || null);
    }

    // ------------------------------------
    // STEP 1: LOAD
    // ------------------------------------
    async function handleLoad() {
        if (!file) {
            setUploadError(t("modal.selectCsv"));
            return;
        }

        setSubmitting(true);
        setUploadError(null);

        try {
            const res = await userService.previewImportStudents(courseId, file);
            setStudents(res.students);
            setSkipped(res.skipped);
            setStep("load");
        } catch (e) {
            setErrorDialog(
                e instanceof Error ? e.message : t("modal.somethingWrong"),
            );
        } finally {
            setSubmitting(false);
        }
    }

    // ------------------------------------
    // STEP 2: IMPORT
    // ------------------------------------
    async function handleImport() {
        setSubmitting(true);

        try {
            await userService.importStudents(courseId, students);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 800);
        } catch (e) {
            setErrorDialog(
                e instanceof Error ? e.message : t("modal.somethingWrong"),
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="relative w-full max-w-2xl bg-paper-light text-ink border border-border shadow-2xl flex flex-col max-h-[80vh] font-mono">
                {/* TAPE DETAIL */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-surface-1/50 border border-border/20 shadow-[0_1px_2px_rgba(0,0,0,0.05)] rotate-2 z-10" />

                {/* HEADER STRIP */}
                <div className="border-b border-border bg-paper px-6 py-4 flex justify-between items-start shrink-0">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted">
                            {t("modal.bulkEnrollment")}
                        </p>
                        <h2 className="font-display text-xl text-accent uppercase">
                            {t("modal.title")}
                        </h2>
                        <p className="text-[11px] text-muted mt-1 uppercase tracking-widest">
                            {t("modal.format")}&nbsp;/&nbsp;{t("modal.step")} {step === "upload" ? t("modal.stepUpload") : t("modal.stepConfirm")}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="opacity-70 hover:opacity-100 transition"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="px-6 py-5 flex-1 overflow-y-auto">
                    {/* ---------------- UPLOAD STEP ---------------- */}
                    {step === "upload" && (
                        <div className="flex flex-col gap-4">
                            <div
                                onClick={() => inputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragging(true);
                                }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed p-8 text-center cursor-pointer transition
                                    ${
                                        dragging
                                            ? "border-accent bg-accent/5"
                                            : "border-border hover:border-accent/60"
                                    }`}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".csv,text/csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <FaUpload className="text-xl mx-auto mb-3 text-muted" />

                                <p className="text-xs uppercase tracking-widest text-ink">
                                    {t("modal.dragDrop")}
                                </p>

                                <p className="text-[11px] text-muted mt-1 uppercase tracking-wider">
                                    {t("modal.orClick")}
                                </p>

                                {file && (
                                        <p className="mt-3 text-[11px] text-accent uppercase tracking-widest border-t border-border/50 pt-3">
                                        ✓ &nbsp;{file.name}
                                    </p>
                                )}
                            </div>

                            {uploadError && (
                                <p className="text-[10px] text-error uppercase tracking-wider">
                                    ⚠ &nbsp;{uploadError}
                                </p>
                            )}
                        </div>
                    )}

                    {/* ---------------- LOAD STEP ---------------- */}
                    {step === "load" && (
                        <div className="flex flex-col gap-4">
                            <p className="text-[11px] uppercase tracking-widest text-muted">
                                {t("modal.recordsQueued")} &nbsp;
                                <span className="text-accent">
                                    {students.length}
                                </span>
                            </p>
                        
                            {skipped.length > 0 && (
                                <p className="text-[11px] uppercase tracking-widest text-muted">
                                    {t("modal.recordsSkipped")}&nbsp;
                                    <span className="text-error">
                                        {skipped.length}
                                    </span>
                                </p>
                            )}

                            <div className="border border-border overflow-hidden max-h-96 overflow-y-auto">
                                <table className="w-full text-xs">
                                            <thead className="bg-paper sticky top-0 border-b border-border">
                                        <tr>
                                            {[t("modal.colCode"), t("modal.colName"), t("modal.colEmail")].map(
                                                (h) => (
                                                    <th
                                                        key={h}
                                                        className="px-3 py-2 text-left uppercase tracking-widest text-muted font-normal"
                                                    >
                                                        {h}
                                                    </th>
                                                ),
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {students.map((s, i) => (
                                            <tr
                                                key={i}
                                                className="border-t border-border/50 hover:bg-surface-1/40 transition"
                                            >
                                                <td className="px-3 py-2">
                                                    {s.userCode}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {s.firstName} {s.lastName}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {s.email}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER CONTROL STRIP */}
                <div className="border-t border-border bg-surface-1 px-6 py-4 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 border border-border text-muted hover:bg-ink hover:text-paper transition"
                    >
                        {t("modal.cancel")}
                    </button>

                    {step === "upload" && (
                        <button
                            onClick={handleLoad}
                            disabled={submitting || !file}
                            className="px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-paper transition rotate-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? t("modal.processing") : t("modal.load")}
                        </button>
                    )}

                    {step === "load" && (
                        <button
                            onClick={handleImport}
                            disabled={submitting}
                            className="px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-paper transition rotate-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? t("modal.importing") : t("modal.confirmImport")}
                        </button>
                    )}
                </div>
            </div>

            <AlertDialog
                open={!!errorDialog}
                onClose={() => setErrorDialog(null)}
                title={t("modal.sysError")}
                description={errorDialog || ""}
                type="error"
                buttonText={t("modal.acknowledge")}
            />
        </div>
    );
}
