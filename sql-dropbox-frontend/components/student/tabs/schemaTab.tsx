import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export default function SchemaTab({
    schemaName,
    schemaImage,
}: {
    schemaName: string;
    schemaImage?: string | null;
}) {
    const t = useTranslations("ChapterExercisePage");
    const imageContainerRef = useRef<HTMLDivElement | null>(null);
    const [scale, setScale] = useState(1);
    const [isHoveringImage, setIsHoveringImage] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const API_BASE = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const el = imageContainerRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            if (!isHoveringImage) return;
            e.preventDefault();
            setScale((prev) =>
                Math.min(Math.max(prev + -e.deltaY * 0.0015, 0.5), 4),
            );
        };

        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, [isHoveringImage]);

    const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 4));
    const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    return (
        <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-ink">
                {t("panel.schema")}
            </h3>

            <div className="border border-border bg-surface-2 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    {t("activeSchema")}
                </p>

                <code className="mt-3 block border border-border bg-paper px-3 py-2 font-mono text-sm text-ink">
                    {schemaName || t("noSchemaLinked")}
                </code>

                {schemaImage ? (
                    <div className="mt-4">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <button
                                onClick={zoomIn}
                                className="border border-border px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink hover:border-ink"
                            >
                                +
                            </button>
                            <button
                                onClick={zoomOut}
                                className="border border-border px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink hover:border-ink"
                            >
                                -
                            </button>
                            <button
                                onClick={resetZoom}
                                className="border border-border px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink hover:border-ink"
                            >
                                {t("zoomReset")}
                            </button>
                            <span className="ml-2 font-mono text-xs uppercase tracking-widest text-muted">
                                {Math.round(scale * 100)}%
                            </span>
                        </div>

                        <div
                            ref={imageContainerRef}
                            className="relative h-[600px] overflow-hidden border border-border bg-paper touch-none"
                            style={{ overscrollBehavior: "contain" }}
                            onMouseEnter={() => setIsHoveringImage(true)}
                            onMouseLeave={() => {
                                setIsHoveringImage(false);
                                setIsDragging(false);
                            }}
                            onMouseMove={handleMouseMove}
                            onMouseUp={() => setIsDragging(false)}
                        >
                            <div
                                onMouseDown={handleMouseDown}
                                className="flex h-full w-full cursor-grab items-center justify-center active:cursor-grabbing"
                            >
                                <img
                                    src={`${API_BASE}/schema-images/${schemaImage}`}
                                    alt={`Database schema for ${schemaName}`}
                                    draggable={false}
                                    className="select-none object-contain transition-transform duration-75"
                                    style={{
                                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                        maxWidth: "none",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="mt-4 font-mono text-sm text-muted">
                        {t("noSchemaImage")}
                    </p>
                )}
            </div>
        </div>
    );
}
