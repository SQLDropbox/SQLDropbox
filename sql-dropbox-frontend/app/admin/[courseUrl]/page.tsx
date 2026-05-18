"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Header from "@/components/header";
import AdminCourseDetailsHeader from "@/components/admin/course/adminCourseDetailsHeader";
import AdminChapterCard from "@/components/admin/chapter/adminChapterCard";
import { Chapter, Course } from "@/types/types";

import { courseService } from "@/services/courseService";

export default function Page() {
    const params = useParams();

    const courseUrl = (params.courseUrl as string) ?? undefined;

    const course: Course = {
        courseId: 1,
        courseNameNL: "Inleiding tot Databases",
        courseNameEN: "Introduction to Databases",
        courseDescriptionNL: "Leer de basisprincipes van databases en SQL.",
        courseDescriptionEN: "Learn the fundamentals of databases and SQL.",
        lecturer: "Dr. Smith",
        deadline: new Date("2024-12-31"),
        isActive: true,
        url: courseUrl,
    };

    return (
        <div>
            <Header />

            <div className="max-w-350 mx-auto p-6">
                <AdminCourseDetailsHeader course={course} />

                <div className="flex flex-col gap-4">
                    {course.chapters?.map((chapter: Chapter) => (
                        <AdminChapterCard
                            key={chapter.chapterId}
                            chapter={chapter}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}