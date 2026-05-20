"use client";

import Header from "@/components/header";
import { chapterService } from "@/services/chapterService";
import { Chapter } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/dist/client/link";
import { useParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function Page() {
    const params = useParams();

    const chapterId = (params.chapterId as string) ?? undefined;

    const { data, isLoading, error } = useQuery<Chapter>({
        queryKey: ["chapter", chapterId],
        queryFn: () => chapterService.getChapterByChapterId(chapterId!),
        enabled: !!chapterId,
    });

    console.log(data, isLoading, error);

    return (
        <div>
            <Header />
            <div className="max-w-350 mx-auto p-6">
                <Link
                    href={`/${params.courseId}`}
                    className="flex items-center text-blue-500 hover:text-blue-700 gap-1"
                >
                    <FaArrowLeft />
                    Back to course
                </Link>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg flex flex-col gap-6 mt-6">
                    test
                </div>
            </div>
        </div>
    );
}
