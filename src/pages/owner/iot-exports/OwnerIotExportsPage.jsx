import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

import { useAuth } from "../../../features/auth/context/AuthContext";

import { useToast } from "../../../components/common/toast/ToastProvider";

import { IotExportTable } from "../../../features/owner/iot-exports/components/IotExportTable";
import { IotExportDetailDrawer } from "../../../features/owner/iot-exports/components/IotExportDetailDrawer";

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
                    Xác nhận scan xuất từ cân IoT,
                    trừ tồn kho FIFO và ghi chi phí vào mùa vụ.
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

    const [activeTab, setActiveTab] =
        useState("pending");

    const [detailOpen,
        setDetailOpen] =
        useState(false);

    const {
        pendingScans,
        historyScans,

        selectedExport,
        setSelectedExport,

        detailLoading,
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
        loadExportDetail,
        confirmExport,
        clearActionMessages,
    } = useOwnerIotExports(farmId);

    /**
     * Toast for API errors
     */
    useEffect(() => {
        if (error) {
            toast.error(
                "Không thể tải dữ liệu xuất vật tư",
            );
        }
    }, [error, toast]);

    /**
     * Toast for action success
     */
    useEffect(() => {
        if (actionSuccess) {
            toast.success(actionSuccess);
        }
    }, [actionSuccess, toast]);

    /**
     * Toast for action errors
     */
    useEffect(() => {
        if (
            actionError &&
            !detailOpen
        ) {
            toast.error(actionError);
        }
    }, [
        actionError,
        detailOpen,
        toast,
    ]);

    /**
     * Missing farmId
     */
    useEffect(() => {
        if (!farmId) {
            toast.error(
                "Tài khoản OWNER chưa có farm",
            );
        }
    }, [farmId, toast]);

    async function handleRefresh() {
        await reload();
    }

    async function handleOpenDetail(
        scan,
    ) {
        clearActionMessages();

        setSelectedExport(scan);

        setDetailOpen(true);

        await loadExportDetail(
            scan.transactionId,
        );
    }

    function handleCloseDetail() {
        setDetailOpen(false);

        setSelectedExport(null);

        clearActionMessages();
    }

    async function handleConfirmExport(
        scan,
    ) {
        clearActionMessages();

        const result =
            await confirmExport(
                scan.transactionId,
            );

        if (!result) {
            toast.error(
                "Không thể xác nhận xuất vật tư.",
            );

            return;
        }

        toast.success(
            `Đã xác nhận xuất ${result.productName ||
            "vật tư"
            } cho mùa vụ ${result.seasonName || ""
            }.`,
        );

        setActiveTab("history");
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader
                onRefresh={
                    handleRefresh
                }
            />

            <main className="space-y-5 px-6 py-6">
                <section className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Chờ xác nhận
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {summary?.pending ??
                                0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Đã nhận diện
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {summary?.recognized ??
                                0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Đã xuất
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {summary?.approved ??
                                0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Chi phí xuất
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-[#006948]">
                            {Math.floor(
                                Number(summary?.totalExportCost || 0)
                            ).toLocaleString("vi-VN")}
                            đ
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
                        Lịch sử xuất
                    </button>
                </section>

                {activeTab ===
                    "pending" && (
                        <IotExportTable
                            title="Scan xuất vật tư chờ xác nhận"
                            description="Dữ liệu từ cân IoT ở chế độ xuất sẽ hiện ở đây. Khi xác nhận, hệ thống trừ tồn kho FIFO và ghi chi phí vào mùa vụ."
                            scans={pendingScans}
                            pageInfo={
                                pendingPageInfo
                            }
                            loading={
                                pendingLoading
                            }
                            submittingId={
                                submittingId
                            }
                            mode="pending"
                            onConfirm={
                                handleConfirmExport
                            }
                            onViewDetail={
                                handleOpenDetail
                            }
                            onPageChange={
                                setPendingPage
                            }
                        />
                    )}

                {activeTab ===
                    "history" && (
                        <IotExportTable
                            title="Lịch sử xuất vật tư"
                            description="Danh sách giao dịch xuất vật tư đã được xác nhận."
                            scans={historyScans}
                            pageInfo={
                                historyPageInfo
                            }
                            loading={
                                historyLoading
                            }
                            mode="history"
                            onViewDetail={
                                handleOpenDetail
                            }
                            onPageChange={
                                setHistoryPage
                            }
                        />
                    )}
            </main>

            <IotExportDetailDrawer
                open={detailOpen}
                scan={selectedExport}
                loading={detailLoading}
                onClose={
                    handleCloseDetail
                }
            />
        </div>
    );
}

export default OwnerIotExportsPage;