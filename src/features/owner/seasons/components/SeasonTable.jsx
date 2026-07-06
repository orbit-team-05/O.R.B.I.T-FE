import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";
import { SeasonStatusBadge } from "./SeasonStatusBadge";

function formatCurrency(value) {
    if (value == null) return "0 ₫";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNumber(value) {
    if (value == null) return "0";

    return Number(value).toLocaleString("vi-VN");
}

function getSeasonProgress(item) {
    if (!item) return 0;

    if (item.status === "COMPLETED") {
        return 100;
    }

    if (item.status === "HARVESTING") {
        const actualYieldKg = Number(item.actualYieldKg || 0);

        const expectedYieldKg = Number(
            item.expectedYieldKg || 0,
        );

        if (expectedYieldKg <= 0) {
            return 0;
        }

        return Math.min(
            Math.round(
                (actualYieldKg /
                    expectedYieldKg) *
                    100,
            ),
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
        currentPage <= 0 ||
        pageInfo?.first;

    const isLastPage =
        currentPage >=
            totalPages - 1 ||
        pageInfo?.last;

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Danh sách mùa vụ nuôi trồng
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                    Theo dõi tiến trình, ngân sách đầu tư và sản lượng thu hoạch thực tế qua từng mùa vụ.
                </p>
            </header>

            {loading ? (
                <TableLoadingOverlay />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1500px] border-collapse text-left">
                            <thead className="bg-slate-50">
                                <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                                    <th className="min-w-[260px] px-5 py-3">
                                        Tên mùa vụ / Loài nuôi
                                    </th>

                                    <th className="min-w-[170px] px-5 py-3 whitespace-nowrap">
                                        Trạng thái
                                    </th>

                                    <th className="min-w-[180px] px-5 py-3 whitespace-nowrap">
                                        Tiến độ
                                    </th>

                                    <th className="min-w-[220px] px-5 py-3 whitespace-nowrap">
                                        Đầu tư
                                    </th>

                                    <th className="min-w-[240px] px-5 py-3 whitespace-nowrap">
                                        Sản lượng
                                    </th>

                                    <th className="min-w-[260px] px-5 py-3 whitespace-nowrap">
                                        Doanh thu
                                    </th>

                                    <th className="min-w-[260px] px-5 py-3 whitespace-nowrap">
                                        Giá
                                    </th>

                                    <th className="min-w-[130px] px-5 py-3 text-right whitespace-nowrap">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {seasons.map((item) => {
                                    const progressPercent =
                                        getSeasonProgress(item);

                                    return (
                                        <tr
                                            key={item.id}
                                            className="border-t border-slate-200 text-sm text-slate-700 transition-colors hover:bg-slate-50/60"
                                        >
                                            {/* TÊN MÙA VỤ */}
                                            <td className="min-w-[260px] px-5 py-4 align-top">
                                                <div
                                                    className="truncate font-semibold text-slate-900"
                                                    title={item.seasonName}
                                                >
                                                    {item.seasonName}
                                                </div>

                                                <div
                                                    className="mt-1 truncate text-xs text-slate-500"
                                                    title={item.speciesName}
                                                >
                                                    Loài: {item.speciesName}
                                                </div>
                                            </td>

                                            {/* TRẠNG THÁI */}
                                            <td className="min-w-[170px] px-5 py-4 align-top whitespace-nowrap">
                                                <SeasonStatusBadge
                                                    status={item.status}
                                                />
                                            </td>

                                            {/* TIẾN ĐỘ */}
                                            <td className="min-w-[180px] px-5 py-4 align-top">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className="h-full rounded-full bg-[#006948]"
                                                            style={{
                                                                width: `${progressPercent}%`,
                                                            }}
                                                        />
                                                    </div>

                                                    <span className="shrink-0 text-xs font-semibold text-slate-700">
                                                        {progressPercent}%
                                                    </span>
                                                </div>
                                            </td>

                                            {/* ĐẦU TƯ */}
                                            <td className="min-w-[220px] px-5 py-4 align-top whitespace-nowrap">
                                                <div className="font-semibold text-red-600">
                                                    {formatCurrency(
                                                        item.totalCost,
                                                    )}
                                                </div>

                                                <div className="mt-1 text-xs text-slate-500">
                                                    Vốn đầu:{" "}
                                                    {formatCurrency(
                                                        item.initialCapitalCost,
                                                    )}
                                                </div>
                                            </td>

                                            {/* SẢN LƯỢNG */}
                                            <td className="min-w-[240px] px-5 py-4 align-top whitespace-nowrap">
                                                <div className="font-semibold text-slate-950">
                                                    Dự kiến:{" "}
                                                    {formatNumber(
                                                        item.expectedYieldKg,
                                                    )}{" "}
                                                    kg
                                                </div>

                                                {(item.status ===
                                                    "HARVESTING" ||
                                                    item.status ===
                                                        "COMPLETED") && (
                                                    <div className="mt-1 text-xs font-medium text-emerald-700">
                                                        Đã thu:{" "}
                                                        {formatNumber(
                                                            item.actualYieldKg,
                                                        )}{" "}
                                                        kg
                                                    </div>
                                                )}
                                            </td>

                                            {/* DOANH THU */}
                                            <td className="min-w-[260px] px-5 py-4 align-top whitespace-nowrap">
                                                <div className="font-semibold text-slate-950">
                                                    Dự kiến:{" "}
                                                    {item.estimatedRevenueOfCurrentYield !=
                                                    null
                                                        ? formatCurrency(
                                                              item.estimatedRevenueOfCurrentYield,
                                                          )
                                                        : "Chưa có"}
                                                </div>

                                                {(item.status ===
                                                    "HARVESTING" ||
                                                    item.status ===
                                                        "COMPLETED") && (
                                                    <div className="mt-1 text-xs font-medium text-emerald-700">
                                                        Thực tế:{" "}
                                                        {item.estimatedHarvestRevenue !=
                                                        null
                                                            ? formatCurrency(
                                                                  item.estimatedHarvestRevenue,
                                                              )
                                                            : "Chưa có"}
                                                    </div>
                                                )}
                                            </td>

                                            {/* GIÁ */}
                                            <td className="min-w-[260px] px-5 py-4 align-top whitespace-nowrap">
                                                <div className="font-semibold text-slate-950">
                                                    Thị trường:{" "}
                                                    {item.marketPriceOfSize !=
                                                    null
                                                        ? `${formatCurrency(
                                                              item.marketPriceOfSize,
                                                          )} / kg`
                                                        : "Chưa có"}
                                                </div>

                                                {(item.status ===
                                                    "HARVESTING" ||
                                                    item.status ===
                                                        "COMPLETED") && (
                                                    <div className="mt-1 text-xs font-medium text-emerald-700">
                                                        Thực tế:{" "}
                                                        {item.harvestPricePerKg !=
                                                        null
                                                            ? `${formatCurrency(
                                                                  item.harvestPricePerKg,
                                                              )} / kg`
                                                            : "Chưa có"}
                                                    </div>
                                                )}
                                            </td>

                                            {/* ACTION */}
                                            <td className="min-w-[130px] px-5 py-4 text-right align-top whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onViewDetail?.(
                                                            item,
                                                        )
                                                    }
                                                    disabled={
                                                        loadingDetailId !==
                                                        null
                                                    }
                                                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {loadingDetailId ===
                                                    item.id
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

                    <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Tổng số{" "}
                            {pageInfo?.totalElements ||
                                0}{" "}
                            mùa vụ
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={isFirstPage}
                                onClick={() => {
                                    if (
                                        !isFirstPage
                                    ) {
                                        onPageChange(
                                            currentPage -
                                                1,
                                        );
                                    }
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Trước
                            </button>

                            <span className="text-xs text-slate-600">
                                Trang{" "}
                                {currentPage + 1} /{" "}
                                {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={isLastPage}
                                onClick={() => {
                                    if (
                                        !isLastPage
                                    ) {
                                        onPageChange(
                                            currentPage +
                                                1,
                                        );
                                    }
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