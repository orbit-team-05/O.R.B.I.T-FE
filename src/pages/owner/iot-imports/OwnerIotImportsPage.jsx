import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

import { useToast } from "../../../components/common/toast/ToastProvider";

import { useAuth } from "../../../features/auth/context/AuthContext";

import { IotImportConfirmDrawer } from "../../../features/owner/iot-imports/components/IotImportConfirmDrawer";
import { IotImportPendingTable } from "../../../features/owner/iot-imports/components/IotImportPendingTable";

import { useOwnerIotImports } from "../../../features/owner/iot-imports/hooks/useOwnerIotImports";

function PageHeader({ onRefresh }) {
    return (
        <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p className="text-sm font-medium text-[#006948]">
                    Owner / Nhập vật tư
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    Nhập vật tư
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Xác nhận scan nhập từ cân IoT,
                    nhập giá lô hàng và xem lịch sử nhập kho.
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

export function OwnerIotImportsPage() {
    const toast = useToast();

    const { user } = useAuth();

    const farmId = user?.farmId;

    const [activeTab, setActiveTab] =
        useState("pending");

    const [selectedScan,
        setSelectedScan] =
        useState(null);

    const {
        pendingScans,
        historyScans,
        summary,

        pendingPageInfo,
        historyPageInfo,

        initialLoading,
        tableLoading,
        historyLoading,
        submittingId,

        error,
        actionError,
        actionSuccess,

        setPendingPage,
        setHistoryPage,

        reload,
        confirmImport,
        clearActionMessages,
    } = useOwnerIotImports(farmId);

    /**
     * Toast only for API errors.
     */
    useEffect(() => {
        if (error) {
            toast.error(
                "Không thể tải dữ liệu nhập vật tư"
            );
        }
    }, [error, toast]);

    /**
     * Toast for action success.
     */
    useEffect(() => {
        if (actionSuccess) {
            toast.success(actionSuccess);
        }
    }, [actionSuccess, toast]);

    /**
     * Toast for action errors.
     */
    useEffect(() => {
        if (actionError) {
            toast.error(actionError);
        }
    }, [actionError, toast]);

    /**
     * Toast for missing farmId.
     */
    useEffect(() => {
        if (!farmId) {
            toast.error(
                "Tài khoản OWNER chưa có farm"
            );
        }
    }, [farmId, toast]);

    function openConfirmDrawer(scan) {
        clearActionMessages();

        setSelectedScan(scan);
    }

    function closeConfirmDrawer() {
        clearActionMessages();

        setSelectedScan(null);
    }

    async function handleConfirmImport(
        transactionId,
        totalImportCost,
        packageCount,
    ) {
        const result =
            await confirmImport(
                transactionId,
                totalImportCost,
                packageCount,
            );

        if (result) {
            closeConfirmDrawer();

            setActiveTab("history");
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader onRefresh={reload} />

            <main className="space-y-5 px-6 py-6">
                <section className="grid gap-4 md:grid-cols-3">
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
                            Đã nhận diện QR
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {summary?.recognized ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Đã nhập
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {summary?.approved ?? 0}
                        </p>
                    </div>
                </section>

                <section className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1">
                    <button
                        type="button"
                        onClick={() =>
                            setActiveTab(
                                "pending",
                            )
                        }
                        className={[
                            "h-10 rounded-lg px-4 text-sm font-medium transition-colors",
                            activeTab ===
                            "pending"
                                ? "bg-[#006948] text-white"
                                : "text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                    >
                        Chờ xác nhận
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setActiveTab(
                                "history",
                            )
                        }
                        className={[
                            "h-10 rounded-lg px-4 text-sm font-medium transition-colors",
                            activeTab ===
                            "history"
                                ? "bg-[#006948] text-white"
                                : "text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                    >
                        Lịch sử nhập
                    </button>
                </section>

                {activeTab ===
                    "pending" && (
                    <IotImportPendingTable
                        title="Scan nhập kho chờ xác nhận"
                        description="Dữ liệu từ cân IoT ở chế độ nhập sẽ hiện ở đây. Owner cần nhập giá lô hàng để xác nhận nhập kho."
                        mode="pending"
                        scans={pendingScans}
                        pageInfo={
                            pendingPageInfo
                        }
                        loading={
                            initialLoading ||
                            tableLoading
                        }
                        submittingId={
                            submittingId
                        }
                        onConfirm={
                            openConfirmDrawer
                        }
                        onPageChange={
                            setPendingPage
                        }
                    />
                )}

                {activeTab ===
                    "history" && (
                    <IotImportPendingTable
                        title="Lịch sử nhập vật tư"
                        description="Danh sách scan nhập kho đã được xác nhận thành giao dịch nhập."
                        mode="history"
                        scans={historyScans}
                        pageInfo={
                            historyPageInfo
                        }
                        loading={
                            historyLoading
                        }
                        onPageChange={
                            setHistoryPage
                        }
                    />
                )}
            </main>

            <IotImportConfirmDrawer
                open={Boolean(selectedScan)}
                scan={selectedScan}
                submitting={
                    submittingId ===
                    selectedScan?.transactionId
                }
                actionError={actionError}
                onClose={closeConfirmDrawer}
                onConfirm={
                    handleConfirmImport
                }
            />
        </div>
    );
}

export default OwnerIotImportsPage;