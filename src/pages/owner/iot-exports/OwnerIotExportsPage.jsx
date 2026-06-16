import { useState } from "react";
import { RefreshCcw } from "lucide-react";

import { useAuth } from "../../../features/auth/context/AuthContext";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { IotExportTable } from "../../../features/owner/iot-exports/components/IotExportTable";
import { useOwnerIotExports } from "../../../features/owner/iot-exports/hooks/useOwnerIotExports";

function PageHeader({ onRefresh }) {
    return (
        <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p className="text-sm font-medium text-[#006948]">
                    Owner / Xuất vật tư
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    Xuất vật tư
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Xác nhận scan xuất từ cân IoT, trừ tồn kho FIFO và ghi chi phí vào mùa vụ.
                </p>
            </div>

            <button
                type="button"
                onClick={onRefresh}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
                <RefreshCcw size={16} />
                Làm mới
            </button>
        </header>
    );
}

export function OwnerIotExportsPage() {
    const toast = useToast();
    const { user } = useAuth();
    const farmId = user?.farmId;

    const [activeTab, setActiveTab] = useState("pending");

    const {
        pendingScans,
        historyScans,
        summary,

        pendingPageInfo,
        historyPageInfo,

        pendingLoading,
        historyLoading,
        submittingId,

        error,
        actionError,
        actionSuccess,

        setPendingPage,
        setHistoryPage,

        reload,
        confirmExport,
        clearActionMessages,
    } = useOwnerIotExports(farmId);

    async function handleRefresh() {
        await reload();
    }

    async function handleConfirmExport(scan) {
        clearActionMessages();

        const result = await confirmExport(scan.transactionId);

        if (!result) {
            toast.error("Không thể xác nhận xuất vật tư.");
            return;
        }

        toast.success(
            `Đã xác nhận xuất ${result.productName || "vật tư"} cho mùa vụ ${result.seasonName || ""}.`,
        );

        setActiveTab("history");
    }

    if (!farmId) {
        return (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                Tài khoản OWNER chưa có farmId. Vui lòng kiểm tra dữ liệu user/farm.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader onRefresh={handleRefresh} />

            <main className="space-y-5 px-6 py-6">
                {actionSuccess && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-[#006948]">
                        {actionSuccess}
                    </div>
                )}

                {actionError && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {actionError}
                    </div>
                )}

                <section className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Chờ xác nhận
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {summary?.pending ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Đã nhận diện
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {summary?.recognized ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Đã xuất
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {summary?.approved ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Chi phí xuất
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[#006948]">
                            {Number(summary?.totalExportCost || 0).toLocaleString("vi-VN")}đ
                        </p>
                    </div>
                </section>

                {error && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <section className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab("pending")}
                        className={[
                            "h-10 rounded-lg px-4 text-sm font-medium transition-colors",
                            activeTab === "pending"
                                ? "bg-[#006948] text-white"
                                : "text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                    >
                        Chờ xác nhận
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("history")}
                        className={[
                            "h-10 rounded-lg px-4 text-sm font-medium transition-colors",
                            activeTab === "history"
                                ? "bg-[#006948] text-white"
                                : "text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                    >
                        Lịch sử xuất
                    </button>
                </section>

                {activeTab === "pending" && (
                    <IotExportTable
                        title="Scan xuất vật tư chờ xác nhận"
                        description="Dữ liệu từ cân IoT ở chế độ xuất sẽ hiện ở đây. Khi xác nhận, hệ thống trừ tồn kho FIFO và ghi chi phí vào mùa vụ."
                        scans={pendingScans}
                        pageInfo={pendingPageInfo}
                        loading={pendingLoading}
                        submittingId={submittingId}
                        mode="pending"
                        onConfirm={handleConfirmExport}
                        onPageChange={setPendingPage}
                    />
                )}

                {activeTab === "history" && (
                    <IotExportTable
                        title="Lịch sử xuất vật tư"
                        description="Danh sách giao dịch xuất vật tư đã được xác nhận."
                        scans={historyScans}
                        pageInfo={historyPageInfo}
                        loading={historyLoading}
                        mode="history"
                        onPageChange={setHistoryPage}
                    />
                )}
            </main>
        </div>
    );
}