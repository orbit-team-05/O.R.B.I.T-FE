import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    User,
    Lock,
    Eye,
    EyeOff,
    Loader2,
} from "lucide-react";

import orbitLogo from "../../assets/images/orbit-logo.png";
import { useAuth } from "../../features/auth/context/AuthContext";

const loginSchema = z.object({
    identifier: z
        .string()
        .trim()
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

        switch (reason) {
            case "user_locked":
                setApiError(
                    "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
                );
                break;

            case "concurrent_login":
                setApiError(
                    "Tài khoản đã đăng nhập ở thiết bị khác.",
                );
                break;

            case "session_expired":
                setApiError(
                    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
                );
                break;

            default:
                break;
        }
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),

        defaultValues: {
            identifier: "",
            password: "",
        },
    });

    async function onSubmit(data) {
        try {
            setApiError("");

            // Clear query params
            if (window.location.search) {
                window.history.replaceState(
                    {},
                    document.title,
                    window.location.pathname,
                );
            }

            const result = await login(
                data.identifier.trim(),
                data.password,
            );

            if (!result?.success) {
                setApiError(
                    result?.error ||
                        "Đăng nhập thất bại. Vui lòng thử lại.",
                );
            }
        } catch (error) {
            console.error("Login error:", error);

            setApiError(
                "Không thể kết nối tới hệ thống.",
            );
        }
    }

    const inputClass = (hasError) =>
        [
            "h-11 w-full rounded-lg border bg-slate-50 text-sm text-slate-700 outline-none transition",
            "placeholder:text-slate-400",
            "focus:bg-white focus:ring-2",
            "disabled:cursor-not-allowed disabled:opacity-60",

            hasError
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                : "border-slate-200 focus:border-[#006948] focus:ring-[#006948]/10",
        ].join(" ");

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* LEFT PANEL */}
            <div className="relative hidden w-1/2 overflow-hidden bg-[#006948] lg:flex lg:items-center lg:justify-center">
                <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-white/5" />

                <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-white/5" />

                <div className="relative z-10 max-w-md px-10 text-center">
                    <img
                        src={orbitLogo}
                        alt="ORBIT"
                        className="mx-auto mb-8 h-16 w-auto brightness-0 invert"
                    />

                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Hệ thống quản lý nông trại thông minh
                    </h1>

                    <p className="mt-4 text-base leading-relaxed text-white/70">
                        Quản lý vận hành, theo dõi mùa vụ,
                        kho vật tư và thiết bị IoT
                        trên một nền tảng duy nhất.
                    </p>

                    <div className="mt-10">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">
                                24/7
                            </p>

                            <p className="mt-1 text-xs text-white/60">
                                Giám sát hệ thống
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
                <div className="w-full max-w-[420px]">
                    {/* Mobile Logo */}
                    <div className="mb-8 flex justify-center lg:hidden">
                        <img
                            src={orbitLogo}
                            alt="ORBIT"
                            className="h-12 w-auto"
                        />
                    </div>

                    {/* LOGIN CARD */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                Đăng nhập
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Nhập tài khoản và mật khẩu
                                để truy cập hệ thống
                            </p>
                        </div>

                        {/* ERROR */}
                        {apiError && (
                            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                                <p className="text-sm text-red-700">
                                    {apiError}
                                </p>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-5"
                        >
                            {/* IDENTIFIER */}
                            <div>
                                <label
                                    htmlFor="identifier"
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
                                        id="identifier"
                                        type="text"
                                        autoComplete="username"
                                        placeholder="Nhập email hoặc username"
                                        disabled={loading}
                                        {...register("identifier")}
                                        className={`${inputClass(
                                            errors.identifier,
                                        )} pl-10 pr-4`}
                                    />
                                </div>

                                {errors.identifier && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.identifier.message}
                                    </p>
                                )}
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label
                                    htmlFor="password"
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
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="current-password"
                                        placeholder="Nhập mật khẩu"
                                        disabled={loading}
                                        {...register("password")}
                                        className={`${inputClass(
                                            errors.password,
                                        )} pl-10 pr-11`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* SUBMIT */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#006948] text-sm font-semibold text-white transition hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />

                                        <span>
                                            Đang đăng nhập...
                                        </span>
                                    </>
                                ) : (
                                    "Đăng nhập"
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-400">
                        © 2026 ORBIT — Smart Farm Management
                    </p>
                </div>
            </div>
        </div>
    );
}