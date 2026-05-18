"use client";

import Header from "@/components/header";
import { courseService } from "@/services/courseService";
import { Course } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { FaBookOpen } from "react-icons/fa6";

export default function Page() {
    const params = useParams();

    const courseUrl = (params.courseUrl as string) ?? undefined;

    const { data, isLoading, error } = useQuery<Course>({
        queryKey: ["course", courseUrl],
        queryFn: () => courseService.getCourseByCourseUrl(courseUrl!),
        enabled: !!courseUrl,
    });

    console.log("data:", data);

    return (
        <div>
            <Header />
            <div className="max-w-350 mx-auto p-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600 text-2xl shrink-0">
                            <FaBookOpen />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-semibold text-gray-900">
                                {data?.courseNameEN}
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Lecturer:{" "}
                                <span className="font-medium text-gray-700">
                                    {data?.lecturer}
                                </span>
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-gray-600 line-clamp-3">
                        {data?.courseDescriptionEN}
                    </p>

                    {data?.chapters?.map((chapter) => (
                        <div
                            key={chapter.chapterId}
                            className="rounded-xl border border-gray-300 bg-gray p-6 shadow-lg cursor-pointer"
                        >
                            <h2 className="text-xl font-semibold text-gray-900">
                                {chapter.chapterNameEN}
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                {chapter.chapterDescriptionEN}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
