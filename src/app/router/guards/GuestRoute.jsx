import { Navigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthContext";

/**
 * Chỉ cho phép truy cập khi chưa đăng nhập (ví dụ: trang login).
 * Nếu đã đăng nhập → redirect về dashboard.
 */
export function GuestRoute({ children }) {
    const { isAuthenticated, getDefaultDashboard } = useAuth();

    if (isAuthenticated) {
        return <Navigate to={getDefaultDashboard()} replace />;
    }

    return children;
}
