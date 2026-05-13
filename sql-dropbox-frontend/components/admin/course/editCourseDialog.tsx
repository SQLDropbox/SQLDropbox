"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Course } from "@/types/types";

interface Props {
    open: boolean;
    onClose: () => void;
    mode: "add" | "edit";
    course?: Course;
}

export default function EditCourseDialog({
    open,
    onClose,
    mode,
    course,
}: Props) {
    const isEdit = mode === "edit";

    const emptyForm: Course = {
        courseId: 0,
        courseNameNL: "",
        courseNameEN: "",
        courseDescriptionNL: "",
        courseDescriptionEN: "",
        lecturer: "",
        deadline: new Date(),
        isActive: true,
    };

    const [form, setForm] = useState<Course>(emptyForm);

    useEffect(() => {
        if (!open) return;

        if (isEdit && course) {
            setForm({
                courseId: course.courseId ?? 0,
                courseNameNL: course.courseNameNL ?? "",
                courseNameEN: course.courseNameEN ?? "",
                courseDescriptionNL: course.courseDescriptionNL ?? "",
                courseDescriptionEN: course.courseDescriptionEN ?? "",
                lecturer: course.lecturer ?? "",
                deadline: course.deadline
                    ? new Date(course.deadline)
                    : new Date(),
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

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSubmit() {
        if (isEdit) {
            console.log("UPDATE COURSE:", form);
        } else {
            console.log("CREATE COURSE:", form);
        }

        onClose();
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                            {isEdit ? "Edit" : "Add"} Course
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            {isEdit
                                ? "Update the course details below."
                                : "Fill in the details to create a new course."}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* FORM */}
                <div className="space-y-4">
                    {/* EN NAME */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Course Name (EN)
                        </label>
                        <input
                            name="courseNameEN"
                            value={form.courseNameEN}
                            onChange={handleChange}
                            className="w-full border p-2 rounded mt-1"
                        />
                    </div>

                    {/* NL NAME */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Course Name (NL)
                        </label>
                        <input
                            name="courseNameNL"
                            value={form.courseNameNL}
                            onChange={handleChange}
                            className="w-full border p-2 rounded mt-1"
                        />
                    </div>

                    {/* EN DESCRIPTION */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Description (EN)
                        </label>
                        <textarea
                            name="courseDescriptionEN"
                            value={form.courseDescriptionEN}
                            onChange={handleChange}
                            className="w-full border p-2 rounded mt-1"
                        />
                    </div>

                    {/* NL DESCRIPTION */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Description (NL)
                        </label>
                        <textarea
                            name="courseDescriptionNL"
                            value={form.courseDescriptionNL}
                            onChange={handleChange}
                            className="w-full border p-2 rounded mt-1"
                        />
                    </div>

                    {/* LECTURER */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Lecturer
                        </label>
                        <input
                            name="lecturer"
                            value={form.lecturer}
                            onChange={handleChange}
                            className="w-full border p-2 rounded mt-1"
                        />
                    </div>

                    {/* DEADLINE */}
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
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    deadline: new Date(e.target.value),
                                }))
                            }
                            className="w-full border p-2 rounded mt-1"
                        />
                    </div>

                    {/* ACTIVE */}
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    isActive: e.target.checked,
                                }))
                            }
                        />
                        Active
                    </label>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                    >
                        {isEdit ? "Save Changes" : "Create Course"}
                    </button>
                </div>
            </div>
        </div>
    );
}
