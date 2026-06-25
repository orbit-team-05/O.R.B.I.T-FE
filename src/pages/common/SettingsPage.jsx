import { useEffect, useState } from "react";
import { Lock, User, KeyRound, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { getProfile, updateProfile, changePassword } from "../../features/profile/services/profileApi";
import { useToast } from "../../components/common/toast/ToastProvider";

export function SettingsPage() {
    const { updateAuthUser } = useAuth();
    const toast = useToast();

    const [activeTab, setActiveTab] = useState("profile"); // "profile" | "password"
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        roles: [],
        farmName: "",
    });
    const [profileErrors, setProfileErrors] = useState({});

    // Password State
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [errorMsg, setErrorMsg] = useState("");

    // Load Profile Data
    useEffect(() => {
        let isMounted = true;
        async function fetchProfile() {
            try {
                setLoading(true);
                const data = await getProfile();
                if (isMounted) {
                    setProfile({
                        username: data.username || "",
                        fullName: data.fullName || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        roles: data.roles || [],
                        farmName: data.farmName || "Không có",
                    });
                }
            } catch (err) {
                console.error(err);
                toast.error("Không thể tải thông tin tài khoản.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchProfile();
        return () => {
            isMounted = false;
        };
    }, [toast]);

    // Validate Profile
    function validateProfile() {
        const errors = {};
        if (!profile.fullName.trim()) {
            errors.fullName = "Họ và tên không được để trống";
        }
        if (!profile.email.trim()) {
            errors.email = "Email không được để trống";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
            errors.email = "Email không đúng định dạng";
        }
        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    }

    // Handle Save Profile
    async function handleSaveProfile(e) {
        e.preventDefault();
        if (!validateProfile()) return;

        try {
            setSubmitting(true);
            const updated = await updateProfile({
                fullName: profile.fullName.trim(),
                email: profile.email.trim(),
                phone: profile.phone ? profile.phone.trim() : "",
            });

            // Update Auth Context & Local Storage
            updateAuthUser({
                fullName: updated.fullName,
                email: updated.email,
            });

            toast.success("Cập nhật thông tin cá nhân thành công.");
            setProfileErrors({});
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || "Cập nhật thất bại.";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    // Validate Password
    function validatePassword() {
        const errors = {};
        if (!passwordForm.oldPassword) {
            errors.oldPassword = "Mật khẩu hiện tại không được để trống";
        }
        if (!passwordForm.newPassword) {
            errors.newPassword = "Mật khẩu mới không được để trống";
        } else {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
            if (!passwordRegex.test(passwordForm.newPassword)) {
                errors.newPassword = "Mật khẩu mới phải từ 8 ký tự trở lên, bao gồm chữ hoa, chữ thường, chữ số và ít nhất một ký tự đặc biệt";
            }
        }
        if (!passwordForm.confirmNewPassword) {
            errors.confirmNewPassword = "Xác nhận mật khẩu không được để trống";
        } else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            errors.confirmNewPassword = "Xác nhận mật khẩu mới không khớp";
        }
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    }

    // Handle Change Password
    async function handleChangePassword(e) {
        e.preventDefault();
        setErrorMsg("");
        if (!validatePassword()) return;

        try {
            setSubmitting(true);
            await changePassword({
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
                confirmNewPassword: passwordForm.confirmNewPassword,
            });

            toast.success("Thay đổi mật khẩu thành công.");
            setPasswordForm({
                oldPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            });
            setPasswordErrors({});
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || "Thay đổi mật khẩu thất bại.";
            setErrorMsg(message);
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

    const inputClass = (hasError) => `
        mt-1.5 h-10 w-full rounded-lg border px-3 text-sm text-slate-900 outline-none transition-all duration-150 focus:ring-2
        ${hasError 
            ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
            : "border-slate-300 focus:border-[#006948] focus:ring-emerald-100"
        }
    `;

    return (
        <div className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6 lg:px-8">
            <header className="mb-6 border-b border-slate-200 bg-white px-6 py-5 rounded-2xl shadow-sm">
                <p className="text-sm font-semibold text-[#006948]">Cài đặt tài khoản</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Thiết lập tài khoản</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Cập nhật thông tin cá nhân và thay đổi mật khẩu của bạn.
                </p>
            </header>

            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                {/* Vertical Tabs Sidebar */}
                <aside className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm h-fit">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 ${
                            activeTab === "profile"
                                ? "bg-[#006948] text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        <User size={18} />
                        <span>Thông tin cá nhân</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("password")}
                        className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 ${
                            activeTab === "password"
                                ? "bg-[#006948] text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        <Lock size={18} />
                        <span>Đổi mật khẩu</span>
                    </button>
                </aside>

                {/* Main Settings Card */}
                <main className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    {activeTab === "profile" ? (
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Thông tin cá nhân</h2>
                                <p className="text-xs text-slate-500 mt-1">Cấu hình chi tiết các thông tin liên lạc cá nhân.</p>
                            </div>

                            {/* Read Only Stats Area */}
                            <div className="grid gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200 sm:grid-cols-3">
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tên đăng nhập</span>
                                    <p className="mt-1 text-sm font-bold text-slate-700">{profile.username}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vai trò</span>
                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                        {profile.roles.map(r => (
                                            <span key={r.id} className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-[#006948] border border-emerald-200">
                                                {r.roleName === "ADMIN" ? "Admin Hệ thống" : r.roleName === "OWNER" ? "Chủ nông trại" : "Nhân viên"}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nông trại</span>
                                    <p className="mt-1 text-sm font-bold text-slate-700">{profile.farmName}</p>
                                </div>
                            </div>

                            {/* Editable Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Họ và tên</label>
                                    <input
                                        type="text"
                                        value={profile.fullName}
                                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                        className={inputClass(!!profileErrors.fullName)}
                                        placeholder="Ví dụ: Nguyễn Văn A"
                                    />
                                    {profileErrors.fullName && (
                                        <p className="mt-1 text-xs text-red-500 font-medium">{profileErrors.fullName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
                                    <input
                                        type="text"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        className={inputClass(!!profileErrors.email)}
                                        placeholder="user@example.com"
                                    />
                                    {profileErrors.email && (
                                        <p className="mt-1 text-xs text-red-500 font-medium">{profileErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Số điện thoại</label>
                                    <input
                                        type="text"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className={inputClass(false)}
                                        placeholder="Ví dụ: 0987654321"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end border-t border-slate-100 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-6 text-sm font-bold text-white hover:bg-[#00583d] disabled:opacity-55 transition-all shadow-sm"
                                >
                                    {submitting ? "Đang xử lý..." : (
                                        <>
                                            <CheckCircle2 size={16} />
                                            Lưu thay đổi
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Đổi mật khẩu</h2>
                                <p className="text-xs text-slate-500 mt-1">Cập nhật mật khẩu bảo mật mới cho tài khoản của bạn.</p>
                            </div>

                            {errorMsg && (
                                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    <ShieldAlert size={18} className="shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mật khẩu hiện tại</label>
                                    <input
                                        type="password"
                                        value={passwordForm.oldPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                        className={inputClass(!!passwordErrors.oldPassword)}
                                        placeholder="Nhập mật khẩu hiện tại"
                                    />
                                    {passwordErrors.oldPassword && (
                                        <p className="mt-1 text-xs text-red-500 font-medium">{passwordErrors.oldPassword}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className={inputClass(!!passwordErrors.newPassword)}
                                        placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                                    />
                                    {passwordErrors.newPassword && (
                                        <p className="mt-1 text-xs text-red-500 font-medium">{passwordErrors.newPassword}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Xác nhận mật khẩu mới</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmNewPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                                        className={inputClass(!!passwordErrors.confirmNewPassword)}
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                    {passwordErrors.confirmNewPassword && (
                                        <p className="mt-1 text-xs text-red-500 font-medium">{passwordErrors.confirmNewPassword}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end border-t border-slate-100 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-6 text-sm font-bold text-white hover:bg-[#00583d] disabled:opacity-55 transition-all shadow-sm"
                                >
                                    {submitting ? "Đang xử lý..." : (
                                        <>
                                            <KeyRound size={16} />
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
