import { Course } from "@/types/types";

type Props = {
    course: Course;
};

export default function StudentTableHead({ course }: Props) {
    return (
        <thead>
            <tr className="border-b-2 border-border bg-surface-1">
                <th className="p-3 font-display text-ink border-r border-border whitespace-nowrap bg-surface-1">
                    CODE
                </th>
                
                <th className="p-3 font-display text-ink border-r border-border whitespace-nowrap bg-surface-1">
                    STUDENT
                </th>

                {course.chapters?.map((chapter, i) => (
                    <th
                        key={chapter.chapterId}
                        className={[
                            "p-1 font-mono text-[11px] uppercase tracking-wider text-muted text-center",
                            i < (course.chapters?.length ?? 0) - 1
                                ? "border-r border-border"
                                : "",
                            i % 2 === 1 ? "bg-surface-2" : "",
                        ].join(" ")}
                    >
                        {chapter.chapterNameEN}
                    </th>
                ))}
            </tr>
        </thead>
    );
}
