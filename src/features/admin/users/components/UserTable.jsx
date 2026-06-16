import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";

function UserStatusBadge({ status }) {
    const isActive = status === "ACTIVE";
    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
                "text-[11px] font-medium",
                isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600",
            ].join(" ")}
        >
            <span
                className={[
                    "h-1.5 w-1.5 rounded-full",
                    isActive ? "bg-emerald-500" : "bg-slate-500",
                ].join(" ")}
            />
            {isActive ? "Đang hoạt động" : "Đã khóa"}
        </span>
    );
}

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

export function UserTable({
    users,
    pageInfo,
    onPageChange,
    loading = false,
    onView,
    onEdit,
    onToggleStatus,
}) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Danh sách Người dùng
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Danh sách tất cả tài khoản người dùng trực thuộc các nông trại hoặc quản trị hệ thống
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
                                    <th className="px-5 py-3">Họ và Tên</th>
                                    <th className="px-5 py-3">Email / Username</th>
                                    <th className="px-5 py-3">Nông trại</th>
                                    <th className="px-5 py-3">Vai trò</th>
                                    <th className="px-5 py-3">Trạng thái</th>
                                    <th className="px-5 py-3">Ngày tạo</th>
                                    <th className="w-[200px] px-5 py-3 text-center">Hành động</th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4">
                                            #{String(item.id).padStart(2, "0")}
                                        </td>

                                        <td className="px-5 py-4 font-medium text-slate-900">
                                            {item.fullName}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900">{item.email || item.username}</span>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            {item.farmName ? (
                                                <span className="text-slate-900">{item.farmName}</span>
                                            ) : (
                                                <span className="text-xs italic text-slate-400">Chưa liên kết</span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {item.roles.map((role) => (
                                                    <span
                                                        key={role}
                                                        className={[
                                                            "rounded px-2 py-0.5 text-[10px] font-medium",
                                                            role === "ADMIN"
                                                                ? "bg-purple-100 text-purple-800"
                                                                : role === "OWNER"
                                                                ? "bg-[#006948]/10 text-[#006948]"
                                                                : "bg-blue-100 text-blue-800",
                                                        ].join(" ")}
                                                    >
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <UserStatusBadge status={item.status} />
                                        </td>

                                        <td className="px-5 py-4">
                                            {item.createdAt
                                                ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                                                : "—"}
                                        </td>

                                        <td className="w-[200px] px-5 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <ActionButton onClick={() => onView?.(item)}>
                                                    Xem
                                                </ActionButton>

                                                <ActionButton onClick={() => onEdit?.(item)}>
                                                    Sửa
                                                </ActionButton>

                                                <ActionButton
                                                    variant={item.status === "ACTIVE" ? "danger" : "success"}
                                                    onClick={() => onToggleStatus?.(item)}
                                                >
                                                    {item.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                                                </ActionButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {users.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-10 text-center text-sm text-slate-500"
                                        >
                                            Chưa có tài khoản người dùng nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Tổng {pageInfo.totalElements} người dùng
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={pageInfo.first}
                                onClick={() => onPageChange(pageInfo.number - 1)}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Trước
                            </button>

                            <span className="text-xs text-slate-600">
                                Trang {pageInfo.number + 1} / {Math.max(pageInfo.totalPages, 1)}
                            </span>

                            <button
                                type="button"
                                disabled={pageInfo.last}
                                onClick={() => onPageChange(pageInfo.number + 1)}
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
