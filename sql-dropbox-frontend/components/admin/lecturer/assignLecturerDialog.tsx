"use client";

import { useState } from "react";
import { FaTimes, FaUserPlus, FaCheck } from "react-icons/fa";
import { courseService } from "@/services/courseService";
import { userService } from "@/services/userService";
import { useQuery } from "@tanstack/react-query";
import { Lecturer } from "@/types/types";
import { useTranslations } from "next-intl";

type Props = {
    courseId: string;
    currentLecturers: Lecturer[];
    onClose: () => void;
    onSuccess: () => void;
};

export default function AsssignLecturerDialog({ courseId, currentLecturers, onClose, onSuccess }: Props) {
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations("LecturerTable");

    const { data: allLecturers, isLoading: isLoadingLecturers } = useQuery<Lecturer[]>({
        queryKey: ["all-lecturers"],
        queryFn: () => userService.getAllLecturers(),
    });

    const availableLecturers = allLecturers?.filter(
        (lecturer) => !currentLecturers.some((cl) => cl.userId === lecturer.userId)
    ) ?? [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUserIds.length === 0) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await Promise.all(
                selectedUserIds.map((id) => courseService.addLecturerToCourse(courseId, id))
            );
            
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to assign instructors.");
            setIsSubmitting(false);
        }
    };

    const handleCheckboxChange = (userId: string, isChecked: boolean) => {
        setSelectedUserIds((prev) =>
            isChecked ? [...prev, userId] : prev.filter((id) => id !== userId)
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-paper border-2 border-border shadow-[8px_8px_0px_0px_var(--color-border)] p-8">
                
                {/* Tape detail */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-surface-1/50 border border-border/20 shadow-[0_1px_2px_rgba(0,0,0,0.05)] rotate-2 z-10" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted hover:text-ink transition-colors"
                >
                    <FaTimes />
                </button>

                <div className="mb-8 border-b-2 border-accent pb-4">
                        <h2 className="font-display text-2xl font-bold text-accent uppercase tracking-tighter mb-1">
                        {t("modal.title")}
                    </h2>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                        {t("modal.authorization", { courseId: courseId.toUpperCase() })}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-[rgba(108,18,8,0.06)] border-l-4 border-accent font-mono text-xs text-accent">
                        {t("modal.errorPrefix")} {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label 
                            className="font-mono text-[11px] uppercase tracking-widest text-ink font-bold"
                        >
                            {t("modal.selectInstructor")}
                        </label>
                        
                        {isLoadingLecturers ? (
                            <div className="bg-surface-1 border border-border p-4">
                                <p className="font-mono text-[11px] text-muted uppercase tracking-widest italic animate-pulse">
                                    {t("modal.loadingInstructors")}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-surface-1 border border-border p-2 max-h-52 overflow-y-auto flex flex-col gap-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                                {availableLecturers.length === 0 ? (
                                    <div className="p-3 text-center">
                                        <p className="font-mono text-[11px] text-accent uppercase tracking-wider">
                                            {t("modal.noAvailableInstructors")}
                                        </p>
                                    </div>
                                ) : (
                                    availableLecturers.map((l) => {
                                        const isChecked = selectedUserIds.includes(l.userId);
                                        return (
                                            <label
                                                key={l.userId}
                                                className="flex items-center gap-3 p-2 hover:bg-paper cursor-pointer border border-transparent hover:border-border transition-colors group"
                                            >
                                                <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => handleCheckboxChange(l.userId, e.target.checked)}
                                                        className="peer appearance-none w-4 h-4 border-2 border-border checked:bg-accent checked:border-accent cursor-pointer transition-colors"
                                                    />
                                                    <FaCheck className="absolute text-paper text-[10px] pointer-events-none opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-transform" />
                                                </div>
                                                
                                                {/* Label Tekst */}
                                                <span className="font-mono text-[11px] text-ink uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                                                    {l.firstName} {l.lastName} <span className="text-muted">({l.userCode.toUpperCase()})</span>
                                                </span>
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {availableLecturers.length === 0 && !isLoadingLecturers && (
                            <p className="font-mono text-[10px] text-accent uppercase tracking-wider mt-1">
                                {t("modal.allAssignedNote")}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-dashed border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                px-4 py-2 border border-border
                                font-mono text-xs uppercase tracking-widest text-muted
                                hover:bg-surface-1 hover:text-ink transition-colors
                            "
                            disabled={isSubmitting}
                        >
                            {t("modal.cancel")}
                        </button>
                        <button
                            type="submit"
                            className="
                                flex items-center gap-2
                                px-4 py-2 border-2 border-accent bg-accent
                                font-mono text-xs uppercase tracking-widest text-paper
                                hover:bg-paper hover:text-accent transition-colors
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                            disabled={isSubmitting || selectedUserIds.length === 0}
                        >
                            {isSubmitting ? t("modal.processing") : <><FaUserPlus /> {t("modal.assign")}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}