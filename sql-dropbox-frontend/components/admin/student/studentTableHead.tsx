import { Course } from "@/types/types";
import { useTranslations, useLocale } from "next-intl";

const STAMP_ROTS = [-6, 5, -2, -5, 6, -4, 2, -5, 4, 6];
const stRot = (i: number) => STAMP_ROTS[Math.abs(i) % STAMP_ROTS.length];

type Props = {
    course: Course;
};

export default function StudentTableHead({ course }: Props) {
    const t = useTranslations("StudentTableHead");
    const locale = useLocale();
    return (
        <thead>
            <tr className="border-b-2 border-border divide-x divide-border bg-surface-1">
                <th className="p-3 font-display text-ink whitespace-nowrap">
                    {t("code")}
                </th>

                <th className="p-3 font-display text-ink whitespace-nowrap bg-surface-2">
                    {t("student")}
                </th>

                {course.chapters?.map((chapter, i) => (
                    <th
                        key={chapter.chapterId}
                        className={`
                            p-1 font-mono text-[11px] uppercase tracking-wider
                            text-muted text-center whitespace-nowrap
                            ${i % 2 === 1 ? "bg-surface-2" : "bg-surface-1"}
                        `}
                    >
                        <div
                            className="inline-block"
                            style={{
                                transform: `rotate(${stRot(i)}deg)`,
                            }}
                        >
                            {locale === "en" ? chapter.chapterNameEN : chapter.chapterNameNL}
                        </div>
                    </th>
                ))}
            </tr>
        </thead>
    );
}
