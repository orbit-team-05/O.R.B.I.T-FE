import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, logoutAllApi, logoutApi, refreshTokenApi } from "../services/authApi";
import { clearAccessToken, setAccessToken } from "../../../services/httpClient";

const STORAGE_USER_KEY = "orbit_user";

const AuthContext = createContext(null);

function normalizeRoles(data) {
    if (data?.role) return [data.role];
    return Array.isArray(data?.roles) ? data.roles : [];
}

function getDefaultDashboard(roles = []) {
    if (roles.includes("ADMIN")) return "/admin/dashboard";
    if (roles.includes("OWNER") || roles.includes("FARM_MANAGER")) return "/owner/dashboard";
    if (roles.includes("STAFF")) return "/staff/dashboard";
    return "/login";
}

function loadStoredUser() {
    try {
        const userJson = localStorage.getItem(STORAGE_USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    } catch {
        localStorage.removeItem(STORAGE_USER_KEY);
        return null;
    }
}

function mapAuthUser(data) {
    const roles = normalizeRoles(data);
    return {
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: data.role || roles[0] || null,
        roles,
        capabilities: data.capabilities || [],
        farmId: data.farmId,
        sessionId: data.sessionId,
        mustChangePassword: Boolean(data.mustChangePassword),
    };
}

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(() => loadStoredUser());
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function restoreSession() {
            if (!user) {
                setInitializing(false);
                return;
            }

            try {
                const data = await refreshTokenApi();
                if (!mounted) return;
                setAccessToken(data.token);
                setToken(data.token);
            } catch {
                if (!mounted) return;
                clearAccessToken();
                localStorage.removeItem(STORAGE_USER_KEY);
                setUser(null);
            } finally {
                if (mounted) setInitializing(false);
            }
        }

        restoreSession();
        return () => {
            mounted = false;
        };
        // Restore exactly once when the provider is mounted.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = useCallback(async (identifier, password) => {
        try {
            setLoading(true);
            const data = await loginApi({ identifier, password });
            const roles = normalizeRoles(data);

            const userData = mapAuthUser(data);
            setAccessToken(data.token);
            setToken(data.token);
            setUser(userData);
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
            navigate(getDefaultDashboard(roles), { replace: true });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error?.response?.data?.message || error?.message || "Đăng nhập thất bại. Vui lòng thử lại.",
            };
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const logout = useCallback(async () => {
        try {
            if (token) await logoutApi();
        } catch {
            // Local cleanup vẫn phải thực hiện khi server không phản hồi.
        } finally {
            clearAccessToken();
            localStorage.removeItem(STORAGE_USER_KEY);
            setToken(null);
            setUser(null);
            navigate("/login", { replace: true });
        }
    }, [navigate, token]);

    const logoutAll = useCallback(async () => {
        try {
            if (token) await logoutAllApi();
        } finally {
            clearAccessToken();
            localStorage.removeItem(STORAGE_USER_KEY);
            setToken(null);
            setUser(null);
            navigate("/login", { replace: true });
        }
    }, [navigate, token]);

    const updateAuthUser = useCallback((newUserData) => {
        const updatedUser = { ...(loadStoredUser() || {}), ...newUserData };
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        isAuthenticated: !!token,
        loading,
        initializing,
        login,
        logout,
        logoutAll,
        updateAuthUser,
        getDefaultDashboard: () => getDefaultDashboard(user?.roles || (user?.role ? [user.role] : [])),
    }), [user, token, loading, initializing, login, logout, logoutAll, updateAuthUser]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
    return context;
}
