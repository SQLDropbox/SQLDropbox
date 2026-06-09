"use client";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";

import { Chapter } from "@/types/types";
import AdminChapterCard from "@/components/admin/chapter/adminChapterCard";

interface SortableChapterListProps {
    chapters: Chapter[];
    onReorder: (orderedIds: string[]) => Promise<void>;
    onEditChapter: (chapter: Chapter) => void;
}

export default function SortableChapterList({ chapters, onReorder, onEditChapter }: SortableChapterListProps) {
    const [chapterIds, setChapterIds] = useState<string[]>([]);
    const sortedChapters = useMemo(() => {
        return [...chapters].sort((left, right) => {
            const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
            const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;

            if (leftOrder !== rightOrder) {
                return leftOrder - rightOrder;
            }

            return left.chapterId - right.chapterId;
        });
    }, [chapters]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    useEffect(() => {
        setChapterIds(sortedChapters.map((chapter) => String(chapter.chapterId)));
    }, [sortedChapters]);

    if (chapters.length === 0) return null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={async (event) => {
                const { active, over } = event;
                if (!over || active.id === over.id) return;

                const oldIndex = chapterIds.indexOf(String(active.id));
                const newIndex = chapterIds.indexOf(String(over.id));
                const newChapterIds = arrayMove(chapterIds, oldIndex, newIndex);

                setChapterIds(newChapterIds);

                try {
                    await onReorder(newChapterIds);
                } catch (error) {
                    setChapterIds(sortedChapters.map((chapter) => String(chapter.chapterId)));
                    console.error("Reorder failed, reverted UI state:", error);
                }
            }}
        >
            <SortableContext items={chapterIds} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-4">
                    {chapterIds.map((id) => {
                        const chapter = sortedChapters.find((item) => String(item.chapterId) === id);
                        if (!chapter) return null;

                        return (
                            <AdminChapterCard
                                key={id}
                                chapter={chapter}
                                onEdit={() => onEditChapter(chapter)}
                            />
                        );
                    })}
                </div>
            </SortableContext>
        </DndContext>
    );
}