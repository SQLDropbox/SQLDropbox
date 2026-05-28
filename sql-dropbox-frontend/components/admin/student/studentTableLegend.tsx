import { FaClock, FaMedal, FaRegCircle } from "react-icons/fa6";

export default function StudentTableLegend() {
    return (
        <div className="mt-8 pt-4 w-max flex flex-wrap gap-5 border-t-2 border-dashed border-border font-mono text-[11px] text-muted uppercase tracking-[0.08em] bg-paper-light px-4 py-2.5 -rotate-[0.8deg] shadow-[1px_2px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2">
                <FaMedal className="text-[#cfb53b]" />= COMPLETE
            </div>
            <div className="flex items-center gap-2">
                <FaMedal className="text-[#aaa9ad]" />= PARTIAL
            </div>
            <div className="flex items-center gap-2">
                <FaClock className="text-border" />= IN PROGRESS
            </div>
            <div className="flex items-center gap-2">
                <FaRegCircle className="text-muted" />= NOT STARTED
            </div>
        </div>
    );
}
