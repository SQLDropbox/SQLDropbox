"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Chapter } from "@/types/types";
import ProgressIcon from "./progressIcon";

// --- Card visual config --- //

const CARD_HEIGHT = "10rem";
const CARD_OVERLAP = "-2rem";

const ROTATIONS = [
    "-rotate-[0.5deg]",
    "rotate-[0.4deg]",
    "-rotate-[0.3deg]",
    "rotate-[0.6deg]",
    "-rotate-[0.5deg]",
    "rotate-[0.4deg]",
];

export function getCardRotation(index: number): string {
    return ROTATIONS[index % ROTATIONS.length];
}

export { CARD_HEIGHT, CARD_OVERLAP };

// --- Ruled-line background --- //

function RuledLines() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[1]">
            {Array.from({ length: 20 }).map((_, i) => (
                <div
                    key={i}
                    className="border-b border-ink"
                    style={{ height: "1.75rem" }}
                />
            ))}
        </div>
    );
}

// --- ChapterCard --- //

type Props = {
    chapter: Chapter;
    index: number;
    courseId: string;
};

export default function ChapterCard({ chapter, index, courseId }: Props) {
    const locale = useLocale();

    const name =
        locale === "en" ? chapter.chapterNameEN : chapter.chapterNameNL;
    const desc =
        locale === "en"
            ? chapter.chapterDescriptionEN
            : chapter.chapterDescriptionNL;

    const hasProgress =
        chapter.completedAmount !== undefined &&
        chapter.amountOfExercises !== undefined;
    const isComplete =
        hasProgress && chapter.completedAmount === chapter.amountOfExercises;

    const rotation = getCardRotation(index);

    return (
        <Link
            href={`/${courseId}/chapter/${chapter.chapterId}`}
            style={{
                zIndex: index + 1,
                marginTop: index === 0 ? 0 : CARD_OVERLAP,
                height: CARD_HEIGHT,
            }}
            className={`
                relative block bg-ruled
                bg-paper border border-border
                px-6 pt-5
                shadow-[0px_-3px_0px_0px_var(--color-border)]
                hover:shadow-[0px_-3px_0px_0px_var(--color-accent)]
                hover:border-accent hover:rotate-0 hover:-translate-y-3
                transition-all duration-150
                ${rotation}
            `}
        >
            <div className="relative z-10 flex items-start gap-5">
                {/* Chapter number */}
                <span className="font-mono text-xs text-muted w-6">
                    {String(index + 1).padStart(2, "0")}
                </span>

                {/* Progress icon */}
                {hasProgress && (
                    <ProgressIcon
                        completed={chapter.completedAmount!}
                        total={chapter.amountOfExercises!}
                    />
                )}

                {/* Title & description */}
                <div className="flex-1 min-w-0">
                    <h2
                        className={`font-display text-lg font-bold mb-1 ${isComplete ? "line-through text-muted" : "text-ink"}`}
                    >
                        {name}
                    </h2>
                    <p className="font-mono text-xs text-muted line-clamp-2">
                        {desc}
                    </p>
                </div>

                {/* Progress counter */}
                {hasProgress && (
                    <div className="font-mono text-[10px] border px-2 py-1 text-muted">
                        {chapter.completedAmount}/{chapter.amountOfExercises}
                    </div>
                )}
            </div>
        </Link>
    );
}
