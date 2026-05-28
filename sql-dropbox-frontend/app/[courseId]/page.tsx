"use client";

import Header from "@/components/header";
import { useAuth } from "@/hooks/useAuth";
import { courseService } from "@/services/courseService";
import { Course } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Loading from "@/components/loading";
import ChapterCard from "@/components/admin/chapter/chapterCard";

export default function Page() {
    const params = useParams();
    const locale = useLocale();
    const t = useTranslations("Course");
    const { isStudent } = useAuth();

    const courseId = params.courseId as string | undefined;

    const { data, isLoading, error } = useQuery<Course>({
        queryKey: ["course", courseId],
        queryFn: () => courseService.getCourseByCourseId(courseId!),
        enabled: !!courseId,
        retry: false,
    });

    if (error) notFound();
    if (isLoading) return <Loading />;

    const courseName =
        locale === "en" ? data?.courseNameEN : data?.courseNameNL;
    const courseDesc =
        locale === "en" ? data?.courseDescriptionEN : data?.courseDescriptionNL;

    const showBackLink = !(isStudent && data?.totalCourseCount === 1);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="grow max-w-7xl mx-auto w-full px-6 py-12">
                {showBackLink && (
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink mb-10"
                    >
                        ← {t("backToCourses")}
                    </Link>
                )}

                <div className="relative z-10 bg-[linear-gradient(to_bottom,var(--color-surface-1),var(--color-surface-2))] border-2 border-border shadow-[6px_6px_0px_0px_var(--color-border)]">
                    {/* Top tab */}
                    <div className="absolute -top-6 -left-0.5 min-w-[30%] bg-surface-1 px-4 py-1 border-2 border-border border-b-0">
                        <span className="font-mono text-xs uppercase tracking-wider text-muted">
                            ID: {courseId?.toUpperCase() ?? "—"}
                        </span>
                    </div>

                    {/* Course header */}
                    <div className="border-b-2 border-border px-8 pt-8 pb-6">
                        <h1 className="font-display text-4xl font-bold mb-3">
                            {courseName}
                        </h1>
                        <p className="font-mono text-sm text-muted max-w-2xl">
                            {courseDesc}
                        </p>
                    </div>

                    {/* Chapters */}
                    <div className="px-8 pt-8 -mb-10">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-6 border-l-2 border-accent pl-3">
                            {t("chaptersLabel") ?? "Chapters"}
                        </p>

                        {data?.chapters?.length === 0 ? (
                            <div className="relative">
                                <div
                                    className="
                                        relative bg-ruled bg-paper border border-border
                                        px-6 shadow-[0px_-3px_0px_0px_var(--color-border)]
                                        h-40
                                        flex items-center justify-center pb-8
                                    "
                                >
                                    <p className="font-mono text-sm text-muted text-center max-w-md">
                                        {t("noChapters")}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                {data?.chapters?.map((chapter, index) => (
                                    <ChapterCard
                                        key={chapter.chapterId}
                                        chapter={chapter}
                                        index={index}
                                        courseId={courseId!}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="relative z-20 border-t border-border bg-[linear-gradient(to_bottom,var(--color-surface-1),var(--color-surface-2))] px-8 py-6 flex justify-between items-center">
                        {/* Bottom-right tab */}
                        <div className="absolute -top-6 -right-px min-w-[30%] bg-surface-1 px-4 h-8 border border-border border-b-0" />

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
