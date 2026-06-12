import { ExternalLink } from "lucide-react";
import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";

import { MarketPriceFilters } from "./MarketPriceFilters";

function formatPrice(value) {
    if (value === null || value === undefined) return "-";

    return new Intl.NumberFormat("vi-VN").format(Number(value));
}

function formatDate(value) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

function PriceChangeBadge({ value }) {
    if (value === null || value === undefined) {
        return <span className="text-slate-400">-</span>;
    }

    const numberValue = Number(value);
    const positive = numberValue >= 0;

    return (
        <span
            className={[
                "rounded-full px-2 py-1 text-[11px] font-medium",
                positive ? "bg-emerald-50 text-[#006948]" : "bg-red-50 text-red-600",
            ].join(" ")}
        >
            {positive ? "+" : ""}
            {numberValue.toFixed(2)}%
        </span>
    );
}

export function MarketPriceTable({
                                     prices,
                                     pageInfo,
                                     filters,
                                     sourceOptions,
                                     speciesOptions,
                                     loading = false,
                                     onFilterChange,
                                     onResetFilters,
                                     onPageChange,
                                 }) {
    const currentPage = Math.max(Number(pageInfo?.number ?? 0), 0);
    const totalPages = Math.max(Number(pageInfo?.totalPages ?? 1), 1);
    const isFirstPage = currentPage <= 0 || pageInfo?.first;
    const isLastPage = currentPage >= totalPages - 1 || pageInfo?.last;

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <MarketPriceFilters
                filters={filters}
                sourceOptions={sourceOptions}
                speciesOptions={speciesOptions}
                onFilterChange={onFilterChange}
                onReset={onResetFilters}
            />

            <div className="border-b border-slate-200 bg-slate-50 px-5 py-2 text-xs text-slate-600">
                Bảng hiển thị dữ liệu giá đã crawl. Cột biến động là phần trăm lấy từ nguồn, không phải hệ thống tự tính.
            </div>

            {loading && (
                <div className="border-b border-slate-200 bg-emerald-50 px-5 py-2 text-xs font-medium text-[#006948]">
                    Đang cập nhật dữ liệu theo bộ lọc...
                </div>
            )}

            {loading ? (
                <TableLoadingOverlay />
            ) : (
                <>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] border-collapse text-left">
                    <thead className="bg-slate-50">
                    <tr className="text-[11px] font-medium uppercase text-slate-600">
                        <th className="px-5 py-3">Mã giá</th>
                        <th className="px-5 py-3">Tên giá</th>
                        <th className="px-5 py-3">Species</th>
                        <th className="px-5 py-3">Khu vực</th>
                        <th className="px-5 py-3">Size</th>
                        <th className="px-5 py-3">Giá</th>
                        <th className="px-5 py-3">Biến động nguồn</th>
                        <th className="px-5 py-3">Ngày crawl</th>
                        <th className="px-5 py-3">Nguồn</th>
                        <th className="px-5 py-3">Link</th>
                    </tr>
                    </thead>

                    <tbody>
                    {prices.map((item) => (
                        <tr
                            key={item.id}
                            className="border-t border-slate-200 text-sm text-slate-700"
                        >
                            <td className="max-w-[150px] px-5 py-4">
                                <div className="break-all text-xs font-medium text-slate-700">
                                    {item.marketCode}
                                </div>
                            </td>

                            <td className="max-w-[220px] px-5 py-4 font-medium text-slate-900">
                                <div className="line-clamp-2">{item.marketName}</div>
                            </td>

                            <td className="max-w-[150px] px-5 py-4">
                                <div className="line-clamp-2">{item.speciesName}</div>
                            </td>

                            <td className="px-5 py-4">{item.location || "-"}</td>

                            <td className="px-5 py-4">{item.sizeCategory || "-"}</td>

                            <td className="px-5 py-4 font-semibold text-slate-900">
                                {formatPrice(item.price)}
                                <span className="ml-1 text-xs font-normal text-slate-500">
                                        {item.priceUnit}
                                    </span>
                            </td>

                            <td className="px-5 py-4">
                                <PriceChangeBadge value={item.priceChange} />
                            </td>

                            <td className="px-5 py-4 font-medium text-slate-900">
                                {formatDate(item.scrapedDate)}
                            </td>

                            <td className="px-5 py-4">
                                    <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                        {item.sourceCode}
                                    </span>
                            </td>

                            <td className="px-5 py-4">
                                {item.sourceUrl ? (
                                    <a
                                        href={item.sourceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-[#006948] hover:underline"
                                    >
                                        Mở
                                        <ExternalLink size={13} />
                                    </a>
                                ) : (
                                    <span className="text-slate-400">-</span>
                                )}
                            </td>
                        </tr>
                    ))}

                    {prices.length === 0 && (
                        <tr>
                            <td
                                colSpan={10}
                                className="px-5 py-10 text-center text-sm text-slate-500"
                            >
                                Chưa có dữ liệu giá crawl nào.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                <p className="text-xs text-slate-500">
                    Tổng {pageInfo.totalElements} dòng giá
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={isFirstPage}
                        onClick={() => {
                            if (isFirstPage) return;
                            onPageChange(currentPage - 1);
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Trước
                    </button>

                    <span className="text-xs text-slate-600">
                        Trang {currentPage + 1} / {totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={isLastPage}
                        onClick={() => {
                            if (isLastPage) return;
                            onPageChange(currentPage + 1);
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Sau
                    </button>
                </div>
            </footer>
                </>
            )}
        </section>
    );
}