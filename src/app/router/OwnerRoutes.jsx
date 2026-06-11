import { Navigate, Route, Routes } from "react-router-dom";

import { AdminComingSoonPage } from "../../pages/admin/common/AdminComingSoonPage";

export function OwnerRoutes() {
    return (
        <Routes>
            <Route index element={<Navigate to="/owner/dashboard" replace />} />

            <Route
                path="dashboard"
                element={
                    <AdminComingSoonPage
                        title="Owner Dashboard"
                        description="Màn hình Owner đang được triển khai sau."
                    />
                }
            />

            <Route
                path="*"
                element={
                    <AdminComingSoonPage
                        title="Tính năng Owner đang phát triển"
                        description="Màn hình này chưa được triển khai trong giai đoạn hiện tại."
                    />
                }
            />
        </Routes>
    );
}