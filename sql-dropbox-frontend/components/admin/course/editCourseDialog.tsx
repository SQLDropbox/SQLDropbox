"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Course } from "@/types/types";
import { courseService } from "@/services/courseService";
import ConfirmDialog from "@/components/dialog/confirmDialog";
import AlertDialog from "@/components/dialog/alertDialog";
import { useAuth } from "@/hooks/useAuth";
import DuplicateCourseModal from "./duplicateCourseModal";
import { useTranslations } from "next-intl";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mode: "add" | "edit";
    course?: Course;
}

type FormErrors = Partial<Record<keyof Course, string>>;

const emptyForm: Course = {
    courseId: "",
    courseNameNL: "",
    courseNameEN: "",
    courseDescriptionNL: "",
    courseDescriptionEN: "",
    lecturer: "",
    isActive: true,
};

export default function EditCourseDialog({
    open,
    onClose,
    onSuccess,
    mode,
    course,
}: Props) {
    const isEdit = mode === "edit";
    const t = useTranslations("CourseDialog");
    const { isAdmin } = useAuth();

    const [form, setForm] = useState<Course>(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] =
        useState(false);

    const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [courseIdLocked, setCourseIdLocked] = useState(!isEdit);
    const [errorDialog, setErrorDialog] = useState<string | null>(null);

    function validateForm(form: Course): FormErrors {
        const errors: FormErrors = {};
        if (!form.courseId.trim())
            errors.courseId = t("errors.courseIdRequired");
        if (!form.courseNameEN.trim())
            errors.courseNameEN = t("errors.nameENRequired");
        if (!form.courseNameNL.trim())
            errors.courseNameNL = t("errors.nameNLRequired");
        if (!form.lecturer.trim())
            errors.lecturer = t("errors.lecturerRequired");
        return errors;
    }

    useEffect(() => {
        if (!open) return;

        setErrors({});
        setSubmitted(false);

        if (isEdit && course) {
            setCourseIdLocked(true);
            setForm(course);
        } else {
            setCourseIdLocked(false);
            setForm(emptyForm);
        }
    }, [open, mode, course]);

    if (!open) return null;

    function onDelete() {
        if (!isEdit || !course) return;
        setConfirmDeleteDialogOpen(true);
    }

    async function handleDuplicate(customId?: string) {
        if (!course) return;
        setIsDuplicating(true);
        
        try {
            await courseService.duplicateCourse(course.courseId, customId);
            
            setDuplicateDialogOpen(false);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setErrorDialog(
                err?.message || "Something went wrong while duplicating the course.",
            );
        } finally {
            setIsDuplicating(false);
        }
    }

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) {
        const { name, value } = e.target;

        const updated = { ...form, [name]: value };

        if (name === "courseNameEN" && !courseIdLocked) {
            updated.courseId = generateSlug(value);
        }

        if (name === "courseId") {
            setCourseIdLocked(true);
            updated.courseId = generateSlug(value);
        }

        setForm(updated);

        if (submitted) {
            const newErrors = validateForm(updated);
            setErrors((prev) => ({
                ...prev,
                [name]: newErrors[name as keyof Course],
            }));
        }
    }

    async function handleSubmit() {
        setSubmitted(true);

        const newErrors = validateForm(form);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            if (isEdit) {
                await courseService.updateCourse(form.courseId, form);
            } else {
                await courseService.addCourse(form);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setErrorDialog(err?.message || t("errors.saveFailed"));
        }
    }

    function generateSlug(text: string) {
        return text
            .toLowerCase()
            .trim()
            .replace(/['"]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            {/* DOCUMENT SHEET */}
            <div className="relative w-full max-w-170 aspect-210/297 bg-paper-light text-ink border border-border shadow-2xl flex flex-col max-h-[90vh] font-mono">
                {/* HEADER STRIP */}
                <div className="border-b border-border bg-paper px-6 py-4 flex justify-between items-start">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted">
                            COURSE DOSSIER / DATABASE ENTRY
                        </p>
                        <h2 className="font-display text-xl">
                            {isEdit ? t("titleEdit") : t("titleAdd")}
                        </h2>
                        <p className="text-[11px] text-muted mt-1">
                            {isEdit ? t("subtitleEdit") : t("subtitleAdd")}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="opacity-70 hover:opacity-100 transition"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* STAMP */}
                {isEdit && (
                    <div
                        className={`
                            absolute top-6 right-14 -rotate-12
                            border-2 px-3 py-1
                            text-[10px] uppercase tracking-widest
                            ${form.isActive ? "border-accent text-accent" : "border-border text-muted"}
                            opacity-80
                        `}
                    >
                        {form.isActive
                            ? t("statusActive")
                            : t("statusArchived")}
                    </div>
                )}

                {/* FORM BODY */}
                <div className="flex flex-col grow overflow-y-auto gap-2 px-6">
                    {/* COURSE NAMES */}
                    <Field
                        label={t("courseName")}
                        error={errors.courseNameEN || errors.courseNameNL}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <input
                                    name="courseNameEN"
                                    value={form.courseNameEN}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-1 text-sm"
                                />
                                <span className="absolute right-0 top-0 text-[10px] text-muted">
                                    EN
                                </span>
                            </div>

                            <div className="relative">
                                <input
                                    name="courseNameNL"
                                    value={form.courseNameNL}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-1 text-sm"
                                />
                                <span className="absolute right-0 top-0 text-[10px] text-muted">
                                    NL
                                </span>
                            </div>
                        </div>
                    </Field>

                    {/* COURSE ID */}
                    <Field label={t("courseId")} error={errors.courseId}>
                        <input
                            name="courseId"
                            value={form.courseId}
                            onChange={handleChange}
                            disabled={isEdit}
                            className={`
                                w-full bg-transparent border-b border-border py-1 text-sm
                                ${isEdit ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                        />
                    </Field>

                    {/* DESCRIPTION */}
                    <Field label={t("description")}>
                        <div className="grid grid-cols-2 gap-4">
                            <textarea
                                name="courseDescriptionEN"
                                value={form.courseDescriptionEN}
                                onChange={handleChange}
                                rows={5}
                                className="bg-transparent border border-border p-2 text-sm resize-none"
                            />
                            <textarea
                                name="courseDescriptionNL"
                                value={form.courseDescriptionNL}
                                onChange={handleChange}
                                rows={5}
                                className="bg-transparent border border-border p-2 text-sm resize-none"
                            />
                        </div>
                    </Field>

                    {/* LECTURER */}
                    <Field label={t("lecturer")} error={errors.lecturer}>
                        <input
                            name="lecturer"
                            value={form.lecturer}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-border py-1 text-sm"
                        />
                    </Field>

                    {/* ACTIVE */}
                    <div className="py-4 flex items-center gap-2 text-sm text-muted">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    isActive: e.target.checked,
                                }))
                            }
                        />
                        {t("active")}
                    </div>
                </div>

                {/* FOOTER CONTROL STRIP */}
                <div className="border-t border-border bg-surface-1 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-border text-muted hover:bg-ink hover:text-paper transition"
                    >
                        CANCEL
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-paper transition rotate-[1deg]"
                    >
                        {isEdit ? "SAVE RECORD" : "CREATE ENTRY"}
                    </button>
                </div>
            </div>

            <DuplicateCourseModal
                open={duplicateDialogOpen}
                onClose={() => setDuplicateDialogOpen(false)}
                onConfirm={handleDuplicate}
                courseName={course?.courseNameEN}
                originalCourseId={course?.courseId}
                isDuplicating={isDuplicating}
            />

            <DuplicateCourseModal
                open={duplicateDialogOpen}
                onClose={() => setDuplicateDialogOpen(false)}
                onConfirm={handleDuplicate}
                courseName={course?.courseNameEN}
                originalCourseId={course?.courseId}
                isDuplicating={isDuplicating}
            />

            {/* dialogs unchanged */}
            <AlertDialog
                open={!!errorDialog}
                onClose={() => setErrorDialog(null)}
                title={t("errorTitle")}
                description={errorDialog || ""}
                type="error"
                buttonText="OK"
            />

            <ConfirmDialog
                open={confirmDeleteDialogOpen}
                onClose={() => setConfirmDeleteDialogOpen(false)}
                onConfirm={async () => {
                    await courseService.deleteCourse(course!.courseId);
                    setConfirmDeleteDialogOpen(false);
                    onSuccess();
                    onClose();
                }}
                title={t("deleteTitle")}
                description={t("deleteDescription")}
                type="delete"
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
        <div className="py-4">
            <label className="text-[11px] uppercase tracking-widest text-muted block mb-1">
                {label}
            </label>
            {children}
            {error && (
                <p className="text-[11px] text-error mt-1 uppercase tracking-wider">
                    {error}
                </p>
            )}
        </div>
    );
}
