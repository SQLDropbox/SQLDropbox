"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Course } from "@/types/types";
import { courseService } from "@/services/courseService";
import ConfirmDialog from "@/components/dialog/confirmDialog";
import AlertDialog from "@/components/dialog/alertDialog";
import { useAuth } from "@/hooks/useAuth";
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

    const [form, setForm] = useState<Course>(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] =
        useState(false);
    const [urlLocked, setUrlLocked] = useState(!isEdit);
    const [errorDialog, setErrorDialog] = useState<string | null>(null);
    const { isAdmin } = useAuth();

    function validateForm(form: Course): FormErrors {
        const errors: FormErrors = {};
        if (!form.courseId.trim()) errors.courseId = t("errors.urlRequired");
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
            setUrlLocked(true);
            setForm({
                courseId: course.courseId ?? "",
                courseNameNL: course.courseNameNL ?? "",
                courseNameEN: course.courseNameEN ?? "",
                courseDescriptionNL: course.courseDescriptionNL ?? "",
                courseDescriptionEN: course.courseDescriptionEN ?? "",
                lecturer: course.lecturer ?? "",
                isActive: course.isActive ?? true,
            });
        } else {
            setUrlLocked(false);
            setForm(emptyForm);
        }
    }, [open, mode, course]);

    if (!open) return null;

    function onDelete() {
        if (!isEdit || !course) return;
        setConfirmDeleteDialogOpen(true);
    }

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) {
        const { name, value } = e.target;

        if (name === "courseId" && isEdit) return;

        const updated = { ...form, [name]: value };

        if (name === "courseNameEN" && !urlLocked) {
            updated.courseId = generateSlug(value);
        }

        if (name === "courseId") {
            setUrlLocked(true);
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
            console.error(err);
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

    const inputClass = (name: keyof Course) =>
        `w-full border rounded mt-1 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 ${
            errors[name] ? "border-red-400 bg-red-50" : "border-gray-300"
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl flex flex-col max-h-[90vh]">
                {/* HEADER */}
                <div className="flex justify-between items-start px-6 pt-6 pb-4 border-b border-gray-300">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {isEdit ? t("titleEdit") : t("titleAdd")}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {isEdit ? t("subtitleEdit") : t("subtitleAdd")}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black mt-1 cursor-pointer"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* FORM */}
                <div className="overflow-y-auto px-6 py-4">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                {t("courseName")}
                            </label>
                            <div className="grid grid-cols-2 gap-4 mt-1">
                                <div>
                                    <div className="relative">
                                        <input
                                            name="courseNameEN"
                                            value={form.courseNameEN}
                                            onChange={handleChange}
                                            className={
                                                inputClass("courseNameEN") +
                                                " pr-10"
                                            }
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                                            EN
                                        </span>
                                    </div>
                                    {errors.courseNameEN && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.courseNameEN}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <div className="relative">
                                        <input
                                            name="courseNameNL"
                                            value={form.courseNameNL}
                                            onChange={handleChange}
                                            className={
                                                inputClass("courseNameNL") +
                                                " pr-10"
                                            }
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                                            NL
                                        </span>
                                    </div>
                                    {errors.courseNameNL && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.courseNameNL}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                {t("url")}
                                {!urlLocked && (
                                    <span className="text-xs text-gray-400 ml-2">
                                        {t("autoGenerated")}
                                    </span>
                                )}
                            </label>
                            <input
                                name="courseId"
                                value={form.courseId}
                                onChange={handleChange}
                                className={
                                    inputClass("courseId") +
                                    (isEdit
                                        ? " bg-gray-200 cursor-not-allowed"
                                        : "")
                                }
                                disabled={isEdit}
                            />
                            {errors.courseId && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.courseId}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                {t("description")}
                            </label>
                            <div className="grid grid-cols-2 gap-4 mt-1">
                                <div>
                                    <div className="relative">
                                        <textarea
                                            name="courseDescriptionEN"
                                            value={form.courseDescriptionEN}
                                            onChange={handleChange}
                                            rows={6}
                                            className={
                                                inputClass(
                                                    "courseDescriptionEN",
                                                ) + " pr-10 resize-none"
                                            }
                                        />
                                        <span className="absolute right-2 top-2 text-xs font-medium text-gray-400">
                                            EN
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="relative">
                                        <textarea
                                            name="courseDescriptionNL"
                                            value={form.courseDescriptionNL}
                                            onChange={handleChange}
                                            rows={6}
                                            className={
                                                inputClass(
                                                    "courseDescriptionNL",
                                                ) + " pr-10 resize-none"
                                            }
                                        />
                                        <span className="absolute right-2 top-2 text-xs font-medium text-gray-400">
                                            NL
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                {t("lecturer")}
                            </label>
                            <input
                                name="lecturer"
                                value={form.lecturer}
                                onChange={handleChange}
                                className={inputClass("lecturer")}
                            />
                            {errors.lecturer && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.lecturer}
                                </p>
                            )}
                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        isActive: e.target.checked,
                                    }))
                                }
                                className="rounded"
                            />
                            {t("active")}
                        </label>
                    </div>
                </div>

                {/* FOOTER */}
                <div
                    className={`flex ${mode === "edit" ? "justify-between" : "justify-end"} gap-3 px-6 py-4 border-t border-gray-100`}
                >
                    {mode === "edit" && isAdmin && (
                        <button
                            className="border border-gray-300 px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-400 transition-colors cursor-pointer"
                            onClick={onDelete}
                        >
                            {t("delete")}
                        </button>
                    )}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                            {isEdit ? t("saveChanges") : t("createCourse")}
                        </button>
                    </div>
                </div>
            </div>

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
