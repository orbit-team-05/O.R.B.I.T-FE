import { Navigate, Route, Routes } from "react-router-dom";

import { OwnerLayout } from "../../layouts/owner/OwnerLayout";
import { OwnerComingSoonPage } from "../../pages/owner/common/OwnerComingSoonPage";
import { OwnerIotDevicesPage } from "../../pages/owner/devices/OwnerIotDevicesPage";
import { OwnerIotScansPage } from "../../pages/owner/iot-scans/OwnerIotScansPage";
import { OwnerAiReviewsPage } from "../../pages/owner/ai-reviews/OwnerAiReviewsPage";
import { OwnerProductsPage } from "../../pages/owner/products/OwnerProductsPage";
import { OwnerIotImportsPage } from "../../pages/owner/iot-imports/OwnerIotImportsPage";
import { OwnerMarketPricesPage } from "../../pages/owner/market-prices/OwnerMarketPricesPage";
import OwnerDashboardPage from "../../pages/owner/dashboard/OwnerDashboardPage";

export function OwnerRoutes() {
    return (
        <Routes>
            <Route element={<OwnerLayout />}>
                <Route index element={<Navigate to="/owner/dashboard" replace />} />

                <Route
                    path="dashboard"
                    element={<OwnerDashboardPage />}
                />

                <Route
                    path="farms"
                    element={
                        <OwnerComingSoonPage
                            title="Quản lý Nông trại"
                            description="Màn hình quản lý thông tin nông trại, khu vực nuôi trồng và dữ liệu vận hành sẽ được triển khai sau."
                        />
                    }
                />

                <Route
                    path="seasons"
                    element={
                        <OwnerComingSoonPage
                            title="Quản lý Mùa vụ"
                            description="Màn hình theo dõi mùa vụ, tiến độ sinh trưởng, chi phí và sản lượng dự kiến sẽ được triển khai sau."
                        />
                    }
                />

                <Route path="inventory" element={<OwnerIotImportsPage />} />
                <Route path="products" element={<OwnerProductsPage />} />
                <Route path="devices" element={<OwnerIotDevicesPage />} />
                <Route path="iot-scans" element={<OwnerIotScansPage />} />
                <Route path="ai-reviews" element={<OwnerAiReviewsPage />} />
                <Route path="iot-imports" element={<Navigate to="/owner/inventory" replace />} />

                <Route
                    path="market-prices"
                    element={<OwnerMarketPricesPage />}
                />

                <Route
                    path="market-watchlist"
                    element={
                        <OwnerComingSoonPage
                            title="Watchlist Farm"
                            description="Màn hình quản lý danh sách species farm theo dõi giá thị trường sẽ được triển khai ở bước tiếp theo."
                        />
                    }
                />
                <Route
                    path="transactions"
                    element={
                        <OwnerComingSoonPage
                            title="Giao dịch kho"
                            description="Màn hình lịch sử nhập xuất kho, cho ăn, thu hoạch và điều chỉnh tồn kho sẽ được triển khai sau."
                        />
                    }
                />

                <Route
                    path="reports"
                    element={
                        <OwnerComingSoonPage
                            title="Báo cáo nông trại"
                            description="Chức năng tạo báo cáo chi phí, sản lượng, doanh thu và hiệu quả mùa vụ sẽ được triển khai sau."
                        />
                    }
                />

                <Route
                    path="settings"
                    element={
                        <OwnerComingSoonPage
                            title="Cài đặt Owner"
                            description="Màn hình cấu hình tài khoản, farm scope và thiết lập vận hành sẽ được triển khai sau."
                        />
                    }
                />

                <Route path="*" element={<Navigate to="/owner/dashboard" replace />} />
            </Route>
        </Routes>
    );
}
