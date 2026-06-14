import { useEffect, useState } from "react";

import { OwnerIotScanDetailDrawer } from "../../../features/owner/iot-scans/components/OwnerIotScanDetailDrawer";
import { OwnerIotScanStats } from "../../../features/owner/iot-scans/components/OwnerIotScanStats";
import { OwnerIotScanTable } from "../../../features/owner/iot-scans/components/OwnerIotScanTable";
import { useOwnerIotScans } from "../../../features/owner/iot-scans/hooks/useOwnerIotScans";
import { useAuth } from "../../../features/auth/context/AuthContext";

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
                    Theo dõi các lần cân-camera đọc QR, nhận diện sản phẩm và tạo voice phản hồi
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
    const { user } = useAuth();
    const farmId = user?.farmId;

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

    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

    useEffect(() => {
        reload();
    }, [reload]);

    if (!farmId) {
        return (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                Tài khoản OWNER chưa có farmId. Vui lòng kiểm tra dữ liệu user/farm.
            </div>
        );
    }

    async function openDetailDrawer(scan) {
        clearActionError();

        setDetailDrawerOpen(true);
        setSelectedScan(scan);

        await loadScanDetail(scan.transactionId);
    }

    function closeDetailDrawer() {
        setDetailDrawerOpen(false);
        setSelectedScan(null);
        clearActionError();
    }

    if (initialLoading) {
        return <OwnerIotScansSkeleton />;
    }

    if (error) {
        return (
            <section className="space-y-5">
                <OwnerIotScansHeader />

                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm font-medium text-red-700">{error}</p>

                    <button
                        type="button"
                        onClick={reload}
                        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
                    >
                        Thử lại
                    </button>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="space-y-5">
                <OwnerIotScansHeader />

                {actionError && !detailDrawerOpen && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {actionError}
                    </div>
                )}

                <OwnerIotScanStats summary={summary} />

                <OwnerIotScanTable
                    scans={scans}
                    pageInfo={pageInfo}
                    loading={tableLoading}
                    onPageChange={setPage}
                    onViewDetail={openDetailDrawer}
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