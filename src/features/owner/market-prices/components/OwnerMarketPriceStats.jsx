import { ArrowDownRight, ArrowUpRight, Eye, LineChart } from "lucide-react";

const CARD_CONFIG = [
    {
        key: "watchlistCount",
        title: "Đang theo dõi",
        description: "Mặt hàng",
        icon: Eye,
        tone: "text-slate-900",
    },
    {
        key: "totalPrices",
        title: "Dòng giá",
        description: "Từ crawler",
        icon: LineChart,
        tone: "text-slate-900",
    },
    {
        key: "increasedPrices",
        title: "Tăng giá",
        description: "So với kỳ trước",
        icon: ArrowUpRight,
        tone: "text-[#006948]",
    },
    {
        key: "decreasedPrices",
        title: "Giảm giá",
        description: "Cần theo dõi",
        icon: ArrowDownRight,
        tone: "text-red-600",
    },
];

export function OwnerMarketPriceStats({ summary }) {
    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {CARD_CONFIG.map(({ key, title, description, icon: Icon, tone }) => (
                <article
                    key={key}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-4"
                >
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {title}
                        </p>

                        <Icon size={18} className={tone} strokeWidth={1.8} />
                    </div>

                    <div className="mt-3 flex items-end gap-2">
                        <span className={`text-4xl font-bold ${tone}`}>
                            {summary?.[key] ?? 0}
                        </span>

                        <span className="pb-1 text-sm text-slate-500">
                            {description}
                        </span>
                    </div>
                </article>
            ))}
        </section>
    );
}
