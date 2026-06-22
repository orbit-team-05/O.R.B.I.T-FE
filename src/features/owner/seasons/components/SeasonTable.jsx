import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";
import { SeasonStatusBadge } from "./SeasonStatusBadge";

function formatDate(value) {
    if (!value) return "Chưa có";
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

function formatCurrency(value) {
    if (value == null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
}

function formatNumber(value) {
    if (value == null) return "0";
    return Number(value).toLocaleString("vi-VN");
}

export function SeasonTable({
                                seasons,
                                pageInfo,
                                loading = false,
                                loadingDetailId = null,
                                onViewDetail,
                                onPageChange,
                            }) {
    const currentPage = Math.max(Number(pageInfo?.number ?? 0), 0);
    const totalPages = Math.max(Number(pageInfo?.totalPages ?? 1), 1);
    const isFirstPage = currentPage <= 0 || pageInfo?.first;
    const isLastPage = currentPage >= totalPages - 1 || pageInfo?.last;

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Danh sách mùa vụ nuôi trồng
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                    Theo dõi tiến trình, ngân sách đầu tư, và sản lượng thu hoạch thực tế qua từng mùa vụ.
                </p>
            </header>

            {loading ? (
                <TableLoadingOverlay />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] border-collapse text-left">
                            <thead className="bg-slate-50">
                            <tr className="text-[11px] font-medium uppercase text-slate-600">
                                <th className="px-5 py-3">Tên mùa vụ / Loài nuôi</th>
                                <th className="px-5 py-3">Trạng thái</th>
                                <th className="px-5 py-3 w-[150px]">Tiến độ</th>
                                <th className="px-5 py-3">Đầu tư</th>
                                <th className="px-5 py-3">Sản lượng</th>
                                <th className="px-5 py-3">Doanh thu</th>
                                <th className="px-5 py-3">Giá</th>
                                <th className="w-[120px] px-5 py-3 text-right">Hành động</th>
                            </tr>
                            </thead>

                            <tbody>
                            {seasons.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-slate-200 text-sm text-slate-700 hover:bg-slate-50/55"
                                >
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-slate-900">
                                            {item.seasonName}
                                        </div>
                                        <div className="mt-0.5 text-xs text-slate-500">
                                            Loài: {item.speciesName}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <SeasonStatusBadge status={item.status} />
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-[#006948]"
                                                    style={{ width: `${item.progressPercent ?? 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-700 min-w-[32px]">
                                                {item.progressPercent ?? 0}%
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-red-600">
                                            {formatCurrency(item.totalCost)}
                                        </div>
                                        <div className="mt-0.5 text-xs text-slate-500">
                                            Vốn đầu: {formatCurrency(item.initialCapitalCost)}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-slate-950">
                                            Dự kiến: {formatNumber(item.expectedYieldKg)} kg
                                        </div>
                                        {(item.status === "HARVESTING" || item.status === "COMPLETED") && (
                                            <div className="mt-0.5 text-xs font-medium text-emerald-700">
                                                Đã thu: {formatNumber(item.actualYieldKg)} kg
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-slate-950">
                                            Dự kiến: {item.estimatedRevenueOfCurrentYield != null
                                                ? formatCurrency(item.estimatedRevenueOfCurrentYield)
                                                : "Chưa có"}
                                        </div>
                                        {(item.status === "HARVESTING" || item.status === "COMPLETED") && (
                                            <div className="mt-0.5 text-xs font-medium text-emerald-700">
                                                Thực tế: {item.estimatedHarvestRevenue != null
                                                    ? formatCurrency(item.estimatedHarvestRevenue)
                                                    : "Chưa có"}
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-slate-950">
                                            Thị trường: {item.marketPriceOfSize != null
                                                ? `${formatCurrency(item.marketPriceOfSize)} / kg`
                                                : "Chưa có"}
                                        </div>
                                        {(item.status === "HARVESTING" || item.status === "COMPLETED") && (
                                            <div className="mt-0.5 text-xs font-medium text-emerald-700">
                                                Thực tế: {item.harvestPricePerKg != null
                                                    ? `${formatCurrency(item.harvestPricePerKg)} / kg`
                                                    : "Chưa có"}
                                            </div>
                                        )}
                                    </td>

                                    <td className="w-[120px] px-5 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => onViewDetail?.(item)}
                                            disabled={loadingDetailId !== null}
                                            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loadingDetailId === item.id ? "Đang tải..." : "Chi tiết"}
                                        </button>
                                    </td>
                                </tr>
                            ))}

                             {seasons.length === 0 && (
                                 <tr>
                                     <td
                                         colSpan={8}
                                         className="px-5 py-12 text-center text-sm text-slate-500"
                                     >
                                         Chưa có mùa vụ nào được tạo.
                                     </td>
                                 </tr>
                             )}
                            </tbody>
                        </table>
                    </div>

                    <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Tổng số {pageInfo.totalElements} mùa vụ
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
