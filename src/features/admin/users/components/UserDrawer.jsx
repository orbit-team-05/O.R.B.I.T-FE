import { X } from "lucide-react";
import { useEffect, useState } from "react";

const INITIAL_FORM = {
    username: "",
    fullName: "",
    email: "",
    phone: "",
    status: "",
    createdAt: "",
    updatedAt: "",
    roleIds: [],
    farmId: "",
};

export function UserDrawer({
    open,
    mode = "create",
    user,
    roles = [],
    farms = [],
    submitting,
    error,
    onClose,
    onSubmit,
}) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [validationError, setValidationError] = useState("");

    const isEditMode = mode === "edit";
    const isViewMode = mode === "view";

    useEffect(() => {
        if (!open) return;

        if ((isEditMode || isViewMode) && user) {
            // Normalize roles since user.roles could be a list of strings or RoleResponseDTO objects
            const roleNames = user.roles
                ? user.roles.map((r) => (typeof r === "string" ? r : r.roleName))
                : [];

            setForm({
                username: user.username ?? "",
                fullName: user.fullName ?? "",
                email: user.email ?? "",
                phone: user.phone ?? "",
                status: user.status ?? "",
                createdAt: user.createdAt ?? "",
                updatedAt: user.updatedAt ?? "",
                // Find matching role IDs from the roles array using role name
                roleIds: roles
                      .filter((r) => roleNames.includes(r.roleName))
                      .map((r) => r.id),
                farmId: user.farmId ?? "",
            });
            setValidationError("");
            return;
        }

        setForm(INITIAL_FORM);
        setValidationError("");
    }, [open, isEditMode, isViewMode, user, roles]);

    function handleChange(event) {
        if (isViewMode) return;
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleRoleCheckboxChange(roleId) {
        if (isViewMode) return;
        setForm((prev) => {
            const exists = prev.roleIds.includes(roleId);
            if (exists) {
                return {
                    ...prev,
                    roleIds: prev.roleIds.filter((id) => id !== roleId),
                };
            } else {
                return {
                    ...prev,
                    roleIds: [...prev.roleIds, roleId],
                };
            }
        });
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (isViewMode) return;
        setValidationError("");

        if (!isEditMode) {
            if (!form.username.trim()) {
                setValidationError("Tên đăng nhập không được để trống");
                return;
            }
            if (!form.fullName.trim()) {
                setValidationError("Họ và tên không được để trống");
                return;
            }
        }

        if (form.roleIds.length === 0) {
            setValidationError("Vui lòng chọn ít nhất một vai trò");
            return;
        }

        if (!form.farmId) {
            setValidationError("Vui lòng chọn nông trại trực thuộc");
            return;
        }

        const payload = isEditMode
            ? {
                  roleIds: form.roleIds,
                  farmId: Number(form.farmId),
              }
            : {
                  username: form.username.trim(),
                  fullName: form.fullName.trim(),
                  roleIds: form.roleIds,
                  farmId: Number(form.farmId),
              };

        onSubmit(payload);
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Đóng drawer"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/20"
            />

            <aside className="absolute right-0 top-0 flex h-full w-[380px] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <h2 className="text-base font-semibold text-slate-900">
                        {isViewMode ? "Chi tiết tài khoản" : isEditMode ? "Cập nhật tài khoản" : "Thêm Người dùng mới"}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                        <X size={18} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
                    <div className="flex-1 space-y-4 px-5 py-5">
                        {/* Info banner about default password in create mode */}
                        {!isEditMode && !isViewMode && (
                            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-2.5 text-xs text-blue-800 leading-relaxed">
                                <span className="font-semibold">Lưu ý:</span> Mật khẩu mặc định cho người dùng mới sẽ được đặt tự động.
                            </div>
                        )}

                        {(error || validationError) && !isViewMode && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                                {error || validationError}
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Tên đăng nhập (Username) *
                            </label>

                            <input
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="VD: nguyenvanan"
                                disabled={isEditMode || isViewMode}
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Họ và Tên *
                            </label>

                            <input
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="VD: Nguyễn Văn An"
                                disabled={isEditMode || isViewMode}
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                            />
                        </div>

                        {(isEditMode || isViewMode) && (
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                    Email
                                </label>

                                <input
                                    name="email"
                                    value={form.email}
                                    disabled={true}
                                    placeholder="Chưa cập nhật"
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                />
                            </div>
                        )}

                        {(isEditMode || isViewMode) && (
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                    Số điện thoại
                                </label>

                                <input
                                    name="phone"
                                    value={form.phone}
                                    disabled={true}
                                    placeholder="Chưa cập nhật"
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                />
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Vai trò (Roles) *
                            </label>

                            <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50">
                                {roles.map((role) => (
                                    <label key={role.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={form.roleIds.includes(role.id)}
                                            onChange={() => handleRoleCheckboxChange(role.id)}
                                            disabled={isViewMode}
                                            className="rounded border-slate-300 text-[#006948] focus:ring-[#006948] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                                        />
                                        <span>{role.roleName}</span>
                                    </label>
                                ))}
                                {roles.length === 0 && (
                                    <p className="text-xs italic text-slate-400">Đang tải danh sách vai trò...</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Nông trại (Farm) *
                            </label>

                            <select
                                name="farmId"
                                value={form.farmId}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                            >
                                <option value="">-- Chọn nông trại trực thuộc --</option>
                                {farms.map((farm) => (
                                    <option key={farm.id} value={farm.id}>
                                        {farm.farmName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isViewMode && (
                            <>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                        Trạng thái
                                    </label>
                                    <div className="flex items-center">
                                        <span
                                            className={[
                                                "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
                                                "text-[11px] font-medium",
                                                form.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600",
                                            ].join(" ")}
                                        >
                                            <span
                                                className={[
                                                    "h-1.5 w-1.5 rounded-full",
                                                    form.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-500",
                                                ].join(" ")}
                                            />
                                            {form.status === "ACTIVE" ? "Đang hoạt động" : "Đã khóa"}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                        Ngày tạo
                                    </label>
                                    <input
                                        value={form.createdAt ? new Date(form.createdAt).toLocaleString("vi-VN") : "—"}
                                        disabled={true}
                                        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                        Ngày cập nhật
                                    </label>
                                    <input
                                        value={form.updatedAt ? new Date(form.updatedAt).toLocaleString("vi-VN") : "—"}
                                        disabled={true}
                                        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 shrink-0">
                        {isViewMode ? (
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"
                            >
                                Đóng
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={submitting}
                                    className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Thêm mới"}
                                </button>
                            </>
                        )}
                    </footer>
                </form>
            </aside>
        </div>
    );
}
