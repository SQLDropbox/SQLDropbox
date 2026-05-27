"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Chapter } from "@/types/types";
import ProgressIcon from "./progressIcon";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiEdit2 } from "react-icons/fi";
import { RiDraggable } from "react-icons/ri";
import { HiOutlineClipboardList } from "react-icons/hi";

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

type Props = {
    chapter: Chapter;
    index: number;
    courseId: string;
    adminMode?: boolean;
    onEdit?: (chapter: Chapter) => void;
};

export default function ChapterCard({
    chapter,
    index,
    courseId,
    adminMode = false,
    onEdit,
}: Props) {
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

    const rotation = ROTATIONS[index % ROTATIONS.length];

    // DnD kit sortable — only active in admin mode
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: String(chapter.chapterId),
        disabled: !adminMode,
    });

    const dndStyle = adminMode
        ? {
              transform: CSS.Transform.toString(transform),
              transition: isDragging ? "none" : transition,
              zIndex: isDragging ? 50 : index + 1,
              willChange: isDragging ? "transform" : "auto",
              position: "relative",
          }
        : { zIndex: index + 1 };

    const cardClass = `
        relative block bg-ruled bg-paper border border-border
        px-6 pt-5
        shadow-[0px_-3px_0px_0px_var(--color-border)]
        transition-all duration-150
        ${
            adminMode
                ? `hover:border-accent hover:shadow-[0px_-3px_0px_0px_var(--color-accent)] ${isDragging ? "opacity-50 rotate-0" : ""}`
                : `hover:shadow-[0px_-3px_0px_0px_var(--color-accent)] hover:border-accent hover:rotate-0 hover:-translate-y-3 ${rotation}`
        }
    `;

    const content = (
        <div className="relative z-10 flex items-start gap-4 h-full">
            {/* Drag handle — admin only */}
            {adminMode && (
                <span
                    {...attributes}
                    {...listeners}
                    className="mt-0.5 cursor-grab active:cursor-grabbing text-muted hover:text-ink transition-colors touch-none select-none"
                >
                    <RiDraggable className="w-4 h-4" />
                </span>
            )}

            {/* Chapter number */}
            <span className="font-mono text-xs text-muted w-6 mt-0.5">
                {String(index + 1).padStart(2, "0")}
            </span>

            {/* Progress icon — student only */}
            {!adminMode && hasProgress && (
                <ProgressIcon
                    completed={chapter.completedAmount!}
                    total={chapter.amountOfExercises!}
                />
            )}

            {/* Title & description */}
            <div className="flex-1 min-w-0">
                <h2
                    className={`font-display text-lg font-bold mb-1 ${
                        isComplete && !adminMode
                            ? "line-through text-muted"
                            : "text-ink"
                    }`}
                >
                    {name}
                </h2>
                <p className="font-mono text-xs text-muted line-clamp-2">
                    {desc}
                </p>
            </div>

            {/* Right-side controls */}
            {adminMode ? (
                <div className="flex items-center gap-1 mt-0.5">
                    {/* Questions button */}
                    <Link
                        href={`/${courseId}/chapter/${chapter.chapterId}`}
                        className="
                            inline-flex items-center gap-1.5
                            font-mono text-[10px] uppercase tracking-widest
                            border border-border px-2.5 py-1.5 text-muted
                            hover:bg-ink hover:text-paper hover:border-ink
                            transition-all duration-100
                        "
                        onClick={(e) => e.stopPropagation()}
                    >
                        <HiOutlineClipboardList className="w-3 h-3" />
                        Questions
                    </Link>

                    {/* Edit button */}
                    <button
                        className="
                            inline-flex items-center gap-1.5
                            font-mono text-[10px] uppercase tracking-widest
                            border border-border px-2.5 py-1.5 text-muted
                            hover:bg-ink hover:text-paper hover:border-ink
                            transition-all duration-100
                        "
                        onClick={(e) => {
                            e.preventDefault();
                            onEdit?.(chapter);
                        }}
                    >
                        <FiEdit2 className="w-3 h-3" />
                        Edit
                    </button>
                </div>
            ) : (
                hasProgress && (
                    <div className="font-mono text-[10px] border px-2 py-1 text-muted">
                        {chapter.completedAmount}/{chapter.amountOfExercises}
                    </div>
                )
            )}
        </div>
    );

    if (adminMode) {
        return (
            <div
                ref={setNodeRef}
                style={{
                    ...dndStyle,
                    marginTop: index === 0 ? 0 : CARD_OVERLAP,
                    height: CARD_HEIGHT,
                }}
                className={cardClass}
            >
                {content}
            </div>
        );
    }

    return (
        <Link
            href={`/${courseId}/chapter/${chapter.chapterId}`}
            style={{
                zIndex: index + 1,
                marginTop: index === 0 ? 0 : CARD_OVERLAP,
                height: CARD_HEIGHT,
            }}
            className={cardClass}
        >
            {content}
        </Link>
    );
}
