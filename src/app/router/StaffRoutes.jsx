import { Navigate, Route, Routes } from "react-router-dom";

import { StaffLayout } from "../../layouts/staff/StaffLayout";
import { StaffDashboardPage } from "../../pages/staff/dashboard/StaffDashboardPage";
import { SettingsPage } from "../../pages/common/SettingsPage";
import { StaffFarmDataPage } from "../../pages/staff/lookup/StaffFarmDataPage";
import { StaffScalePage } from "../../pages/staff/devices/StaffScalePage";
import { StaffTransactionsPage } from "../../pages/staff/transactions/StaffTransactionsPage";
import { StaffTransactionHistoryPage } from "../../pages/staff/transactions/StaffTransactionHistoryPage";

export function StaffRoutes() {
    return (
        <Routes>
            <Route element={<StaffLayout />}>
                <Route index element={<Navigate to="/staff/dashboard" replace />} />
                <Route path="dashboard" element={<StaffDashboardPage />} />
                <Route path="transactions" element={<StaffTransactionsPage />} />
                <Route path="transaction-history" element={<StaffTransactionHistoryPage />} />
                <Route path="lookup" element={<StaffFarmDataPage />} />
                <Route path="devices" element={<StaffScalePage />} />
                <Route path="settings" element={<SettingsPage pageTitle="Cài đặt tài khoản" pageDescription="Cập nhật thông tin cá nhân và thay đổi mật khẩu." />} />
                <Route path="*" element={<Navigate to="/staff/dashboard" replace />} />
            </Route>
        </Routes>
    );
}
