"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Course } from "@/types/types";
import { courseService } from "@/services/courseService";

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

    if (!form.courseNameEN.trim())
        errors.courseNameEN = "Course name (EN) is required.";

    if (!form.courseNameNL.trim())
        errors.courseNameNL = "Course name (NL) is required.";

    if (!form.lecturer.trim()) errors.lecturer = "Lecturer is required.";

    if (!form.deadline) {
        errors.deadline = "Deadline is required.";
    } else {
        const deadline = new Date(form.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(deadline.getTime())) {
            errors.deadline = "Deadline must be a valid date.";
        } else if (deadline < today) {
            errors.deadline = "Deadline must be today or in the future.";
        }
    }

    return errors;
}

const emptyForm: Course = {
    courseId: 0,
    courseNameNL: "",
    courseNameEN: "",
    courseDescriptionNL: "",
    courseDescriptionEN: "",
    lecturer: "",
    deadline: null,
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

    useEffect(() => {
        if (!open) return;
        setErrors({});
        setSubmitted(false);

        if (isEdit && course) {
            setForm({
                courseId: course.courseId ?? 0,
                courseNameNL: course.courseNameNL ?? "",
                courseNameEN: course.courseNameEN ?? "",
                courseDescriptionNL: course.courseDescriptionNL ?? "",
                courseDescriptionEN: course.courseDescriptionEN ?? "",
                lecturer: course.lecturer ?? "",
                deadline: course.deadline ? new Date(course.deadline) : null,
                isActive: course.isActive ?? true,
            });
        } else {
            setForm(emptyForm);
        }
    }, [open, mode, course]);

    if (!open) return null;

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) {
        const { name, value } = e.target;
        const updated = { ...form, [name]: value };
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
        } catch (err) {
            console.error(err);
        }
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

                        {/* Deadline */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Deadline
                            </label>
                            <input
                                type="date"
                                value={
                                    form.deadline
                                        ? new Date(form.deadline)
                                              .toISOString()
                                              .split("T")[0]
                                        : ""
                                }
                                onChange={(e) => {
                                    const updated = {
                                        ...form,
                                        deadline: e.target.value
                                            ? new Date(e.target.value)
                                            : null,
                                    };
                                    setForm(updated);
                                    if (submitted) {
                                        const newErrors = validateForm(updated);
                                        setErrors((prev) => ({
                                            ...prev,
                                            deadline: newErrors.deadline,
                                        }));
                                    }
                                }}
                                className={inputClass("deadline")}
                            />
                            {errors.deadline && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.deadline}
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
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
                    >
                        {isEdit ? "Save Changes" : "Create Course"}
                    </button>
                </div>
            </div>
        </div>
    );
}
