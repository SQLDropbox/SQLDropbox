"use client";

import Header from "@/components/header";
import { useAuth } from "@/hooks/useAuth";
import { courseService } from "@/services/courseService";
import { Course } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import ChapterCard from "@/components/admin/chapter/chapterCard";
import Loading from "@/components/loading";

const documentRotations = [
    "-rotate-[0.5deg]",
    "rotate-[0.4deg]",
    "-rotate-[0.3deg]",
    "rotate-[0.6deg]",
    "-rotate-[0.5deg]",
    "rotate-[0.4deg]",
];

const CARD_HEIGHT = "14rem";
const CARD_OVERLAP = "-8rem";

export default function Page() {
    const params = useParams();
    const { isStudent } = useAuth();
    const locale = useLocale();
    const t = useTranslations("Course");

    const courseId = params.courseId as string | undefined;

    const { data, isLoading, error } = useQuery<Course>({
        queryKey: ["course", courseId],
        queryFn: () => courseService.getCourseByCourseId(courseId!),
        enabled: !!courseId,
        retry: false,
    });

    if (error) notFound();

    const courseName =
        locale === "en" ? data?.courseNameEN : data?.courseNameNL;

    const courseDesc =
        locale === "en" ? data?.courseDescriptionEN : data?.courseDescriptionNL;

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="bg-paper text-ink min-h-screen flex flex-col">
            <Header />

            <main className="grow max-w-7xl mx-auto w-full px-6 py-12">
                {!(isStudent && data?.totalCourseCount === 1) && (
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink mb-10"
                    >
                        ← {t("backToCourses")}
                    </Link>
                )}

                <div className="relative z-10 bg-surface-2 border-2 border-border shadow-[6px_6px_0px_0px_var(--color-border)]">
                    {/* Tab */}
                    <div
                        className={`
                            absolute -top-6 -left-px min-w-[30%]
                            bg-surface-2
                            px-4 py-1
                            border border-border border-b-0
                        `}
                    >
                        <span className="font-mono text-xs uppercase tracking-wider text-muted">
                            ID: {courseId?.toUpperCase() ?? "—"}
                        </span>
                    </div>

                    {/* Header */}
                    <div className="border-b-2 border-border px-8 pt-8 pb-6">
                        <h1 className="font-display text-4xl font-bold mb-3">
                            {courseName}
                        </h1>

                        <p className="font-mono text-sm text-muted max-w-2xl">
                            {courseDesc}
                        </p>
                    </div>

                    {/* Chapters */}
                    <div className="px-8 pt-8 -mb-5">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-6 border-l-2 border-accent pl-3">
                            {t("chaptersLabel") ?? "Chapters"}
                        </p>

                        <div className="relative mt-40">
                            {data?.chapters?.map((chapter, index) => {
                                const rotation =
                                    documentRotations[
                                        index % documentRotations.length
                                    ];

                                const isLast =
                                    index === (data?.chapters?.length ?? 0) - 1;

                                return (
                                    <ChapterCard
                                        key={chapter.chapterId}
                                        chapter={chapter}
                                        index={index}
                                        courseId={courseId!}
                                        rotation={rotation}
                                        isLast={isLast}
                                        height={CARD_HEIGHT}
                                        overlap={CARD_OVERLAP}
                                    />
                                );
                            })}
                        </div>

                        {(!data?.chapters || data.chapters.length === 0) && (
                            <p className="font-mono text-sm text-muted italic">
                                {t("noChapters") ?? "No chapters yet."}
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="relative z-20 border-t border-border bg-surface-2 px-8 py-6 flex justify-between items-center">
                        {/* Tab */}
                        <div
                            className={`
                            absolute -top-6 -right-px min-w-[30%]
                            bg-surface-2
                            px-4 py-1
                            border border-border border-b-0
                        `}
                        >
                            <span className="font-mono text-xs uppercase tracking-wider text-muted">
                                ID: {courseId?.toUpperCase() ?? "—"}
                            </span>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                            {courseId?.toUpperCase()}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                            {data?.lecturer}
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}
