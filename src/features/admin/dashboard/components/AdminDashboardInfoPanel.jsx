function formatLatestTime(value) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
    }).format(new Date(value));
}

export function AdminDashboardInfoPanel({ priceSummary, deviceSummary }) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Tổng hợp vận hành
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Dữ liệu nhanh từ crawler và thiết bị IoT
                </p>
            </header>

            <div className="divide-y divide-slate-200 px-5">
                <div className="flex items-center justify-between py-3 text-sm">
                    <span className="text-slate-600">Dòng giá crawl</span>
                    <strong className="text-slate-900">
                        {priceSummary?.totalPrices ?? 0}
                    </strong>
                </div>

                <div className="flex items-center justify-between py-3 text-sm">
                    <span className="text-slate-600">Cập nhật giá mới nhất</span>
                    <strong className="text-slate-900">
                        {formatLatestTime(priceSummary?.latestUpdatedAt)}
                    </strong>
                </div>

                <div className="flex items-center justify-between py-3 text-sm">
                    <span className="text-slate-600">Thiết bị đang hoạt động</span>
                    <strong className="text-[#006948]">
                        {deviceSummary?.activeDevices ?? 0}
                    </strong>
                </div>

                <div className="flex items-center justify-between py-3 text-sm">
                    <span className="text-slate-600">Thiết bị chờ kích hoạt</span>
                    <strong className="text-amber-600">
                        {deviceSummary?.unassignedDevices ?? 0}
                    </strong>
                </div>
            </div>
        </section>
    );
}