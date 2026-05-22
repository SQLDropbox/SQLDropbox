"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Course } from "@/types/types";
import { courseService } from "@/services/courseService";
import ConfirmDialog from "@/components/dialog/confirmDialog";
import AlertDialog from "@/components/dialog/alertDialog";
import { useAuth } from "@/hooks/useAuth";
import DuplicateCourseModal from "./duplicateCourseModal";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mode: "add" | "edit";
    course?: Course;
}

type FormErrors = Partial<Record<keyof Course, string>>;

function validateForm(form: Course): FormErrors {
    const errors: FormErrors = {};

    if (!form.courseId.trim()) {
        errors.courseId = "URL is required.";
    }

    if (!form.courseNameEN.trim())
        errors.courseNameEN = "Course name (EN) is required.";

    if (!form.courseNameNL.trim())
        errors.courseNameNL = "Course name (NL) is required.";

    if (!form.lecturer.trim()) errors.lecturer = "Lecturer is required.";

    return errors;
}

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

    const [form, setForm] = useState<Course>(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] =
        useState(false);

    const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [urlLocked, setUrlLocked] = useState(!isEdit);
    const [errorDialog, setErrorDialog] = useState<string | null>(null);
    const { isAdmin } = useAuth();

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

        if (name === "courseId" && isEdit) {
            return;
        }

        const updated = { ...form, [name]: value };

        // AUTO-GENERATE URL from EN name (only if not locked)
        if (name === "courseNameEN" && !urlLocked) {
            updated.courseId = generateSlug(value);
        }

        // If user manually edits URL → lock it
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
                console.log("Course updated successfully"); // TODO: add notification?
            } else {
                await courseService.addCourse(form);
                console.log("Course created successfully"); // TODO: add notification?
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);

            setErrorDialog(
                err?.message || "Something went wrong while saving the course.",
            );
        }
    }

    function generateSlug(text: string) {
        return text
            .toLowerCase()
            .trim()
            .replace(/['"]/g, "") // remove quotes
            .replace(/[^a-z0-9\s-]/g, "") // remove special chars
            .replace(/\s+/g, "-") // spaces → dashes
            .replace(/-+/g, "-"); // collapse multiple dashes
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
                            {isEdit ? "Edit" : "Add"} Course
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {isEdit
                                ? "Update the course details below."
                                : "Fill in the details to create a new course."}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black mt-1 cursor-pointer"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* FORM — scrollable */}
                <div className="overflow-y-auto px-6 py-4">
                    <div className="space-y-4">
                        {/* Course Name */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Course Name
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

                        {/* URL */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                URL
                                {!urlLocked && (
                                    <span className="text-xs text-gray-400 ml-2">
                                        {" "}
                                        (auto-generated)
                                    </span>
                                )}
                            </label>
                            <input
                                name="courseId"
                                value={form.courseId}
                                onChange={handleChange}
                                className={inputClass("courseId") + (isEdit ? " bg-gray-200 cursor-not-allowed" : "")}
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
                                Description
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
                                    {errors.courseDescriptionEN && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.courseDescriptionEN}
                                        </p>
                                    )}
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
                                    {errors.courseDescriptionNL && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.courseDescriptionNL}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Lecturer */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Lecturer
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

                        {/* Active */}
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
                            Active
                        </label>
                    </div>
                </div>

                {/* FOOTER */}
                <div
                    className={`flex ${mode == "edit" ? "justify-between" : "justify-end"} gap-3 px-6 py-4 border-t border-gray-100`}
                >
                    {mode == "edit" && (
                        <div className="flex gap-2">
                            {isAdmin && (
                                <button
                                    className="border border-gray-300 px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-400 transition-colors cursor-pointer"
                                    onClick={onDelete}>
                                    Delete
                                </button>
                    )}
                            <button className="border border-gray-300 px-4 py-2 rounded-lg text-sm bg-white text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setDuplicateDialogOpen(true)}>
                                Duplicate
                            </button>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                            {isEdit ? "Save Changes" : "Create Course"}
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
                title="Error"
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
                title="Delete Course"
                description="Are you sure you want to delete this course? This action cannot be undone."
                type="delete"
            />
        </div>
    );
}
