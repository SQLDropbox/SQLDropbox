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

    const courseUrl = params.courseUrl as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const data =
                    await courseService.getCourseByCourseUrl(
                        courseUrl
                    );

                setCourse(data);
            } catch (error) {
                console.error("Failed to fetch course:", error);
            } finally {
                setLoading(false);
            }
        };

        if (courseUrl) {
            fetchCourse();
        }
    }, [courseUrl]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!course) {
        return <p>Course not found.</p>;
    }

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