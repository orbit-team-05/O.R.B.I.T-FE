import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../services/authApi";

const STORAGE_TOKEN_KEY = "orbit_access_token";
const STORAGE_USER_KEY = "orbit_user";

const AuthContext = createContext(null);

/**
 * Trả về dashboard mặc định theo role đầu tiên của user.
 */
function getDefaultDashboard(roles = []) {
    if (roles.includes("ADMIN")) return "/admin/dashboard";
    if (roles.includes("OWNER")) return "/owner/dashboard";
    if (roles.includes("STAFF")) return "/staff/dashboard";

    return "/login";
}

/**
 * Đọc dữ liệu user đã lưu từ localStorage.
 */
function loadStoredAuth() {
    try {
        const token = localStorage.getItem(STORAGE_TOKEN_KEY);
        const userJson = localStorage.getItem(STORAGE_USER_KEY);

        if (token && userJson) {
            return { token, user: JSON.parse(userJson) };
        }
    } catch {
        // Dữ liệu hỏng → xoá
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
    }

    return { token: null, user: null };
}

export function AuthProvider({ children }) {
    const navigate = useNavigate();

    const [token, setToken] = useState(() => loadStoredAuth().token);
    const [user, setUser] = useState(() => loadStoredAuth().user);
    const [loading, setLoading] = useState(false);

    // Đồng bộ nếu localStorage bị xoá từ tab khác (ví dụ: 401 interceptor)
    useEffect(() => {
        function handleStorageChange(e) {
            if (e.key === STORAGE_TOKEN_KEY && !e.newValue) {
                setToken(null);
                setUser(null);
            }
        }

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const login = useCallback(async (identifier, password) => {
        try {
            setLoading(true);

            const data = await loginApi({ identifier, password });

            // Lưu vào localStorage
            localStorage.setItem(STORAGE_TOKEN_KEY, data.token);

            const userData = {
                userId: data.userId,
                email: data.email,
                fullName: data.fullName,
                roles: data.roles,
                farmId: data.farmId,
            };

            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));

            setToken(data.token);
            setUser(userData);

            // Redirect theo role
            const dashboard = getDefaultDashboard(data.roles);
            navigate(dashboard, { replace: true });

            return { success: true };
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Đăng nhập thất bại. Vui lòng thử lại.";

            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
        setToken(null);
        setUser(null);
        navigate("/login", { replace: true });
    }, [navigate]);

    const updateAuthUser = useCallback((newUserData) => {
        try {
            const currentUser = JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || "{}");
            const updatedUser = {
                ...currentUser,
                ...newUserData,
            };
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (err) {
            console.error("Lỗi cập nhật localStorage user:", err);
        }
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        updateAuthUser,
        getDefaultDashboard: () => getDefaultDashboard(user?.roles),
    }), [user, token, loading, login, logout, updateAuthUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }

    return context;
}
