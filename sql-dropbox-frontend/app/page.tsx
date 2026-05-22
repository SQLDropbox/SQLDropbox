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
        <div>
            <Header />

            <div className="max-w-350 mx-auto p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1>{t("title")}</h1>
                    </div>
                </div>

                {isLoading && (
                    <p className="mt-6 text-gray-500">{t("loading")}</p>
                )}

                {error && <p className="mt-6 text-red-500">{t("error")}</p>}

                {data?.length === 0 && !isLoading && (
                    <p className="mt-6 text-gray-500">{t("empty")}</p>
                )}

                <div className="grid grid-cols-3 gap-6 my-6">
                    {data?.map((course) => (
                        <CourseCard key={course.courseId} course={course} />
                    ))}
                </div>
            </div>
        </div>
    );
}
