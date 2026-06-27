import { useEffect, useState } from "react";
import {
    Lock,
    User,
    KeyRound,
    ShieldAlert,
    CheckCircle2,
} from "lucide-react";

import { useAuth } from "../../features/auth/context/AuthContext";
import {
    getProfile,
    updateProfile,
    changePassword,
} from "../../features/profile/services/profileApi";

import { useToast } from "../../components/common/toast/ToastProvider";

export function SettingsPage() {
    const { updateAuthUser } = useAuth();
    const toast = useToast();

    const [activeTab, setActiveTab] = useState("profile");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [profile, setProfile] = useState({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        roles: [],
        farmName: "",
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
                "Đổi mật khẩu thành công.",
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

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#006948]" />
            </div>
        );
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
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                <p className="text-sm font-semibold text-[#006948]">
                    Cài đặt tài khoản
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Thiết lập tài khoản
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Cập nhật thông tin cá nhân và thay đổi mật khẩu.
                </p>
            </header>

            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
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
        </div>
    );
}

