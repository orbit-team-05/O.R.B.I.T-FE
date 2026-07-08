import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";
import { SeasonStatusBadge } from "./SeasonStatusBadge";
import { formatCurrency, formatNumber } from "../../../../utils/formatUtils";

function getSeasonProgress(item) {
    if (!item) return 0;

    if (item.status === "COMPLETED") {
        return 100;
    }

    if (item.status === "HARVESTING") {
        const actualYieldKg = Number(item.actualYieldKg || 0);
        const expectedYieldKg = Number(item.expectedYieldKg || 0);

        if (expectedYieldKg <= 0) {
            return 0;
        }

        return Math.min(
            Math.round((actualYieldKg / expectedYieldKg) * 100),
            100,
        );
    }

    return Number(
        item.progressPercent ??
            item.progress ??
            0,
    );
}

export function SeasonTable({
    seasons,
    pageInfo,
    loading = false,
    loadingDetailId = null,
    onViewDetail,
    onPageChange,
}) {
    const currentPage = Math.max(
        Number(pageInfo?.number ?? 0),
        0,
    );

    const totalPages = Math.max(
        Number(pageInfo?.totalPages ?? 1),
        1,
    );

    const isFirstPage =
        currentPage <= 0 || pageInfo?.first;

    const isLastPage =
        currentPage >= totalPages - 1 ||
        pageInfo?.last;

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Danh sách mùa vụ nuôi trồng
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                    Theo dõi tiến trình, ngân sách đầu tư,
                    và sản lượng thu hoạch thực tế qua từng mùa vụ.
                </p>
            </header>

            {loading ? (
                <TableLoadingOverlay />
            ) : (
                <>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full table-auto border-collapse text-left">
                            <thead className="bg-slate-50">
                                {/* Giảm px-3 xuống px-2 */}
                                <tr className="whitespace-nowrap text-[11px] font-medium uppercase text-slate-600">
                                    <th className="px-2 py-3 pl-4">
                                        Tên mùa vụ
                                    </th>
                                    <th className="px-2 py-3">
                                        Trạng thái
                                    </th>
                                    <th className="min-w-[90px] px-2 py-3">
                                        Tiến độ
                                    </th>
                                    <th className="px-2 py-3">
                                        Đầu tư
                                    </th>
                                    <th className="px-2 py-3">
                                        Sản lượng
                                    </th>
                                    <th className="px-2 py-3">
                                        Doanh thu
                                    </th>
                                    <th className="px-2 py-3">
                                        Giá
                                    </th>
                                    <th className="px-2 py-3 pr-4 text-right">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {seasons.map((item) => {
                                    const progressPercent = getSeasonProgress(item);

                                    return (
                                        <tr
                                            key={item.id}
                                            // Giảm font size xuống text-[13px] để tổng thể gọn hơn
                                            className="border-t border-slate-200 text-[13px] text-slate-700 hover:bg-slate-50/55"
                                        >
                                            {/* Cột Tên - Dùng max-w và truncate để không đẩy bảng */}
                                            <td className="px-2 py-3 pl-4">
                                                <div 
                                                    className="max-w-[130px] truncate font-semibold text-slate-900"
                                                    title={item.seasonName}
                                                >
                                                    {item.seasonName}
                                                </div>

                                                <div 
                                                    className="mt-0.5 max-w-[130px] truncate text-xs text-slate-500"
                                                    title={`Loài: ${item.speciesName}`}
                                                >
                                                    Loài: {item.speciesName}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-2 py-3">
                                                <SeasonStatusBadge
                                                    status={item.status}
                                                />
                                            </td>

                                            <td className="whitespace-nowrap px-2 py-3">
                                                <div className="flex items-center gap-2">
                                                    {/* Thu gọn chiều dài thanh tiến độ */}
                                                    <div className="h-2 w-12 overflow-hidden rounded-full bg-slate-100 sm:w-16">
                                                        <div
                                                            className="h-full rounded-full bg-[#006948]"
                                                            style={{
                                                                width: `${progressPercent}%`,
                                                            }}
                                                        />
                                                    </div>

                                                    <span className="min-w-[32px] text-xs font-semibold text-slate-700">
                                                        {progressPercent}%
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-2 py-3">
                                                <div className="font-semibold text-red-600">
                                                    {formatCurrency(item.totalCost)}
                                                </div>

                                                <div className="mt-0.5 text-xs text-slate-500">
                                                    Vốn đầu: {formatCurrency(item.initialCapitalCost)}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-2 py-3">
                                                <div className="font-semibold text-slate-950">
                                                    Dự kiến: {formatNumber(item.expectedYieldKg)} kg
                                                </div>

                                                {(item.status === "HARVESTING" || item.status === "COMPLETED") && (
                                                    <div className="mt-0.5 text-xs font-medium text-emerald-700">
                                                        Đã thu: {formatNumber(item.actualYieldKg)} kg
                                                    </div>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-2 py-3">
                                                <div className="font-semibold text-slate-950">
                                                    Dự kiến:{" "}
                                                    {item.estimatedRevenueOfCurrentYield != null
                                                        ? formatCurrency(item.estimatedRevenueOfCurrentYield)
                                                        : "Chưa có"}
                                                </div>

                                                {(item.status === "HARVESTING" || item.status === "COMPLETED") && (
                                                    <div className="mt-0.5 text-xs font-medium text-emerald-700">
                                                        Thực tế:{" "}
                                                        {item.estimatedHarvestRevenue != null
                                                            ? formatCurrency(item.estimatedHarvestRevenue)
                                                            : "Chưa có"}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-2 py-3">
                                                <div className="font-semibold text-slate-950">
                                                    Thị trường:{" "}
                                                    {item.marketPriceOfSize != null
                                                        ? `${formatCurrency(item.marketPriceOfSize)} / kg`
                                                        : "Chưa có"}
                                                </div>

                                                {(item.status === "HARVESTING" || item.status === "COMPLETED") && (
                                                    <div className="mt-0.5 text-xs font-medium text-emerald-700">
                                                        Thực tế:{" "}
                                                        {item.harvestPricePerKg != null
                                                            ? `${formatCurrency(item.harvestPricePerKg)} / kg`
                                                            : "Chưa có"}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-2 py-3 pr-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => onViewDetail?.(item)}
                                                    disabled={loadingDetailId !== null}
                                                    className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {loadingDetailId === item.id
                                                        ? "Đang tải..."
                                                        : "Chi tiết"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

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

                    <footer className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500">
                            Tổng số {pageInfo.totalElements} mùa vụ
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
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
