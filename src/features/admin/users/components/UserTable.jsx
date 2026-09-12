import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";
import { UserStatusBadge } from "./UserStatusBadge";

function UserAvatar({ user }) {
    const initials = (user.fullName || user.username || "?")
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    return user.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.fullName || "Avatar"} className="h-10 w-10 rounded-full object-cover" />
    ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-[#006948]">
            {initials}
        </div>
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
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
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
    currentUserId,
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Danh sách Người dùng</h2>
                <p className="mt-1 text-xs text-slate-500">Tài khoản hệ thống, quyền truy cập và Farm scope.</p>
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
                                    <tr key={item.id} onClick={() => onView?.(item)} className="cursor-pointer border-t border-slate-100 text-sm text-slate-700 transition hover:bg-slate-50">
                                        <td className="px-5 py-4">
                                            #{String(item.id).padStart(2, "0")}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar user={item} />
                                                <div>
                                                    <p className="font-medium text-slate-900">{item.fullName}</p>
                                                    <p className="mt-0.5 text-xs text-slate-500">@{item.username}</p>
                                                </div>
                                            </div>
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

                                    <td className="w-[200px] px-5 py-4" onClick={(event) => event.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                <ActionButton onClick={() => onView?.(item)}>
                                                    Xem
                                                </ActionButton>

                                                <ActionButton
                                                    onClick={() => onEdit?.(item)}
                                                    disabled={item.id === currentUserId}
                                                    title={item.id === currentUserId ? "Bạn không thể tự chỉnh sửa vai trò hoặc nông trại của bản thân" : ""}
                                                >
                                                    Sửa
                                                </ActionButton>

                                                <ActionButton
                                                    variant={item.status === "ACTIVE" ? "danger" : "success"}
                                                    onClick={() => onToggleStatus?.(item)}
                                                    disabled={item.id === currentUserId}
                                                    title={item.id === currentUserId ? "Bạn không thể tự khóa/mở khóa tài khoản của bản thân" : ""}
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

                    <footer className="flex items-center justify-end border-t border-slate-200 px-5 py-3">
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
