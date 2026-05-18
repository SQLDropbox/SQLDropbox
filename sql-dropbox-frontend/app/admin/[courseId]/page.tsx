"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Header from "@/components/header";
import AdminCourseDetailsHeader from "@/components/admin/course/adminCourseDetailsHeader";
import AdminChapterCard from "@/components/admin/chapter/adminChapterCard";

import { Course } from "@/types/types";
import { courseService } from "@/services/courseService";

export default function Page() {
    const params = useParams();
    const courseUrl = params.courseUrl as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const data =
                    await courseService.getCourseByCourseId(
                        courseUrl
                    );

                setCourse(data);
            } catch (err) {
                console.error("Failed to load course", err);
            } finally {
                setLoading(false);
            }
        };

        if (courseUrl) fetchCourse();
    }, [courseUrl]);

    if (loading) return <p>Loading...</p>;
    if (!course) return <p>Course not found</p>;

    return (
        <div>
            <Header />

            <div className="max-w-350 mx-auto p-6">
                <AdminCourseDetailsHeader course={course} />

                <div className="flex flex-col gap-4">
                    {course.chapters?.map((chapter) => (
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