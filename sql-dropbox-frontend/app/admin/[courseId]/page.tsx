"use client";

import { useParams } from "next/navigation";
import Header from "@/components/header";
import { Course } from "@/types/types";
import AdminCourseDetailsHeader from "@/components/admin/course/adminCourseDetailsHeader";
import AdminChapterCard from "@/components/admin/chapter/adminChapterCard";

export default function Page() {
    const params = useParams();

    const courseId = (params.courseId as string) ?? undefined;

    const course: Course = {
        courseId: courseId!,
        courseNameNL: "Inleiding tot Databases",
        courseNameEN: "Introduction to Databases",
        courseDescriptionNL: "Leer de basisprincipes van databases en SQL.",
        courseDescriptionEN: "Learn the fundamentals of databases and SQL.",
        lecturer: "Dr. Smith",
        deadline: new Date("2024-12-31"),
        isActive: true,
    };

    return (
        <div>
            <Header />
            <div className="max-w-350 mx-auto p-6">
                <AdminCourseDetailsHeader course={course} />
                <div className="flex flex-col gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <AdminChapterCard
                            key={i}
                            chapter={{
                                chapterId: i + 1,
                                chapterNameNL: `Hoofdstuk ${i + 1}`,
                                chapterNameEN: `Chapter ${i + 1}`,
                                chapterDescriptionNL: `Beschrijving van hoofdstuk ${i + 1}`,
                                chapterDescriptionEN: `Description of chapter ${i + 1}`,
                                courseId: course.courseId,
                                exerciseCount: 10,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
