"use client";

import Header from "@/components/header";
import { courseService } from "@/services/courseService";
import { Course } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import CourseCard from "@/components/admin/course/courseCard";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
    const t = useTranslations("Course");
    const router = useRouter();

    const { data, isLoading, error } = useQuery<Course[]>({
        queryKey: ["courses"],
        queryFn: courseService.getCourses,
        retry: false,
    });

    useEffect(() => {
        if (data?.length === 1) {
            router.push(`/${data[0].courseId}`);
        }
    }, [data, router]);

    return (
        <div className="bg-paper text-ink min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 relative">
                {/* Page header */}
                <div className="mb-12 rotate-1">
                    <h1 className="font-display text-5xl font-bold leading-tight tracking-tight border-b-4 border-accent inline-block pb-2">
                        {t("title")}
                    </h1>
                </div>

                {/* Loading state */}
                {isLoading && (
                    <p className="font-mono text-sm text-muted mt-6 italic">
                        {t("loading")}
                    </p>
                )}

                {/* Error state */}
                {error && (
                    <p className="font-mono text-sm text-error mt-6">
                        {t("error")}
                    </p>
                )}

                {/* Empty state */}
                {data?.length === 0 && !isLoading && (
                    <p className="font-mono text-sm text-muted mt-6 italic">
                        {t("empty")}
                    </p>
                )}

                {/* Course grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 pb-24">
                    {data?.map((course, index) => (
                        <CourseCard
                            key={course.courseId}
                            course={course}
                            index={index}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
