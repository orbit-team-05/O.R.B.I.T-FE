import { ExternalLink, RefreshCw } from "lucide-react";

import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";
import {
    formatPrice,
    formatPriceChange,
} from "../utils/marketPriceUtils";

function PriceChangeBadge({ value }) {
    if (value === null || value === undefined) {
        return <span className="text-slate-400">-</span>;
    }

    const positive = Number(value) > 0;
    const neutral = Number(value) === 0;

    return (
        <span
            className={[
                "inline-flex rounded-md px-2 py-1 text-xs font-semibold",
                neutral
                    ? "bg-slate-100 text-slate-600"
                    : positive
                      ? "bg-emerald-50 text-[#006948]"
                      : "bg-red-50 text-red-600",
            ].join(" ")}
        >
            {formatPriceChange(value)}
        </span>
    );
}

export function OwnerMarketPriceTable({
    prices,
    pageInfo,
    filters,
    speciesOptions,
    sourceOptions,
    loading = false,
    onFilterChange,
    onResetFilters,
    onRefresh,
    onPageChange,
}) {
    const currentPage = Math.max(Number(pageInfo?.number ?? 0), 0);
    const totalPages = Math.max(Number(pageInfo?.totalPages ?? 1), 1);
    const isFirstPage = currentPage <= 0 || pageInfo?.first;
    const isLastPage = currentPage >= totalPages - 1 || pageInfo?.last;

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Danh sách giá thị trường theo dõi
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                        Giá được lấy theo watchlist của farm.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <select
                        value={filters.speciesName}
                        onChange={(event) =>
                            onFilterChange("speciesName", event.target.value)
                        }
                        className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/10"
                    >
                        <option value="">Tất cả species</option>
                        {speciesOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.sourceLabel}
                        onChange={(event) =>
                            onFilterChange("sourceLabel", event.target.value)
                        }
                        className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/10"
                    >
                        <option value="">Tất cả nguồn</option>
                        {sourceOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {(filters.speciesName || filters.sourceLabel) && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Bỏ lọc
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onRefresh}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <RefreshCw size={15} />
                        Làm mới
                    </button>
                </div>
            </header>

            {loading ? (
                <TableLoadingOverlay message="Đang tải giá thị trường..." />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] border-collapse text-left">
                            <thead className="bg-slate-50">
                                <tr className="text-[11px] font-semibold uppercase text-slate-600">
                                    <th className="px-5 py-3">Mặt hàng</th>
                                    <th className="px-5 py-3">Species</th>
                                    <th className="px-5 py-3">Khu vực</th>
                                    <th className="px-5 py-3">Size</th>
                                    <th className="px-5 py-3">Giá</th>
                                    <th className="px-5 py-3">Đơn vị</th>
                                    <th className="px-5 py-3">Thay đổi</th>
                                    <th className="px-5 py-3">Cập nhật</th>
                                    <th className="px-5 py-3">Nguồn</th>
                                </tr>
                            </thead>

                            <tbody>
                                {prices.map((item) => (
                                    <tr
                                        key={item.marketCode}
                                        className="border-t border-slate-200 text-sm text-slate-700"
                                    >
                                        <td className="max-w-[260px] px-5 py-4 font-semibold text-slate-900">
                                            <div className="line-clamp-2">
                                                {item.marketName || "-"}
                                            </div>
                                        </td>

                                        <td className="max-w-[180px] px-5 py-4">
                                            <div className="line-clamp-2">
                                                {item.speciesName || "-"}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            {item.location || "-"}
                                        </td>

                                        <td className="px-5 py-4">
                                            {item.sizeCategory || "DEFAULT"}
                                        </td>

                                        <td className="px-5 py-4 font-semibold text-slate-900">
                                            {formatPrice(item.price)}
                                        </td>

                                        <td className="px-5 py-4">
                                            {item.priceUnit || "-"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <PriceChangeBadge
                                                value={item.priceChangeValue}
                                            />
                                        </td>

                                        <td className="px-5 py-4">
                                            {item.updatedLabel || "-"}
                                        </td>

                                        <td className="px-5 py-4">
                                            {item.sourceUrl ? (
                                                <a
                                                    href={item.sourceUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-[#006948] hover:text-[#006948]"
                                                >
                                                    {item.sourceLabel}
                                                    <ExternalLink size={12} />
                                                </a>
                                            ) : (
                                                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                                                    {item.sourceLabel}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {prices.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-5 py-10 text-center text-sm text-slate-500"
                                        >
                                            Chưa có dữ liệu giá thị trường phù hợp.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <footer className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
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
