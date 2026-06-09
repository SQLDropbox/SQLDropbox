import { FaClock, FaMedal, FaRegCircle } from "react-icons/fa6";
import { useTranslations } from "next-intl";

export default function StudentTableLegend() {
    const t = useTranslations("StudentTableLegend");

    return (
        <div className="mt-8 pt-4 w-max flex flex-wrap gap-5 border-t-2 border-dashed border-border font-mono text-[11px] text-muted uppercase tracking-[0.08em] bg-paper-light px-4 py-2.5 -rotate-[0.8deg] shadow-[1px_2px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2">
                <FaMedal className="text-[#cfb53b]" />= {t("complete")}
            </div>
            <div className="flex items-center gap-2">
                <FaMedal className="text-[#aaa9ad]" />= {t("partial")}
            </div>
            <div className="flex items-center gap-2">
                <FaClock className="text-border" />= {t("inProgress")}
            </div>
            <div className="flex items-center gap-2">
                <FaRegCircle className="text-muted" />= {t("notStarted")}
            </div>
        </div>
    );
}
