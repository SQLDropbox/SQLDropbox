"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Header from "@/components/header";
import { Course } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import AdminCourseNav from "@/components/admin/course/adminCourseNav";
import LecturerTable from "@/components/admin/lecturer/lecturerTable";
import Loading from "@/components/loading";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { courseService } from "@/services/courseService";
import AddLecturerModal from "@/components/admin/lecturer/addLecturerModal";

export default function LecturerPage() {
    const params = useParams();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const t = useTranslations("Course");

    const courseId = (params.courseId as string) ?? undefined;

    const {
        data: course,
        isLoading,
        refetch,
    } = useQuery<Course>({
        queryKey: ["course", courseId],
        queryFn: () => courseService.getCourseByCourseId(courseId!),
        enabled: !!courseId,
        retry: false,
    });

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="bg-paper text-ink min-h-screen flex flex-col">
            <Header />

            <div className="flex flex-1 relative">
                <div className="sticky top-0 h-screen overflow-y-auto">
                    <AdminCourseNav course={course!} />
                </div>

                <main className="flex-1 flex flex-col gap-6 overflow-y-auto p-8 md:p-12 max-w-7xl mx-auto">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink"
                    >
                        ← {t("backToCourses")}
                    </Link>

                    <LecturerTable
                        course={course!}
                        onAddManual={() => setIsAddModalOpen(true)}
                        onRemoveSuccess={() => refetch()}
                    />
                </main>
            </div>

            {isAddModalOpen && (
                <AddLecturerModal
                    courseId={courseId!}
                    currentLecturers={course?.lecturers ?? []}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        refetch();
        }}
    />
)}
        </div>
    );
}