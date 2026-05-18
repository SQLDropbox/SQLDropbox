"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Header from "@/components/header";
import AdminCourseDetailsHeader from "@/components/admin/course/adminCourseDetailsHeader";
import AdminChapterCard from "@/components/admin/chapter/adminChapterCard";

import { Course } from "@/types/types";
import { courseService } from "@/services/courseService";

export default function Page() {
    const params = useParams();
    const courseId = params.courseId as string;

    const {data: course, isLoading, error,} = useQuery<Course>({queryKey: ["course", courseId],
    queryFn: () =>
            courseService.getCourseByCourseId(courseId),
        enabled: !!courseId,
    });

    if (isLoading) return <p>Loading...</p>;

    if (error || !course)
        return <p>Course not found</p>;

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