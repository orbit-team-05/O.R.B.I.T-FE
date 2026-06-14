import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Database,
} from "lucide-react";

import {
    formatPriceChange,
    getPriceChangeValue,
} from "../utils/marketPriceUtils";

function MovementIcon({ value }) {
    const change = getPriceChangeValue(value);

    if (change === null || change === 0) {
        return <ArrowRight size={16} className="text-slate-500" />;
    }

    return change > 0 ? (
        <ArrowUpRight size={16} className="text-[#006948]" />
    ) : (
        <ArrowDownRight size={16} className="text-red-600" />
    );
}

export function OwnerMarketPriceInsights({ notableChanges, dataSources }) {
    return (
        <section className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
            <article className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-slate-900">
                    Biến động đáng chú ý
                </h3>

                <div className="mt-4 space-y-3">
                    {notableChanges.map((item) => (
                        <div
                            key={item.marketCode}
                            className="flex items-start gap-3 text-sm"
                        >
                            <MovementIcon value={item.priceChangeValue} />

                            <p className="text-slate-700">
                                <span className="font-medium text-slate-900">
                                    {item.marketName}
                                </span>{" "}
                                <span
                                    className={
                                        Number(item.priceChangeValue) >= 0
                                            ? "text-[#006948]"
                                            : "text-red-600"
                                    }
                                >
                                    {formatPriceChange(item.priceChangeValue)}
                                </span>
                            </p>
                        </div>
                    ))}

                    {notableChanges.length === 0 && (
                        <p className="text-sm text-slate-500">
                            Chưa có biến động giá để hiển thị.
                        </p>
                    )}
                </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-slate-900">
                    Nguồn dữ liệu
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {dataSources.map((source) => (
                        <a
                            key={source.label}
                            href={source.sourceUrl || undefined}
                            target={source.sourceUrl ? "_blank" : undefined}
                            rel={source.sourceUrl ? "noreferrer" : undefined}
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-[#006948]"
                        >
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">
                                <Database size={17} />
                            </span>

                            <span>
                                <span className="block text-sm font-semibold text-slate-900">
                                    {source.label}
                                </span>

                                <span className="block text-xs text-slate-500">
                                    Cập nhật {source.updatedLabel || "chưa rõ"}
                                </span>
                            </span>
                        </a>
                    ))}

                    {dataSources.length === 0 && (
                        <p className="text-sm text-slate-500">
                            Chưa có nguồn dữ liệu nào trong watchlist.
                        </p>
                    )}
                </div>
            </article>
        </section>
    );
}
