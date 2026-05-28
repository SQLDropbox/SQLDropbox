"use client";

import Header from "@/components/header";
import { courseService } from "@/services/courseService";
import { Course } from "@/types/types";
import { FaPlus, FaUserPlus } from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import EditCourseDialog from "@/components/admin/course/editCourseDialog";
import { useState } from "react";
import CourseCard from "@/components/admin/course/courseCard";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import AddLecturerDialog from "@/components/admin/lecturer/addLecturerDialog";

export default function Page() {
    const { isAdmin } = useAuth();
    const t = useTranslations("Course");

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
        const [addLecturerDialogOpen, setAddLecturerDialogOpen] = useState(false);

    const { data, isLoading, error, refetch } = useQuery<Course[]>({
        queryKey: ["courses"],
        queryFn: courseService.getCourses,
    });

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="grow max-w-7xl mx-auto w-full px-6 py-12 relative">
                {/* Header */}
                <div className="mb-12 flex items-start justify-between gap-6">
                    <div className="rotate-1">
                        <h1 className="font-display text-5xl font-bold leading-tight tracking-tight border-b-4 border-accent inline-block pb-2">
                            {t("manageTitle")}
                        </h1>
                    </div>

                    {isAdmin && (
                        <div className="flex items-center gap-4">
                            {/* NEW LECTURER */}
                            <button
                                onClick={() => setAddLecturerDialogOpen(true)}
                                className="
                                    flex items-center gap-2
                                    border-2 border-accent text-accent
                                    px-4 py-2
                                    font-mono text-xs uppercase tracking-widest
                                    hover:bg-accent hover:text-paper
                                    transition-colors
                                "
                            >
                                <FaUserPlus />
                                NEW LECTURER
                            </button>

                            {/* NEW COURSE */}
                            <button
                                onClick={() => {
                                    setSelectedCourse(null);
                                    setEditDialogOpen(true);
                                }}
                                className="
                                    flex items-center gap-2
                                    border-2 border-accent text-accent
                                    px-4 py-2
                                    font-mono text-xs uppercase tracking-widest
                                    hover:bg-accent hover:text-paper
                                    transition-colors
                                "
                            >
                                <FaPlus />
                                {t("newCourse")}
                            </button>
                        </div>
                    )}
                </div>

                {/* Loading */}
                {isLoading && (
                    <p className="font-mono text-sm text-muted italic mt-6">
                        {t("loading")}
                    </p>
                )}

                {/* Error */}
                {error && (
                    <p className="font-mono text-sm text-error mt-6">
                        {t("error")}
                    </p>
                )}

                {/* Empty */}
                {data?.length === 0 && !isLoading && (
                    <p className="font-mono text-sm text-muted italic mt-6">
                        {t("empty")}
                    </p>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 md:gap-x-12 md:gap-y-18 pb-24">
                    {data?.map((course, index) => (
                        <CourseCard
                            key={course.courseId}
                            course={course}
                            index={index}
                            onEdit={() => {
                                setSelectedCourse(course);
                                setEditDialogOpen(true);
                            }}
                            adminMode
                        />
                    ))}
                </div>
            </main>

            {/* Dialog */}
            <EditCourseDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onSuccess={refetch}
                mode={selectedCourse ? "edit" : "add"}
                course={selectedCourse ?? undefined}
            />
             <AddLecturerDialog
                open={addLecturerDialogOpen}
                onClose={() => setAddLecturerDialogOpen(false)}
            />
        </div>
    );
}
