"use client";

import { useState } from "react";
import { Lecturer } from "@/types/types";
import { FiTrash2 } from "react-icons/fi";
import { FaTimes, FaUserMinus } from "react-icons/fa";
import { courseService } from "@/services/courseService";
import { useTranslations } from "next-intl";

export default function LecturerTableRow({
    lecturer,
    courseId,
    rowIndex,
    onRemoveSuccess,
}: {
    lecturer: Lecturer;
    courseId: string;
    rowIndex: number;
    onRemoveSuccess: () => void;
}) {
    const t = useTranslations("LecturerTableRow");
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    const isEvenRow = rowIndex % 2 === 0;
    const rowBg = isDeleting 
        ? "bg-[rgba(108,18,8,0.12)] animate-pulse" 
        : isEvenRow ? "bg-paper" : "bg-surface-3";

    const handleRemove = async () => {
        setShowConfirm(false);
        setIsDeleting(true);
        
        try {
            await courseService.removeLecturerFromCourse(courseId, lecturer.userId);
            onRemoveSuccess();
        } catch (err) {
            alert(t("removeFailed"));
            setIsDeleting(false);
        }
    };

    return (
        <tr className={`group border-b border-border divide-x divide-border ${rowBg} transition-colors`}>
            {/* ID */}
            <td className="p-3 font-mono text-[11px] text-muted tracking-wide uppercase whitespace-nowrap">
                {lecturer.userCode.split('-')[0]}
            </td>

            {/* Name */}
            <td className="p-3 font-bold text-ink whitespace-nowrap bg-black/[0.035]">
                {lecturer.firstName} {lecturer.lastName}
            </td>

            {/* Role */}
            <td className="p-3 font-mono text-[10px] text-muted tracking-widest uppercase whitespace-nowrap text-right">
                {t("primaryLecturer")}
            </td>

            {/* Actions (Vuilnisbakje + Modal) */}
            <td className="p-2 text-center whitespace-nowrap relative">
                <button
                    onClick={() => setShowConfirm(true)}
                    disabled={isDeleting}
                    className="
                        p-2 text-muted hover:text-accent border border-transparent 
                        hover:border-border hover:bg-paper transition-all duration-150
                        disabled:opacity-50
                    "
                    title={t("removeInstructorTitle")}
                >
                    <FiTrash2 className="text-sm" />
                </button>

                {/* --- CUSTOM CONFIRM MODAL --- */}
                {showConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm text-left whitespace-normal">
                        <div className="relative w-full max-w-sm bg-paper border-2 border-border shadow-[8px_8px_0px_0px_var(--color-border)] p-8">
                            
                            {/* Tape detail */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-surface-1/50 border border-border/20 shadow-[0_1px_2px_rgba(0,0,0,0.05)] rotate-2 z-10" />

                            <button
                                onClick={() => setShowConfirm(false)}
                                className="absolute top-4 right-4 text-muted hover:text-ink transition-colors"
                            >
                                <FaTimes />
                            </button>

                            <div className="mb-6 border-b-2 border-accent pb-4 mt-2">
                                <h2 className="font-display text-xl font-bold text-accent uppercase tracking-tighter mb-1">
                                    {t("confirmTitle")}
                                </h2>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                                    {t("confirmSubtitle")}
                                </p>
                            </div>

                            <div className="mb-8 font-mono text-sm text-ink leading-relaxed">
                                <p>
                                    {t("confirmDescriptionBefore")} <strong>{lecturer.firstName} {lecturer.lastName}</strong> {t("confirmDescriptionAfter")}
                                </p>
                                <p className="text-[10px] uppercase tracking-wider text-muted mt-4 border-l-2 border-accent pl-2">
                                    {t("confirmImpact", { courseId: courseId.toUpperCase() })}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-dashed border-border">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(false)}
                                    className="
                                        px-4 py-2 border border-border
                                        font-mono text-xs uppercase tracking-widest text-muted
                                        hover:bg-surface-1 hover:text-ink transition-colors
                                    "
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    onClick={handleRemove}
                                    className="
                                        flex items-center gap-2
                                        px-4 py-2 border-2 border-accent bg-[rgba(108,18,8,0.1)] text-accent
                                        font-mono text-xs uppercase tracking-widest
                                        hover:bg-accent hover:text-paper transition-colors
                                    "
                                >
                                    <FaUserMinus /> {t("confirm")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </td>
        </tr>
    );
}