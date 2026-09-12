import { useEffect, useState } from "react";
import {
    Lock,
    User,
    KeyRound,
    ShieldAlert,
    CheckCircle2,
    UploadCloud,
    LogOut,
} from "lucide-react";

import { useAuth } from "../../features/auth/context/AuthContext";
import {
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
} from "../../features/profile/services/profileApi";

import { AdminPageSkeleton } from "../../components/common/loading/AdminPageSkeleton";
import { useToast } from "../../components/common/toast/ToastProvider";
import { ImagePreviewModal } from "../../components/ui/ImagePreviewModal";

export function SettingsPage({
    pageTitle = "Cài đặt",
    pageDescription = "Cập nhật thông tin cá nhân và thay đổi mật khẩu.",
}) {
    const { updateAuthUser, logout, logoutAll } = useAuth();
    const toast = useToast();

    const [activeTab, setActiveTab] = useState("profile");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);

    const [profile, setProfile] = useState({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        roles: [],
        farmName: "",
        avatarUrl: "",
    });

    const [profileErrors, setProfileErrors] = useState({});

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const [passwordErrors, setPasswordErrors] = useState({});
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function fetchProfile() {
            try {
                setLoading(true);

                const data = await getProfile();

                if (!isMounted) {
                    return;
                }

                setProfile({
                    username: data?.username || "",
                    fullName: data?.fullName || "",
                    email: data?.email || "",
                    phone: data?.phone || "",
                    roles: Array.isArray(data?.roles)
                        ? data.roles
                        : [],
                    farmName: data?.farmName || "Không có",
                    avatarUrl: data?.avatarUrl || "",
                });
            } catch (err) {
                console.error(err);

                toast.error(
                    err?.response?.data?.message ||
                    "Không thể tải thông tin tài khoản.",
                );
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [toast]);

    async function handleAvatarUpload(event) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.");
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            toast.error("Ảnh đại diện không được vượt quá 20MB.");
            return;
        }

        try {
            setUploadingAvatar(true);
            const avatarUrl = await uploadAvatar(file);
            setProfile((current) => ({ ...current, avatarUrl: avatarUrl || "" }));
            updateAuthUser({ avatarUrl });
            toast.success("Cập nhật ảnh đại diện thành công.");
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Không thể tải ảnh đại diện lên.",
            );
        } finally {
            setUploadingAvatar(false);
        }
    }

    function validateProfile() {
        const errors = {};

        if (!profile.fullName.trim()) {
            errors.fullName =
                "Họ và tên không được để trống";
        }

        if (!profile.email.trim()) {
            errors.email =
                "Email không được để trống";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
        ) {
            errors.email =
                "Email không đúng định dạng";
        }

        setProfileErrors(errors);

        return Object.keys(errors).length === 0;
    }

    async function handleSaveProfile(event) {
        event.preventDefault();

        setErrorMsg("");

        if (!validateProfile()) {
            return;
        }

        try {
            setSubmitting(true);

            const updated = await updateProfile({
                fullName: profile.fullName.trim(),
                email: profile.email.trim(),
                phone: profile.phone?.trim() || "",
            });

            updateAuthUser({
                fullName: updated?.fullName,
                email: updated?.email,
            });

            toast.success(
                "Cập nhật thông tin cá nhân thành công.",
            );

            setProfileErrors({});
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Cập nhật thất bại.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    function validatePassword() {
        const errors = {};

        if (!passwordForm.oldPassword) {
            errors.oldPassword =
                "Mật khẩu hiện tại không được để trống";
        }

        if (!passwordForm.newPassword) {
            errors.newPassword =
                "Mật khẩu mới không được để trống";
        } else {
            const passwordRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

            if (!passwordRegex.test(passwordForm.newPassword)) {
                errors.newPassword =
                    "Mật khẩu mới phải có chữ hoa, chữ thường, số và ký tự đặc biệt.";
            }
        }

        if (!passwordForm.confirmNewPassword) {
            errors.confirmNewPassword =
                "Xác nhận mật khẩu không được để trống";
        } else if (
            passwordForm.newPassword !==
            passwordForm.confirmNewPassword
        ) {
            errors.confirmNewPassword =
                "Xác nhận mật khẩu không khớp";
        }

        setPasswordErrors(errors);

        return Object.keys(errors).length === 0;
    }

    async function handleChangePassword(event) {
        event.preventDefault();

        setErrorMsg("");

        if (!validatePassword()) {
            return;
        }

        try {
            setSubmitting(true);

            await changePassword({
                oldPassword:
                    passwordForm.oldPassword,
                newPassword:
                    passwordForm.newPassword,
                confirmNewPassword:
                    passwordForm.confirmNewPassword,
            });

            toast.success(
                "Đổi mật khẩu thành công. Các thiết bị khác đã được đăng xuất.",
            );

            setPasswordForm({
                oldPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            });

            setPasswordErrors({});
        } catch (err) {
            setErrorMsg(
                err?.response?.data?.message ||
                err?.message ||
                "Đổi mật khẩu thất bại.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleLogoutAll() {
        if (!window.confirm("Đăng xuất tất cả thiết bị? Thiết bị hiện tại cũng sẽ được đăng xuất.")) return;
        await logoutAll();
    }

    if (loading) {
        return <AdminPageSkeleton variant="settings" />;
    }

    const inputClass = (hasError) =>
        `
        mt-1.5 h-11 w-full rounded-lg border px-3 text-sm
        outline-none transition-all duration-150
        focus:ring-2
        ${
            hasError
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-[#006948] focus:ring-emerald-100"
        }
    `;

    return (
        <>
            <section className="space-y-5">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">{pageTitle}</h1>
                    <p className="mt-1 text-sm text-slate-600">{pageDescription}</p>
                </div>
            </header>

            <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                <aside className="flex h-fit flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <button
                        type="button"
                        onClick={() =>
                            setActiveTab("profile")
                        }
                        className={[
                            "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                            activeTab === "profile"
                                ? "bg-[#006948] text-white"
                                : "text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                    >
                        <User size={18} />
                        Thông tin cá nhân
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setActiveTab("password")
                        }
                        className={[
                            "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                            activeTab === "password"
                                ? "bg-[#006948] text-white"
                                : "text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                    >
                        <Lock size={18} />
                        Đổi mật khẩu
                    </button>

                    <div className="mt-3 border-t border-slate-100 pt-3">
                        <p className="px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Phiên đăng nhập</p>
                        <button type="button" onClick={logout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"><LogOut size={18} />Đăng xuất thiết bị này</button>
                        <button type="button" onClick={handleLogoutAll} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-50"><LogOut size={18} />Đăng xuất tất cả thiết bị</button>
                    </div>
                </aside>

                <main className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    {activeTab === "profile" ? (
                        <form
                            onSubmit={handleSaveProfile}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Thông tin cá nhân
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Quản lý thông tin tài khoản của bạn.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                                <button
                                    type="button"
                                    disabled={!profile.avatarUrl}
                                    onClick={() => setAvatarPreviewOpen(true)}
                                    className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm disabled:cursor-default"
                                    aria-label="Xem ảnh đại diện"
                                >
                                    {profile.avatarUrl ? (
                                        <img
                                            src={profile.avatarUrl}
                                            alt="Ảnh đại diện"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User size={40} className="text-slate-400" />
                                    )}
                                </button>

                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            Ảnh đại diện
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Nhấn vào ảnh để xem kích thước lớn. Nút tải ảnh nằm bên ngoài khung ảnh.
                                        </p>
                                    </div>

                                    <label
                                        htmlFor="admin-avatar-upload"
                                        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                    >
                                        <UploadCloud size={16} />
                                        {uploadingAvatar ? "Đang tải..." : "Chọn ảnh"}
                                    </label>
                                    <input
                                        id="admin-avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Tên đăng nhập
                                    </span>

                                    <p className="mt-1 text-sm font-bold text-slate-700">
                                        {profile.username}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Vai trò
                                    </span>

                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                        {profile.roles.length >
                                        0 ? (
                                            profile.roles.map(
                                                (
                                                    role,
                                                ) => (
                                                    <span
                                                        key={
                                                            role.id ||
                                                            role.roleName
                                                        }
                                                        className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-[#006948]"
                                                    >
                                                        {role.roleName}
                                                    </span>
                                                ),
                                            )
                                        ) : (
                                            <span className="text-xs text-slate-500">
                                                Không có vai trò
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Nông trại
                                    </span>

                                    <p className="mt-1 text-sm font-bold text-slate-700">
                                        {profile.farmName}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Họ và tên
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            profile.fullName
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setProfile({
                                                ...profile,
                                                fullName:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        }
                                        className={inputClass(
                                            !!profileErrors.fullName,
                                        )}
                                    />

                                    {profileErrors.fullName && (
                                        <p className="mt-1 text-xs font-medium text-red-500">
                                            {
                                                profileErrors.fullName
                                            }
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={
                                            profile.email
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setProfile({
                                                ...profile,
                                                email:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        }
                                        className={inputClass(
                                            !!profileErrors.email,
                                        )}
                                    />

                                    {profileErrors.email && (
                                        <p className="mt-1 text-xs font-medium text-red-500">
                                            {
                                                profileErrors.email
                                            }
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Số điện thoại
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            profile.phone
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setProfile({
                                                ...profile,
                                                phone:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        }
                                        className={inputClass(
                                            false,
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end border-t border-slate-100 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-6 text-sm font-bold text-white hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? (
                                        "Đang xử lý..."
                                    ) : (
                                        <>
                                            <CheckCircle2
                                                size={
                                                    16
                                                }
                                            />
                                            Lưu thay đổi
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form
                            onSubmit={
                                handleChangePassword
                            }
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Đổi mật khẩu
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Cập nhật mật khẩu bảo mật mới.
                                </p>
                            </div>

                            {errorMsg && (
                                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    <ShieldAlert
                                        size={18}
                                    />

                                    <span>
                                        {errorMsg}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-4">
                                {[
                                    {
                                        key: "oldPassword",
                                        label:
                                            "Mật khẩu hiện tại",
                                    },
                                    {
                                        key: "newPassword",
                                        label:
                                            "Mật khẩu mới",
                                    },
                                    {
                                        key: "confirmNewPassword",
                                        label:
                                            "Xác nhận mật khẩu",
                                    },
                                ].map((field) => (
                                    <div
                                        key={
                                            field.key
                                        }
                                    >
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            {
                                                field.label
                                            }
                                        </label>

                                        <input
                                            type="password"
                                            value={
                                                passwordForm[
                                                    field
                                                        .key
                                                ]
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setPasswordForm(
                                                    {
                                                        ...passwordForm,
                                                        [
                                                            field
                                                                .key
                                                        ]:
                                                            event
                                                                .target
                                                                .value,
                                                    },
                                                )
                                            }
                                            className={inputClass(
                                                !!passwordErrors[
                                                    field
                                                        .key
                                                ],
                                            )}
                                        />

                                        {passwordErrors[
                                            field.key
                                        ] && (
                                            <p className="mt-1 text-xs font-medium text-red-500">
                                                {
                                                    passwordErrors[
                                                        field
                                                            .key
                                                    ]
                                                }
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end border-t border-slate-100 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-6 text-sm font-bold text-white hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? (
                                        "Đang xử lý..."
                                    ) : (
                                        <>
                                            <KeyRound
                                                size={
                                                    16
                                                }
                                            />
                                            Cập nhật mật khẩu
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </main>
            </div>
        </section>

            <ImagePreviewModal
                open={avatarPreviewOpen}
                src={profile.avatarUrl}
                onClose={() => setAvatarPreviewOpen(false)}
            />
        </>
    );
}
