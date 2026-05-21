"use client";

import Header from "@/components/header";
import { courseService } from "@/services/courseService";
import { Course } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { FaExclamationCircle } from "react-icons/fa";
import {
    FaBookOpen,
    FaCircleXmark,
    FaClock,
    FaMedal,
    FaRegCircle,
    FaArrowLeft,
} from "react-icons/fa6";

export default function Page() {
    const params = useParams();

    const courseId = (params.courseId as string) ?? undefined;

    const { data, isLoading, error } = useQuery<Course>({
        queryKey: ["course", courseId],
        queryFn: () => courseService.getCourseByCourseId(courseId!),
        enabled: !!courseId,
        retry: false,
    });

    if (error) {
        notFound();
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />

                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                    <p className="text-sm text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className="max-w-350 mx-auto p-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg flex flex-col gap-6">
                    <Link
                    href="/"
                    className="flex items-center text-blue-500 hover:text-blue-700 gap-1"
                >
                    <FaArrowLeft />
                    Back to courses
                </Link>
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
                        <Link
                            key={chapter.chapterId}
                            href={`/${courseId}/chapter/${chapter.chapterId}`}
                            className="flex items-center gap-6 rounded-xl border border-gray-300 bg-gray-100 bg-gray px-6 py-4 cursor-pointer"
                        >
                            <div className="flex gap-1">
                                <FaMedal
                                    className="text-2xl text-yellow-500"
                                    title="Completed"
                                />
                                <FaMedal
                                    className="text-2xl text-gray-400"
                                    title="Halfway"
                                />
                                <FaClock
                                    className="text-2xl text-blue-500"
                                    title="Started"
                                />
                                <FaRegCircle
                                    className="text-2xl text-gray-400"
                                    title="Not Started"
                                />
                                <FaExclamationCircle
                                    className="text-2xl text-orange-400"
                                    title="Deadline almost passed"
                                />
                                <FaCircleXmark
                                    className="text-2xl text-red-500"
                                    title="Deadline passed"
                                />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {chapter.chapterNameEN}
                                </h2>
                                <p className="mt-2 text-sm text-gray-500">
                                    {chapter.chapterDescriptionEN}
                                </p>
                            </div>
                            <div className="bg-black text-white text-sm rounded-lg px-2 py-1">
                                0 / {chapter.amountOfExercises}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
