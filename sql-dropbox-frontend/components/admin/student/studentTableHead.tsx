"use client";

import { Course } from "@/types/types";
import { useTranslations, useLocale } from "next-intl";

const STAMP_ROTS = [-4, 3, -2, -2, 6, -4, 2, -4, 3, 6];
const stRot = (i: number) => STAMP_ROTS[Math.abs(i) % STAMP_ROTS.length];

const COL_CODE_W = "w-[100px] min-w-[100px]";
const COL_NAME_W = "w-[300px] min-w-[300px]";
const COL_CHAPTER_W = "w-[80px] min-w-[80px]";

type Props = {
    course: Course;
};

export default function StudentTableHead({ course }: Props) {
    const t = useTranslations("StudentTableHead");
    const locale = useLocale();

    return (
        <div className="flex border-b-2 border-border bg-surface-1 sticky top-0 z-20">
            {/* Code */}
            <div
                className={`${COL_CODE_W} p-3 font-display text-ink whitespace-nowrap shrink-0`}
            >
                {t("code")}
            </div>

            {/* Student */}
            <div
                className={`${COL_NAME_W} p-3 font-display text-ink whitespace-nowrap bg-surface-2 shrink-0 border-l border-border`}
            >
                {t("student")}
            </div>

            {/* Chapters */}
            {course.chapters?.map((chapter, i) => (
                <div
                    key={chapter.chapterId}
                    className={`
                        ${COL_CHAPTER_W} shrink-0
                        p-1 font-mono text-[11px] uppercase tracking-wider
                        text-muted text-center
                        border-l border-border
                        flex items-center justify-center overflow-hidden
                        ${i % 2 === 1 ? "bg-surface-2" : "bg-surface-1"}
                    `}
                >
                    <div
                        className="w-full text-center px-1 overflow-hidden text-ellipsis line-clamp-3"
                        style={{ transform: `rotate(${stRot(i)}deg)` }}
                        title={chapter.chapterNameEN}
                    >
                        <div
                            className="inline-block"
                            style={{ transform: `rotate(${stRot(i)}deg)` }}
                        >
                            {locale === "en"
                                ? chapter.chapterNameEN
                                : chapter.chapterNameNL}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export { COL_CODE_W, COL_NAME_W, COL_CHAPTER_W };
