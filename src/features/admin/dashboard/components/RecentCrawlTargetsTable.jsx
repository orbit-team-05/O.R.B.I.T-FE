function StatusBadge({ target }) {
    const active = target.isActive ?? target.active;

    if (target.lastError) {
        return (
            <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
        Lỗi crawl
      </span>
        );
    }

    if (!active) {
        return (
            <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600">
        Đã tắt
      </span>
        );
    }

    return (
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-[#006948]">
      Thành công
    </span>
    );
}

function formatDateTime(value) {
    if (!value) return "Chưa crawl";

    return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
    }).format(new Date(value));
}

export function RecentCrawlTargetsTable({ targets }) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Trạng thái Crawl gần đây
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Các target crawl mới chạy và kết quả xử lý gần nhất
                </p>
            </header>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-slate-50">
                    <tr className="text-[11px] font-medium uppercase text-slate-600">
                        <th className="px-5 py-3">Target</th>
                        <th className="px-5 py-3">Nguồn</th>
                        <th className="px-5 py-3">Species</th>
                        <th className="px-5 py-3">Khu vực</th>
                        <th className="px-5 py-3">Lần crawl</th>
                        <th className="px-5 py-3">Trạng thái</th>
                    </tr>
                    </thead>

                    <tbody>
                    {targets.map((item) => (
                        <tr
                            key={item.id}
                            className="border-t border-slate-200 text-sm text-slate-700"
                        >
                            <td className="max-w-[220px] px-5 py-4 font-medium text-slate-900">
                                <div className="line-clamp-2">{item.targetName}</div>
                            </td>

                            <td className="px-5 py-4">
                  <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                    {item.sourceCode}
                  </span>
                            </td>

                            <td className="px-5 py-4">{item.speciesName || "-"}</td>

                            <td className="px-5 py-4">{item.defaultLocation || "-"}</td>

                            <td className="px-5 py-4">{formatDateTime(item.lastCrawledAt)}</td>

                            <td className="px-5 py-4">
                                <StatusBadge target={item} />
                            </td>
                        </tr>
                    ))}

                    {targets.length === 0 && (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-5 py-10 text-center text-sm text-slate-500"
                            >
                                Chưa có target crawl nào.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}