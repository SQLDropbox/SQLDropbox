"use client";

import { useState } from "react";
import { FaTimes, FaExclamationTriangle, FaCheck } from "react-icons/fa";
import { userService } from "@/services/userService";

interface Props {
    courseId: string;
    onClose: () => void;
    onSuccess: () => void;
}

type FormState = {
    userCode: string;
    firstName: string;
    lastName: string;
    email: string;
};

const initialForm: FormState = {
    userCode: "",
    firstName: "",
    lastName: "",
    email: "",
};

export default function AddStudentModal({
    courseId,
    onClose,
    onSuccess,
}: Props) {
    const [form, setForm] = useState<FormState>(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const isValid = Object.values(form).every((v) => v.trim() !== "");

    function updateField(field: keyof FormState, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit() {
        if (!isValid) {
            setError("All fields are required.");
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            await userService.addStudent(courseId, {
                userCode: form.userCode.trim(),
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
            });

            setSuccess(true);
            setForm(initialForm);

            onSuccess();
            setTimeout(() => setSuccess(false), 2500);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    }

    const fields: {
        name: keyof FormState;
        label: string;
        placeholder: string;
        type?: string;
    }[] = [
        { name: "userCode", label: "Student code *", placeholder: "r1234567" },
        {
            name: "email",
            label: "Email *",
            placeholder: "jane.doe@student.ucll.be",
            type: "email",
        },
        { name: "firstName", label: "First name *", placeholder: "Jane" },
        { name: "lastName", label: "Last name *", placeholder: "Doe" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-base font-semibold">Add student</h2>
                    <button onClick={onClose} className="text-gray-400">
                        <FaTimes />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="px-6 py-5 grid grid-cols-2 gap-3">
                        {fields.map((field) => (
                            <div
                                key={field.name}
                                className="flex flex-col gap-1"
                            >
                                <label className="text-xs text-gray-500 font-medium">
                                    {field.label}
                                </label>
                                <input
                                    value={form[field.name]}
                                    onChange={(e) =>
                                        updateField(field.name, e.target.value)
                                    }
                                    placeholder={field.placeholder}
                                    type={field.type || "text"}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                        ))}

                        {/* Messages */}
                        {error && (
                            <div className="col-span-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                <FaExclamationTriangle />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="col-span-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                <FaCheck />
                                Student added successfully.
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-6 py-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                        >
                            Close
                        </button>

                        <button
                            type="submit"
                            disabled={submitting || !isValid}
                            className="px-4 py-2 text-sm bg-black text-white rounded-lg disabled:opacity-40"
                        >
                            {submitting ? "Adding…" : "Add student"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
