import { Navigate, Route, Routes } from "react-router-dom";

import { OwnerLayout } from "../../layouts/owner/OwnerLayout";
import { OwnerComingSoonPage } from "../../pages/owner/common/OwnerComingSoonPage";
import { OwnerIotDevicesPage } from "../../pages/owner/devices/OwnerIotDevicesPage";
import { OwnerIotScansPage } from "../../pages/owner/iot-scans/OwnerIotScansPage";

export function OwnerRoutes() {
    return (
        <Routes>
            <Route element={<OwnerLayout />}>
                <Route index element={<Navigate to="/owner/dashboard" replace />} />

                <Route
                    path="dashboard"
                    element={
                        <OwnerComingSoonPage
                            title="Owner Dashboard"
                            description="Màn hình tổng quan nông trại sẽ được triển khai trong giai đoạn tiếp theo."
                        />
                    }
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

                <Route
                    path="inventory"
                    element={
                        <OwnerComingSoonPage
                            title="Kho vật tư"
                            description="Màn hình quản lý tồn kho, nhập kho, xuất kho và cảnh báo vật tư sẽ được triển khai sau."
                        />
                    }
                />

                <Route path="devices" element={<OwnerIotDevicesPage />} />
                <Route path="iot-scans" element={<OwnerIotScansPage />} />

                <Route
                    path="market-prices"
                    element={
                        <OwnerComingSoonPage
                            title="Dữ liệu giá thị trường"
                            description="Màn hình xem giá thị trường theo loài, khu vực và nguồn dữ liệu sẽ được triển khai sau."
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