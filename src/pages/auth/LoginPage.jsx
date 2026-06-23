import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

import orbitLogo from "../../assets/images/orbit-logo.png";
import { useAuth } from "../../features/auth/context/AuthContext";

const loginSchema = z.object({
    identifier: z
        .string()
        .min(1, "Email hoặc tên đăng nhập không được để trống"),
    password: z
        .string()
        .min(1, "Mật khẩu không được để trống"),
});

export function LoginPage() {
    const { login, loading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const reason = params.get("reason");
        if (reason === "user_locked") {
            setApiError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        } else if (reason === "concurrent_login") {
            setApiError("Tài khoản đã được đăng nhập ở thiết bị khác. Phiên làm việc này đã kết thúc.");
        } else if (reason === "session_expired") {
            setApiError("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
        }
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { identifier: "", password: "" },
    });

    async function onSubmit(data) {
        // Clear query params to prevent showing the warning again if they login and fail
        if (window.location.search) {
            window.history.replaceState(null, "", window.location.pathname);
        }
        setApiError("");

        const result = await login(data.identifier, data.password);

        if (!result.success) {
            setApiError(result.error);
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* ── Left panel: branding ── */}
            <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-[#006948] lg:flex">
                {/* Decorative circles */}
                <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-white/5" />
                <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-white/5" />
                <div className="absolute bottom-20 left-16 h-[200px] w-[200px] rounded-full bg-white/5" />

                <div className="relative z-10 flex max-w-md flex-col items-center px-10 text-center">
                    <img
                        src={orbitLogo}
                        alt="ORBIT"
                        className="mb-8 h-16 w-auto brightness-0 invert"
                    />

                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Hệ thống quản lý nông trại thông minh
                    </h1>

                    <p className="mt-4 text-base leading-relaxed text-white/70">
                        Quản lý vận hành, theo dõi mùa vụ, kho vật tư và thiết bị IoT
                        từ một nền tảng duy nhất.
                    </p>

                    <div className="mt-10 flex gap-8">
                        {[
                            // { value: "99.9%", label: "Uptime" },
                            { value: "24/7", label: "Giám sát" },
                            // { value: "AI", label: "Phân tích" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="mt-1 text-xs text-white/60">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right panel: login form ── */}
            <div className="flex w-full flex-col items-center justify-center bg-slate-50 px-6 py-12 lg:w-1/2">
                <div className="w-full max-w-[420px]">
                    {/* Mobile logo */}
                    <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
                        <img src={orbitLogo} alt="ORBIT" className="h-10 w-auto" />
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                Đăng nhập
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Nhập email và mật khẩu để truy cập hệ thống
                            </p>
                        </div>

                        {/* API error */}
                        {apiError && (
                            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                                    <span className="text-xs font-bold text-red-600">!</span>
                                </div>
                                <p className="text-sm leading-relaxed text-red-700">{apiError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                             {/* Email or Username */}
                            <div>
                                <label
                                    htmlFor="login-identifier"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Email hoặc Username
                                </label>

                                <div className="relative">
                                    <User
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="login-identifier"
                                        type="text"
                                        autoComplete="username"
                                        placeholder="Nhập email hoặc username"
                                        disabled={loading}
                                        {...register("identifier")}
                                        className={[
                                            "h-11 w-full rounded-lg border bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition",
                                            "placeholder:text-slate-400",
                                            "focus:border-[#006948] focus:bg-white focus:ring-2 focus:ring-[#006948]/10",
                                            "disabled:cursor-not-allowed disabled:opacity-60",
                                            errors.identifier
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                                : "border-slate-200",
                                        ].join(" ")}
                                    />
                                </div>

                                {errors.identifier && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.identifier.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="login-password"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Mật khẩu
                                </label>

                                <div className="relative">
                                    <Lock
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="Nhập mật khẩu"
                                        disabled={loading}
                                        {...register("password")}
                                        className={[
                                            "h-11 w-full rounded-lg border bg-slate-50 pl-10 pr-11 text-sm text-slate-700 outline-none transition",
                                            "placeholder:text-slate-400",
                                            "focus:border-[#006948] focus:bg-white focus:ring-2 focus:ring-[#006948]/10",
                                            "disabled:cursor-not-allowed disabled:opacity-60",
                                            errors.password
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                                : "border-slate-200",
                                        ].join(" ")}
                                    />

                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={[
                                    "flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors",
                                    "bg-[#006948] text-white hover:bg-[#00583d]",
                                    "disabled:cursor-not-allowed disabled:opacity-60",
                                ].join(" ")}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Đang đăng nhập...</span>
                                    </>
                                ) : (
                                    "Đăng nhập"
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-400">
                        © 2026 ORBIT — Hệ thống quản lý nông trại thông minh
                    </p>
                </div>
            </div>
        </div>
    );
}
