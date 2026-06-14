import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { IotImportConfirmDrawer } from "../../../features/owner/iot-imports/components/IotImportConfirmDrawer";
import { IotImportPendingTable } from "../../../features/owner/iot-imports/components/IotImportPendingTable";
import { useOwnerIotImports } from "../../../features/owner/iot-imports/hooks/useOwnerIotImports";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { InventoryStockTable } from "../../../features/owner/inventory/components/InventoryStockTable";
import { InventoryStockDetailDrawer } from "../../../features/owner/inventory/components/InventoryStockDetailDrawer";
import { useOwnerInventoryStocks } from "../../../features/owner/inventory/hooks/useOwnerInventoryStocks";

function PageHeader({ onRefresh }) {
    return (
        <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p className="text-sm font-medium text-[#006948]">
                    Owner / Kho vật tư
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    Kho vật tư
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Quản lý scan nhập kho IoT, xác nhận giá lô hàng và theo dõi tồn kho hiện tại.
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
    const { user } = useAuth();
    const farmId = user?.farmId;

    const [activeTab, setActiveTab] = useState("pending");
    const [selectedScan, setSelectedScan] = useState(null);

    const {
        scans,
        summary,
        pageInfo,
        initialLoading,
        tableLoading,
        submittingId,
        error,
        actionError,
        actionSuccess,
        setPage,
        reload,
        confirmImport,
        clearActionMessages,
    } = useOwnerIotImports(farmId);

    const {
        stocks,
        summary: stockSummary,
        pageInfo: stockPageInfo,
        loading: stockLoading,
        error: stockError,

        selectedStockDetail,
        setSelectedStockDetail,
        detailLoading,
        loadStockDetail,

        setPage: setStockPage,
        reload: reloadStocks,
    } = useOwnerInventoryStocks(farmId);

    function openConfirmDrawer(scan) {
        clearActionMessages();
        setSelectedScan(scan);
    }

    function closeConfirmDrawer() {
        clearActionMessages();
        setSelectedScan(null);
    }

    async function handleConfirmImport(transactionId, totalImportCost) {
        const result = await confirmImport(transactionId, totalImportCost);

        if (result) {
            closeConfirmDrawer();
            await reloadStocks();
            setActiveTab("stocks");
        }
    }

    async function openStockDetail(stock) {
        await loadStockDetail(stock.stockId);
    }

    function closeStockDetail() {
        setSelectedStockDetail(null);
    }

    async function handleRefresh() {
        await reload();
        await reloadStocks();
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
                            Đã nhận diện QR
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {summary?.recognized ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Sản phẩm trong kho
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {stockSummary?.totalProducts ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Giá trị tồn kho
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[#006948]">
                            {Number(stockSummary?.inventoryValue || 0).toLocaleString("vi-VN")}đ
                        </p>
                    </div>
                </section>

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
                        onClick={() => setActiveTab("stocks")}
                        className={[
                            "h-10 rounded-lg px-4 text-sm font-medium transition-colors",
                            activeTab === "stocks"
                                ? "bg-[#006948] text-white"
                                : "text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                    >
                        Tồn kho hiện tại
                    </button>
                </section>

                {activeTab === "pending" && (
                    <>
                        {error ? (
                            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        ) : (
                            <IotImportPendingTable
                                scans={scans}
                                pageInfo={pageInfo}
                                loading={initialLoading || tableLoading}
                                submittingId={submittingId}
                                onConfirm={openConfirmDrawer}
                                onPageChange={setPage}
                            />
                        )}
                    </>
                )}

                {activeTab === "stocks" && (
                    <>
                        {stockError ? (
                            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {stockError}
                            </div>
                        ) : (
                            <InventoryStockTable
                                stocks={stocks}
                                pageInfo={stockPageInfo}
                                loading={stockLoading}
                                onPageChange={setStockPage}
                                onViewDetail={openStockDetail}
                            />
                        )}
                    </>
                )}
            </main>

            <IotImportConfirmDrawer
                open={Boolean(selectedScan)}
                scan={selectedScan}
                submitting={submittingId === selectedScan?.transactionId}
                actionError={actionError}
                onClose={closeConfirmDrawer}
                onConfirm={handleConfirmImport}
            />

            <InventoryStockDetailDrawer
                open={Boolean(selectedStockDetail)}
                detail={selectedStockDetail}
                loading={detailLoading}
                onClose={closeStockDetail}
            />
        </div>
    );
}