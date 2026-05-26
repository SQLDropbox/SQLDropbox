import { FaClock, FaMedal, FaRegCircle } from "react-icons/fa6";

export default function ProgressIcon({
    completed,
    total,
    className = "",
}: {
    completed: number;
    total: number;
    className?: string;
}) {
    if (completed === 0) {
        return <FaRegCircle className={`text-xl text-muted ${className}`} />;
    }

    if (completed < total / 2) {
        return <FaClock className={`text-xl text-accent ${className}`} />;
    }

    if (completed < total) {
        return <FaMedal className={`text-xl text-muted ${className}`} />;
    }

    return <FaMedal className={`text-xl text-yellow-500 ${className}`} />;
}
