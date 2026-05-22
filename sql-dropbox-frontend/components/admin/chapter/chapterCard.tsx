"use client";

import Link from "next/link";
import { FaClock, FaMedal, FaRegCircle } from "react-icons/fa6";
import { useLocale } from "next-intl";

function ProgressIcon({
    completed,
    total,
}: {
    completed: number;
    total: number;
}) {
    if (completed === 0) return <FaRegCircle className="text-xl text-muted" />;
    if (completed < total / 2)
        return <FaClock className="text-xl text-accent" />;
    if (completed < total) return <FaMedal className="text-xl text-muted" />;
    return <FaMedal className="text-xl text-yellow-500" />;
}

type Props = {
    chapter: any;
    index: number;
    courseId: string;
    rotation: string;
    isLast: boolean;
    height: string;
    overlap: string;
};

export default function ChapterCard({
    chapter,
    index,
    courseId,
    rotation,
    isLast,
    height,
    overlap,
}: Props) {
    const locale = useLocale();

    const name =
        locale === "en" ? chapter.chapterNameEN : chapter.chapterNameNL;

    const desc =
        locale === "en"
            ? chapter.chapterDescriptionEN
            : chapter.chapterDescriptionNL;

    const isComplete =
        chapter.completedAmount !== undefined &&
        chapter.amountOfExercises !== undefined &&
        chapter.completedAmount === chapter.amountOfExercises;

    const isFirst = index === 0;

    return (
        <Link
            href={`/${courseId}/chapter/${chapter.chapterId}`}
            style={{
                zIndex: index + 1,
                marginTop: overlap,
                height,
            }}
            className={`
                ${isFirst ? "mt-0" : "mt-[${overlap}]"}
                relative block
                bg-paper border border-border
                px-6 pt-5

                shadow-[0px_-3px_0px_0px_var(--color-border)]
                hover:shadow-[0px_-3px_0px_0px_var(--color-accent)]
                hover:border-accent

                transition-all duration-150
                ${rotation}
                hover:rotate-0
                hover:-translate-y-3
            `}
        >
            {/* ruled lines */}
            <div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{ opacity: 0.04 }}
            >
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="border-b border-ink"
                        style={{ height: "1.75rem" }}
                    />
                ))}
            </div>

            {/* content */}
            <div className="relative z-10 flex items-start gap-5">
                <span className="font-mono text-xs text-muted w-6">
                    {String(index + 1).padStart(2, "0")}
                </span>

                {chapter.amountOfExercises !== undefined && (
                    <ProgressIcon
                        completed={chapter.completedAmount}
                        total={chapter.amountOfExercises}
                    />
                )}

                <div className="flex-1 min-w-0">
                    <h2
                        className={`
                            font-display text-lg font-bold mb-1
                            ${isComplete ? "line-through text-muted" : "text-ink"}
                        `}
                    >
                        {name}
                    </h2>

                    <p className="font-mono text-xs text-muted line-clamp-2">
                        {desc}
                    </p>
                </div>

                {chapter.amountOfExercises !== undefined && (
                    <div className="font-mono text-[10px] border px-2 py-1 text-muted">
                        {chapter.completedAmount}/{chapter.amountOfExercises}
                    </div>
                )}
            </div>
        </Link>
    );
}
