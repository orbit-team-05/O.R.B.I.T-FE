import { Camera, CalendarDays, Clock3, Mail, Phone, ShieldCheck, UploadCloud, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

import { UserStatusBadge } from "./UserStatusBadge";
import { ImagePreviewModal } from "../../../../components/ui/ImagePreviewModal";
import { PasswordInput } from "../../../../components/common/form/PasswordInput";

const INITIAL_FORM = {
    username: "",
    fullName: "",
    initialPassword: "",
    email: "",
    phone: "",
    status: "",
    createdAt: "",
    updatedAt: "",
    avatarUrl: "",
    roleIds: [],
    farmId: "",
    createFarm: true,
    farmName: "",
    farmLocation: "",
    farmAreaM2: "",
};

function formatDate(value) {
    if (!value) return "Chưa cập nhật";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
}

function roleLabel(role) {
    return {
        ADMIN: "Quản trị viên",
        OWNER: "Chủ nông trại",
        FARM_MANAGER: "Quản lý Farm",
        STAFF: "Nhân viên",
    }[role] || role || "Chưa phân quyền";
}

function UserDetailView({ user, onClose, onUploadAvatar }) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const roles = (user?.roles || []).map((role) => typeof role === "string" ? role : role.roleName);
    const primaryRole = roles[0];
    const initials = (user?.fullName || user?.username || "?")
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    function handleAvatarChange(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (file) onUploadAvatar?.(file);
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <button type="button" aria-label="Đóng chi tiết người dùng" className="fixed inset-0 bg-slate-950/25 backdrop-blur-[1px]" onClick={onClose} />
            <aside className="relative z-10 flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="admin-user-detail-title">
                <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Tài khoản người dùng</p>
                        <h2 id="admin-user-detail-title" className="mt-1 text-xl font-semibold text-slate-900">Chi tiết tài khoản</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng"><X size={21} /></button>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex shrink-0 flex-col items-center gap-2">
                                <button type="button" disabled={!user?.avatarUrl} onClick={() => setPreviewOpen(true)} className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-emerald-50 text-xl font-semibold text-[#006948] shadow-sm disabled:cursor-default">
                                    {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName || "Avatar"} className="h-full w-full object-cover" /> : initials}
                                </button>
                                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:border-[#006948]/30 hover:text-[#006948]" title="Tải ảnh đại diện lên">
                                    <UploadCloud size={14} />
                                    Tải ảnh
                                    <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg font-semibold text-slate-900">{user?.fullName || "Chưa cập nhật"}</h3>
                                    <span className={[
                                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                                        user?.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600",
                                    ].join(" ")}>
                                        <span className={["h-1.5 w-1.5 rounded-full", user?.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-400"].join(" ")} />
                                        {user?.status === "ACTIVE" ? "Đang hoạt động" : "Đã khóa"}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-500">@{user?.username || "—"} · {roleLabel(primaryRole)}</p>
                                <p className="mt-2 text-xs text-slate-400">JPEG/PNG/WebP, tối đa 20MB</p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-7">
                        <h4 className="text-sm font-semibold text-slate-900">Thông tin tài khoản</h4>
                        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Username</p><p className="mt-1 text-sm text-slate-800">@{user?.username || "Chưa cập nhật"}</p></div>
                            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Vai trò</p><p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-800"><ShieldCheck size={15} className="text-[#006948]" />{roleLabel(primaryRole)}</p></div>
                            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</p><p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-800"><Mail size={15} className="text-slate-400" />{user?.email || "Chưa cập nhật"}</p></div>
                            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Số điện thoại</p><p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-800"><Phone size={15} className="text-slate-400" />{user?.phone || user?.phoneNumber || "Chưa cập nhật"}</p></div>
                        </div>
                    </section>

                    <section className="mt-7 border-t border-slate-100 pt-6">
                        <h4 className="text-sm font-semibold text-slate-900">Phạm vi Farm</h4>
                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center gap-3"><UserRound size={18} className="text-[#006948]" /><div><p className="text-xs uppercase tracking-wide text-slate-400">Nông trại trực thuộc</p><p className="mt-1 text-sm font-medium text-slate-800">{user?.farmName || "Chưa liên kết"}</p></div></div>
                        </div>
                    </section>

                    <section className="mt-7 border-t border-slate-100 pt-6">
                        <h4 className="text-sm font-semibold text-slate-900">Thông tin hệ thống</h4>
                        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Ngày tạo</p><p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-800"><CalendarDays size={15} className="text-slate-400" />{formatDate(user?.createdAt)}</p></div>
                            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Cập nhật gần nhất</p><p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-800"><Clock3 size={15} className="text-slate-400" />{formatDate(user?.updatedAt)}</p></div>
                            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Lần đăng nhập cuối</p><p className="mt-1 text-sm text-slate-800">{formatDate(user?.lastLoginAt)}</p></div>
                        </div>
                    </section>
                </div>

                <footer className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button type="button" onClick={onClose} className="rounded-xl bg-[#006948] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00583d]">Đóng</button>
                </footer>
            </aside>
            <ImagePreviewModal open={previewOpen} src={user?.avatarUrl} onClose={() => setPreviewOpen(false)} />
        </div>
    );
}

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
    onUploadAvatar,
}) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [validationError, setValidationError] = useState("");
    const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);

    const isEditMode = mode === "edit";
    const isViewMode = mode === "view";

    const selectedRoles = roles.filter((role) => form.roleIds.includes(role.id));
    const selectedRoleNames = selectedRoles.map((role) => role.roleName);

    const isOwnerSelected = selectedRoleNames.includes("OWNER");
    const isStaffSelected = selectedRoleNames.includes("STAFF");
    const isFarmManagerSelected = selectedRoleNames.includes("FARM_MANAGER");
    const isAdminSelected = selectedRoleNames.includes("ADMIN");

    const farmRequired = isEditMode || isStaffSelected || isFarmManagerSelected;
    const farmSelectDisabled = isViewMode || (!isEditMode && !isStaffSelected && !isFarmManagerSelected);

    useEffect(() => {
        if (!open) return;

        if ((isEditMode || isViewMode) && user) {
            // Normalize roles since user.roles could be a list of strings or RoleResponseDTO objects
            const roleNames = user.roles
                ? user.roles.map((r) => (typeof r === "string" ? r : r.roleName))
                : [];

            // The drawer form is intentionally synchronized with the selected user when it opens.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setForm({
                username: user.username ?? "",
                fullName: user.fullName ?? "",
                initialPassword: "",
                email: user.email ?? "",
                phone: user.phone ?? "",
                status: user.status ?? "",
                createdAt: user.createdAt ?? "",
                updatedAt: user.updatedAt ?? "",
                avatarUrl: user.avatarUrl ?? "",
                // Find matching role IDs from the roles array using role name
                roleIds: roles
                      .filter((r) => roleNames.includes(r.roleName))
                      .map((r) => r.id),
                farmId: user.farmId ?? "",
                createFarm: false,
                farmName: "",
                farmLocation: "",
                farmAreaM2: "",
            });
            setValidationError("");
            setAvatarPreviewOpen(false);
            return;
        }

        setForm(INITIAL_FORM);
        setValidationError("");
        setAvatarPreviewOpen(false);
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

        const selectedRole = roles.find((role) => role.id === roleId);

        setForm((prev) => {
            const exists = prev.roleIds.includes(roleId);

            if (exists) {
                return {
                    ...prev,
                    roleIds: [],
                    farmId: "",
                };
            }

            /*
             * Tạm thời cho mỗi user chỉ chọn 1 vai trò chính:
             * ADMIN / OWNER / STAFF.
             */
            return {
                ...prev,
                roleIds: [roleId],
                farmId: ["STAFF", "FARM_MANAGER"].includes(selectedRole?.roleName)
                    ? prev.farmId
                    : "",
            };
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
            setValidationError("Vui lòng chọn một vai trò");
            return;
        }

        if (!isEditMode && (form.initialPassword.length < 8 || form.initialPassword.length > 72)) {
            setValidationError("Mật khẩu ban đầu phải từ 8 đến 72 ký tự.");
            return;
        }

        const selectedRoles = roles.filter((role) => form.roleIds.includes(role.id));
        const roleNames = selectedRoles.map((role) => role.roleName);

        const isStaff = roleNames.includes("STAFF");
        const isFarmManager = roleNames.includes("FARM_MANAGER");
        const isOwner = roleNames.includes("OWNER");
        const isAdmin = roleNames.includes("ADMIN");

        if ([isStaff, isFarmManager, isOwner, isAdmin].filter(Boolean).length > 1) {
            setValidationError("Một tài khoản chỉ được chọn một vai trò chính.");
            return;
        }

        /*
         * UPDATE: không sửa BE update nên vẫn giữ luật cũ:
         * phải gửi farmId.
         */
        if (isEditMode) {
            if ((isStaff || isFarmManager) && !form.farmId) {
                setValidationError("Khi cập nhật tài khoản, vui lòng chọn nông trại trực thuộc.");
                return;
            }

            onSubmit({
                role: roleNames[0],
                farmId: isStaff || isFarmManager ? Number(form.farmId) : null,
            });

            return;
        }

        /*
         * CREATE:
         * OWNER -> farmId null
         * ADMIN -> farmId null
         * STAFF/FARM_MANAGER -> bắt buộc farmId
         */
        if ((isStaff || isFarmManager) && !form.farmId) {
            setValidationError("Nhân viên phải được gán vào một nông trại.");
            return;
        }

        if (isOwner && form.createFarm && !isEditMode) {
            if (!form.farmName.trim() || !form.farmLocation.trim()) {
                setValidationError("Vui lòng nhập tên và địa chỉ Farm cho Owner.");
                return;
            }
        }

        const payload = {
            username: form.username.trim(),
            fullName: form.fullName.trim(),
            initialPassword: form.initialPassword,
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            role: roleNames[0],
            farmId: isStaff || isFarmManager ? Number(form.farmId) : null,
        };

        if (isOwner && form.createFarm) {
            payload.farmDraft = {
                farmName: form.farmName.trim(),
                location: form.farmLocation.trim(),
                areaM2: form.farmAreaM2 === "" ? null : Number(form.farmAreaM2),
            };
        }

        onSubmit(payload);
    }

    if (!open) return null;

    if (isViewMode) {
        return <UserDetailView user={user} onClose={onClose} onUploadAvatar={onUploadAvatar} />;
    }

    return (
        <div className="fixed inset-0 z-50" role="presentation">
            <button
                type="button"
                aria-label="Đóng drawer"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/20"
            />

            <aside
                aria-labelledby="user-drawer-title"
                aria-modal="true"
                className="absolute right-0 top-0 flex h-full w-full flex-col border-l border-slate-200 bg-white shadow-xl md:w-2/3"
                role="dialog"
            >
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <h2 id="user-drawer-title" className="text-base font-semibold text-slate-900">
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
                            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-2.5 text-xs leading-relaxed text-blue-800">
                                <span className="font-semibold">Mật khẩu ban đầu:</span> Người dùng sẽ bắt buộc đổi mật khẩu này sau lần đăng nhập đầu tiên.
                            </div>
                        )}

                        {!isEditMode && !isViewMode && (
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                    Mật khẩu ban đầu *
                                </label>
                                <PasswordInput
                                    name="initialPassword"
                                    value={form.initialPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    minLength={8}
                                    maxLength={72}
                                    placeholder="Tối thiểu 8 ký tự"
                                    inputClassName="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    Chỉ lưu dưới dạng mã hóa; không hiển thị lại sau khi tạo.
                                </p>
                            </div>
                        )}

                        {(error || validationError) && !isViewMode && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                                {error || validationError}
                            </div>
                        )}

                        {(isViewMode || isEditMode) && (
                            <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div className="relative">
                                <button
                                    type="button"
                                    disabled={!form.avatarUrl}
                                    onClick={() => setAvatarPreviewOpen(true)}
                                    className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm disabled:cursor-default"
                                    aria-label="Xem ảnh đại diện người dùng"
                                >
                                    {form.avatarUrl ? (
                                        <img
                                            src={form.avatarUrl}
                                            alt={`Ảnh đại diện của ${form.fullName || "người dùng"}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs text-slate-500">Chưa có ảnh</span>
                                    )}
                                </button>
                                {!isViewMode && (
                                    <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full border-2 border-white bg-[#006948] p-2 text-white shadow-sm hover:bg-[#00583d]" title="Tải ảnh lên">
                                        <Camera size={14} />
                                        <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; onUploadAvatar?.(file); }} />
                                    </label>
                                )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Ảnh đại diện</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Nhấn vào ảnh để xem bản lớn. JPEG/PNG/WebP, tối đa 20MB.
                                    </p>
                                </div>
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

                        <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                    Email
                                </label>

                                <input
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={isViewMode || isEditMode}
                                    placeholder="Chưa cập nhật"
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                />
                        </div>

                        <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                    Số điện thoại
                                </label>

                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    disabled={isViewMode || isEditMode}
                                    placeholder="Chưa cập nhật"
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Vai trò (Roles) *
                            </label>

                            <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50">
                                {roles.map((role) => (
                                    <label key={role.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                                        <input
                                            type="radio"
                                            name="userRole"
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
                                Nông trại (Farm) {farmRequired ? "*" : ""}
                            </label>

                            <select
                                name="farmId"
                                value={form.farmId}
                                onChange={handleChange}
                                disabled={farmSelectDisabled}
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                            >
                                <option value="">
                                        {isEditMode || isStaffSelected || isFarmManagerSelected
                                            ? "-- Chọn nông trại trực thuộc --"
                                            : "-- Không cần chọn nông trại --"}
                                </option>

                                {farms.map((farm) => (
                                    <option key={farm.id} value={farm.id}>
                                        {farm.farmName}
                                    </option>
                                ))}
                            </select>

                            {!isEditMode && !isViewMode && isOwnerSelected && (
                                <p className="mt-1.5 text-xs text-amber-700">
                                    Owner được tạo trước. Sau đó vào màn hình Farm để tạo nông trại và chọn owner này.
                                </p>
                            )}

                            {!isViewMode && isAdminSelected && (
                                <p className="mt-1.5 text-xs text-slate-500">
                                    Admin không trực thuộc nông trại.
                                </p>
                            )}

                            {!isViewMode && isStaffSelected && (
                                <p className="mt-1.5 text-xs text-slate-500">
                                    Staff bắt buộc phải thuộc một nông trại.
                                </p>
                            )}

                            {!isViewMode && isFarmManagerSelected && (
                                <p className="mt-1.5 text-xs text-slate-500">
                                    Farm Manager bắt buộc phải thuộc một nông trại.
                                </p>
                            )}
                        </div>

                        {!isEditMode && !isViewMode && isOwnerSelected && (
                            <div className="space-y-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        name="createFarm"
                                        checked={form.createFarm}
                                        onChange={(event) => setForm((prev) => ({
                                            ...prev,
                                            createFarm: event.target.checked,
                                        }))}
                                        className="rounded border-slate-300 text-[#006948] focus:ring-[#006948]"
                                    />
                                    Tạo Farm ngay cho Owner
                                </label>

                                {form.createFarm && (
                                    <>
                                        <input
                                            name="farmName"
                                            value={form.farmName}
                                            onChange={handleChange}
                                            placeholder="Tên Farm *"
                                            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                                        />
                                        <input
                                            name="farmLocation"
                                            value={form.farmLocation}
                                            onChange={handleChange}
                                            placeholder="Địa chỉ Farm *"
                                            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                                        />
                                        <input
                                            name="farmAreaM2"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.farmAreaM2}
                                            onChange={handleChange}
                                            placeholder="Diện tích (m², tùy chọn)"
                                            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {isViewMode && (
                            <>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                        Trạng thái
                                    </label>
                                    <div className="flex items-center">
                                        <UserStatusBadge status={form.status} />
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

            <ImagePreviewModal
                open={avatarPreviewOpen}
                src={form.avatarUrl}
                onClose={() => setAvatarPreviewOpen(false)}
            />
        </div>
    );
}
