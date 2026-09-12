import { useState } from "react";
import { KeyRound, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../features/auth/context/AuthContext";
import { changePassword } from "../../features/profile/services/profileApi";

export function ForcePasswordChangePage() {
    const { updateAuthUser, logout, getDefaultDashboard } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (form.newPassword.length < 8) {
            setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
            return;
        }

        if (form.newPassword !== form.confirmNewPassword) {
            setError("Xác nhận mật khẩu mới không khớp.");
            return;
        }

        try {
            setSubmitting(true);
            await changePassword(form);
            updateAuthUser({ mustChangePassword: false });
            navigate(getDefaultDashboard(), { replace: true });
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Không thể đổi mật khẩu.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
            <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <KeyRound size={24} />
                </div>
                <h1 className="mt-5 text-2xl font-semibold text-slate-900">Đổi mật khẩu bắt buộc</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    Đây là lần đăng nhập đầu tiên của tài khoản. Hãy đổi mật khẩu ban đầu để tiếp tục sử dụng hệ thống.
                </p>

                {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <label className="block text-sm font-medium text-slate-700">
                        Mật khẩu ban đầu
                        <input type="password" name="oldPassword" value={form.oldPassword} onChange={handleChange} autoComplete="current-password" required className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15" />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                        Mật khẩu mới
                        <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} autoComplete="new-password" minLength={8} required className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15" />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                        Xác nhận mật khẩu mới
                        <input type="password" name="confirmNewPassword" value={form.confirmNewPassword} onChange={handleChange} autoComplete="new-password" minLength={8} required className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15" />
                    </label>
                    <button type="submit" disabled={submitting} className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white transition hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-60">
                        {submitting ? "Đang cập nhật..." : "Đổi mật khẩu và tiếp tục"}
                    </button>
                </form>

                <button type="button" onClick={logout} className="mt-4 inline-flex w-full items-center justify-center gap-2 text-sm text-slate-500 hover:text-red-600">
                    <LogOut size={16} /> Đăng xuất
                </button>
            </section>
        </main>
    );
}
