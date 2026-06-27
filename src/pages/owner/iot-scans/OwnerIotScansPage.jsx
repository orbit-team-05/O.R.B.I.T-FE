import { useEffect, useState } from "react";

import { useToast } from "../../../components/common/toast/ToastProvider";

import { useAuth } from "../../../features/auth/context/AuthContext";

import { OwnerIotScanDetailDrawer } from "../../../features/owner/iot-scans/components/OwnerIotScanDetailDrawer";
import { OwnerIotScanStats } from "../../../features/owner/iot-scans/components/OwnerIotScanStats";
import { OwnerIotScanTable } from "../../../features/owner/iot-scans/components/OwnerIotScanTable";

import { useOwnerIotScans } from "../../../features/owner/iot-scans/hooks/useOwnerIotScans";

const CURRENT_FARM_ID = 1;

function OwnerIotScansHeader() {
    return (
        <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p className="text-sm font-medium text-[#006948]">
                    Owner / Lịch sử cân
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    Lịch sử Scan IoT
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Theo dõi các lần cân-camera đọc QR,
                    nhận diện sản phẩm và tạo voice phản hồi
                </p>
            </div>
        </header>
    );
}

function OwnerIotScansSkeleton() {
    return (
        <section className="space-y-5">
            <OwnerIotScansHeader />

            <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-[86px] animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                ))}
            </section>

            <section className="h-[360px] animate-pulse rounded-xl border border-slate-200 bg-white" />
        </section>
    );
}

export function OwnerIotScansPage() {
    const toast = useToast();

    const { user } = useAuth();

    const farmId =
        user?.farmId ??
        CURRENT_FARM_ID;

    const {
        scans,
        selectedScan,
        setSelectedScan,

        summary,
        pageInfo,

        initialLoading,
        tableLoading,
        detailLoading,

        error,
        actionError,
        clearActionError,

        reload,
        setPage,
        loadScanDetail,
    } = useOwnerIotScans(farmId);

    const [detailDrawerOpen,
        setDetailDrawerOpen] =
        useState(false);

    /**
     * Load page data
     */
    useEffect(() => {
        reload();
    }, [reload]);

    /**
     * Toast only for API errors
     * Remove inline red UI
     */
    useEffect(() => {
        if (error) {
            toast.error(
                "Không thể tải lịch sử scan IoT"
            );
        }
    }, [error, toast]);

    /**
     * Toast for action errors
     */
    useEffect(() => {
        if (
            actionError &&
            !detailDrawerOpen
        ) {
            toast.error(actionError);
        }
    }, [
        actionError,
        detailDrawerOpen,
        toast,
    ]);

    /**
     * Missing farm
     */
    useEffect(() => {
        if (!user?.farmId) {
            toast.error(
                "Tài khoản OWNER chưa có farm"
            );
        }
    }, [user, toast]);

    async function openDetailDrawer(
        scan,
    ) {
        clearActionError();

        setDetailDrawerOpen(true);

        setSelectedScan(scan);

        await loadScanDetail(
            scan.transactionId,
        );
    }

    function closeDetailDrawer() {
        setDetailDrawerOpen(false);

        setSelectedScan(null);

        clearActionError();
    }

    if (initialLoading) {
        return (
            <OwnerIotScansSkeleton />
        );
    }

    return (
        <>
            <section className="space-y-5">
                <OwnerIotScansHeader />

                <OwnerIotScanStats
                    summary={summary}
                />

                <OwnerIotScanTable
                    scans={scans}
                    pageInfo={pageInfo}
                    loading={tableLoading}
                    onPageChange={setPage}
                    onViewDetail={
                        openDetailDrawer
                    }
                />
            </section>

            <OwnerIotScanDetailDrawer
                open={detailDrawerOpen}
                scan={selectedScan}
                loading={detailLoading}
                onClose={closeDetailDrawer}
            />
        </>
    );
}

export default OwnerIotScansPage;

