import { FiInfo } from "react-icons/fi";

type Props = {
    title: string;
    vertical?: "top" | "bottom";
    horizontal?: "left" | "center" | "right";
};

export default function InfoIcon({
    title,
    vertical = "bottom",
    horizontal = "left",
}: Props) {
    const verticalClass =
        vertical === "top" ? "bottom-full mb-2" : "top-full mt-2";

    const horizontalClass = {
        left: "right-0",
        center: "left-1/2 -translate-x-1/2",
        right: "left-0",
    }[horizontal];

    return (
        <div className="group relative inline-flex cursor-help text-muted">
            <FiInfo size={14} />

            <div
                className={`
                    absolute
                    ${verticalClass}
                    ${horizontalClass}
                    whitespace-nowrap
                    bg-muted text-paper
                    text-[10px]s
                    px-2 py-1
                    opacity-0 invisible
                    group-hover:opacity-100
                    group-hover:visible
                    transition
                    z-10
                `}
            >
                {title}
            </div>
        </div>
    );
}
