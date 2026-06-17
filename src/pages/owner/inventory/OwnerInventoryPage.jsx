import { RefreshCcw } from "lucide-react";

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
                    Theo dõi tồn kho hiện tại, giá trị tồn kho và chi tiết lô hàng.
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

export function OwnerInventoryPage() {
    const { user } = useAuth();
    const farmId = user?.farmId;

    const {
        stocks,
        summary,
        pageInfo,
        loading,
        error,

        selectedStockDetail,
        setSelectedStockDetail,
        detailLoading,
        loadStockDetail,

        setPage,
        reload,
    } = useOwnerInventoryStocks(farmId);

    async function openStockDetail(stock) {
        setSelectedStockDetail({
            stock,
            batches: [],
        });

        await loadStockDetail(stock.stockId);
    }

    function closeStockDetail() {
        setSelectedStockDetail(null);
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
            <PageHeader onRefresh={reload} />

            <main className="space-y-5 px-6 py-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Sản phẩm trong kho
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {summary?.totalProducts ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Sắp hết hàng
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-red-600">
                            {summary?.lowStock ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Giá trị tồn kho
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[#006948]">
                            {Number(summary?.inventoryValue || 0).toLocaleString("vi-VN")}đ
                        </p>
                    </div>
                </section>

                {error ? (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                ) : (
                    <InventoryStockTable
                        stocks={stocks}
                        pageInfo={pageInfo}
                        loading={loading}
                        onPageChange={setPage}
                        onViewDetail={openStockDetail}
                    />
                )}
            </main>

            <InventoryStockDetailDrawer
                open={Boolean(selectedStockDetail)}
                detail={selectedStockDetail}
                loading={detailLoading}
                onClose={closeStockDetail}
            />
        </div>
    );
}