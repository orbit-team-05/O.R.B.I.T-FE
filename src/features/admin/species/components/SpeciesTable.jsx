import { SpeciesStatusBadge } from "./SpeciesStatusBadge";

export function SpeciesTable({ species }) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Danh sách Species
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Species được dùng cho mùa vụ, watchlist và cấu hình crawl
                </p>
            </header>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-slate-50">
                    <tr className="text-[11px] font-medium uppercase text-slate-600">
                        <th className="px-5 py-3">ID</th>
                        <th className="px-5 py-3">Tên Species</th>
                        <th className="px-5 py-3">Nhóm</th>
                        <th className="px-5 py-3">Đơn vị</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3 text-right">Hành động</th>
                    </tr>
                    </thead>

                    <tbody>
                    {species.map((item) => (
                        <tr
                            key={item.id}
                            className="border-t border-slate-200 text-sm text-slate-700"
                        >
                            <td className="px-5 py-4">
                                #{String(item.id).padStart(2, "0")}
                            </td>

                            <td className="px-5 py-4 font-medium text-slate-900">
                                {item.name}
                            </td>

                            <td className="px-5 py-4">
                  <span className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                    {item.group}
                  </span>
                            </td>

                            <td className="px-5 py-4">
                                {item.marketUnit}
                            </td>

                            <td className="px-5 py-4">
                                <SpeciesStatusBadge active={item.active} />
                            </td>

                            <td className="px-5 py-4 text-right">
                                <button
                                    type="button"
                                    className="text-sm font-medium text-[#006948] hover:underline"
                                >
                                    Sửa
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}