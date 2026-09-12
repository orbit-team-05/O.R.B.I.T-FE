import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";
import Pagination from "../../../../components/common/pagination/Pagination";
import { FarmStatusBadge } from "./FarmStatusBadge";

function ActionButton({ children, variant = "default", ...props }) {
    const variantClass =
        variant === "danger"
            ? "text-red-600 hover:bg-red-50"
            : variant === "success"
                ? "text-[#006948] hover:bg-emerald-50"
                : "text-slate-700 hover:bg-slate-100";

    return (
        <button
            type="button"
            className={[
                "inline-flex h-8 min-w-[58px] items-center justify-center rounded-lg px-3",
                "text-xs font-medium transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006948]/30",
                variantClass,
            ].join(" ")}
            {...props}
        >
            {children}
        </button>
    );
}

function formatDate(dateString) {
    if (!dateString) return "—";

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}

function FarmAvatar({ farm }) {
    const initials = (farm.farmName || "F")
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    return farm.imageUrl ? (
        <img src={farm.imageUrl} alt={farm.farmName || "Farm"} className="h-11 w-11 rounded-xl object-cover" />
    ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-[#006948]">
            {initials}
        </div>
    );
}

export function FarmTable({
                              farms,
                              pageInfo,
                              onPageChange,
                              loading = false,
                              onView,
                              onEdit,
                              onToggleStatus,
                          }) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Danh sách Nông trại
                </h2>

                    <p className="mt-1 text-xs text-slate-500">
                    Quản lý hồ sơ, chủ sở hữu, nhân sự và trạng thái hoạt động.
                </p>
            </header>

            {loading ? (
                <TableLoadingOverlay />
            ) : (
                <>
                <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-slate-50">
                    <tr className="text-[11px] font-medium uppercase text-slate-600">
                        <th className="px-5 py-3">ID</th>
                        <th className="px-5 py-3">Tên Farm</th>
                        <th className="px-5 py-3">Địa chỉ</th>
                        <th className="px-5 py-3">Chủ sở hữu</th>
                        <th className="px-5 py-3">Nhân viên</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3">Ngày tạo</th>
                        <th className="w-[200px] px-5 py-3 text-center">Hành động</th>
                    </tr>
                    </thead>

                    <tbody>
                    {farms.map((item) => (
                        <tr
                            key={item.id}
                            onClick={() => onView?.(item)}
                            className="cursor-pointer border-t border-slate-100 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                            <td className="px-5 py-4">
                                #{String(item.id).padStart(2, "0")}
                            </td>

                            <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <FarmAvatar farm={item} />
                                    <div>
                                        <p className="font-medium text-slate-900">{item.farmName}</p>
                                        <p className="mt-0.5 text-xs text-slate-500">#{String(item.id).padStart(2, "0")}</p>
                                    </div>
                                </div>
                            </td>

                            <td className="max-w-[200px] truncate px-5 py-4" title={item.location}>
                                {item.location}
                            </td>

                            <td className="px-5 py-4">
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-900">
                                        {item.ownerName ?? "—"}
                                    </span>
                                    {item.ownerEmail && (
                                        <span className="text-[11px] text-slate-500">
                                            {item.ownerEmail}
                                        </span>
                                    )}
                                </div>
                            </td>

                            <td className="px-5 py-4">
                                <span className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                                    {item.staffCount ?? 0} người
                                </span>
                            </td>

                            <td className="px-5 py-4">
                                <FarmStatusBadge active={item.isActive} />
                            </td>

                            <td className="px-5 py-4 text-slate-500">
                                {formatDate(item.createdAt)}
                            </td>

                            <td className="w-[200px] px-5 py-4" onClick={(event) => event.stopPropagation()}>
                                <div className="flex items-center justify-center gap-2">
                                    <ActionButton onClick={() => onView?.(item)}>
                                        Xem
                                    </ActionButton>

                                    <ActionButton onClick={() => onEdit?.(item)}>
                                        Sửa
                                    </ActionButton>

                                    <ActionButton
                                        variant={item.isActive ? "danger" : "success"}
                                        onClick={() => onToggleStatus?.(item)}
                                    >
                                        {item.isActive ? "Tạm ngưng" : "Kích hoạt"}
                                    </ActionButton>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {farms.length === 0 && (
                        <tr>
                            <td
                                colSpan={8}
                                className="px-5 py-10 text-center text-sm text-slate-500"
                            >
                                Chưa có Nông trại nào.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <Pagination
                page={pageInfo.number}
                totalPages={pageInfo.totalPages}
                totalElements={pageInfo.totalElements}
                loading={loading}
                onPageChange={onPageChange}
            />
                </>
            )}
        </section>
    );
}
