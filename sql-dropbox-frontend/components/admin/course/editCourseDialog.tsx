"use client";

import { useEffect, useState } from "react";
import { FaTimes, FaCheck } from "react-icons/fa";
import { Course, Lecturer } from "@/types/types";
import { courseService } from "@/services/courseService";
import { userService } from "@/services/userService";
import { useQuery } from "@tanstack/react-query";
import ConfirmDialog from "@/components/dialog/confirmDialog";
import AlertDialog from "@/components/dialog/alertDialog";
import { useAuth } from "@/hooks/useAuth";
import DuplicateCourseModal from "./duplicateCourseModal";
import { useTranslations } from "next-intl";
import { FiCopy, FiTrash2 } from "react-icons/fi";

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
    lecturerIds: [],
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

    const { data: allLecturers, isLoading: isLoadingLecturers } = useQuery<Lecturer[]>({
        queryKey: ["all-lecturers"],
        queryFn: () => userService.getAllLecturers(),
        enabled: open,
    });

    function validateForm(form: Course): FormErrors {
        const errors: FormErrors = {};
        if (!form.courseId.trim())
            errors.courseId = t("errors.courseIdRequired");
        if (!form.courseNameEN.trim())
            errors.courseNameEN = t("errors.nameENRequired");
        if (!form.courseNameNL.trim())
            errors.courseNameNL = t("errors.nameNLRequired");
        if (!form.lecturerIds || form.lecturerIds.length === 0)
            errors.lecturerIds = t("errors.lecturerRequired") || "At least one instructor is required";
        return errors;
    }

    useEffect(() => {
        if (!open) return;

        setErrors({});
        setSubmitted(false);

        if (isEdit && course) {
            setCourseIdLocked(true);
            setForm({
                ...course,
                lecturerIds: course.lecturers?.map((l) => l.userId) || [],
            });
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
                err?.message ||
                    "Something went wrong while duplicating the course.",
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
                    <Field label={t("lecturer") || "Assign Additional Instructors"} error={errors.lecturerIds}>
                        {isLoadingLecturers ? (
                            <div className="bg-surface-1 border border-border p-4">
                                <p className="text-[11px] text-muted uppercase tracking-widest italic animate-pulse">
                                    LOADING PERSONNEL LIST...
                                </p>
                            </div>
                        ) : (
                            <div className="bg-surface-1 border border-border p-2 max-h-[160px] overflow-y-auto flex flex-col gap-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                                {(() => {
                                    // Filter docenten die al aan de cursus zijn gekoppeld eruit
                                    const availableLecturers = allLecturers?.filter(
                                        (l) => !course?.lecturers?.some((cl) => cl.userId === l.userId)
                                    ) ?? [];

                                    if (availableLecturers.length === 0) {
                                        return (
                                            <div className="p-3">
                                                <p className="text-[10px] text-accent uppercase tracking-widest">
                                                    * ALL AVAILABLE INSTRUCTORS ARE ALREADY ASSIGNED.
                                                </p>
                                            </div>
                                        );
                                    }

                                    return availableLecturers.map((l) => (
                                        <label 
                                            key={l.userId} 
                                            className="flex items-center gap-3 p-2 hover:bg-paper cursor-pointer border border-transparent hover:border-border transition-colors group"
                                        >
                                            {/* Custom Brutalist Checkbox */}
                                            <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={form.lecturerIds?.includes(l.userId) || false}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        setForm((prev) => {
                                                            const currentIds = prev.lecturerIds || [];
                                                            return {
                                                                ...prev,
                                                                lecturerIds: isChecked 
                                                                    ? [...currentIds, l.userId] 
                                                                    : currentIds.filter(id => id !== l.userId)
                                                            };
                                                        });
                                                    }}
                                                    className="peer appearance-none w-4 h-4 border-2 border-border checked:bg-accent checked:border-accent cursor-pointer transition-colors"
                                                />
                                                <FaCheck className="absolute text-paper text-[10px] pointer-events-none opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-transform" />
                                            </div>
                                            
                                            {/* Label Tekst */}
                                            <span className="font-mono text-[11px] text-ink uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                                                {l.firstName} {l.lastName} <span className="text-muted">({l.userCode})</span>
                                            </span>
                                        </label>
                                    ));
                                })()}
                            </div>
                        )}
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
                <div className="border-t border-border bg-surface-1 px-6 py-4 flex justify-between gap-3">
                    <div>
                        {isAdmin && isEdit && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onDelete}
                                    className="
                                        flex items-center justify-center
                                        w-9 h-9
                                        border border-error
                                        text-ink
                                        hover:bg-error hover:text-paper
                                        transition
                                        -rotate-1
                                    "
                                    title={t("delete")}
                                >
                                    <FiTrash2 className="text-[14px]" />
                                </button>

                                <button
                                    onClick={() => setDuplicateDialogOpen(true)}
                                    className="
                                        flex items-center justify-center
                                        w-9 h-9
                                        border border-accent
                                        text-accent
                                        hover:bg-accent hover:text-paper
                                        transition
                                        rotate-[1.5deg]
                                    "
                                    title={t("duplicate")}
                                >
                                    <FiCopy className="text-[14px]" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-border text-muted hover:bg-ink hover:text-paper transition"
                        >
                            {t("cancel")}
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-paper transition rotate-1"
                        >
                            {isEdit ? t("save") : t("create")}
                        </button>
                    </div>
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
