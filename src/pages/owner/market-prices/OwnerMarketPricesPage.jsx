import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../features/auth/context/AuthContext";
import { useToast } from "../../../components/common/toast/ToastProvider";

import { OwnerMarketPriceStats } from "../../../features/owner/market-prices/components/OwnerMarketPriceStats";
import { OwnerMarketPriceTable } from "../../../features/owner/market-prices/components/OwnerMarketPriceTable";
import { useOwnerMarketPrices } from "../../../features/owner/market-prices/hooks/useOwnerMarketPrices";

const FALLBACK_FARM_ID = 1;

function OwnerMarketPricesHeader({ onOpenWatchlist }) {
    return (
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Giá thị trường
                </h1>

                <p className="mt-1 max-w-2xl text-sm text-slate-600">
                    Theo dõi giá thị trường mới nhất theo danh sách mặt hàng
                    farm đang quan tâm.
                </p>
            </div>

            <button
                type="button"
                onClick={onOpenWatchlist}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"
            >
                <Plus size={16} />

                Quản lý watchlist
            </button>
        </header>
    );
}

function OwnerMarketPricesSkeleton({ onOpenWatchlist }) {
    return (
        <section className="space-y-5">
            <OwnerMarketPricesHeader
                onOpenWatchlist={onOpenWatchlist}
            />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-[104px] animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                ))}
            </section>

            <section className="h-[420px] animate-pulse rounded-xl border border-slate-200 bg-white" />
        </section>
    );
}

export function OwnerMarketPricesPage() {
    const navigate = useNavigate();
    const toast = useToast();

    const { user } = useAuth();

    const farmId =
        user?.farmId ?? FALLBACK_FARM_ID;

    const {
        prices,
        summary,
        speciesOptions,
        filters,
        updateFilter,
        resetFilters,
        pageInfo,
        initialLoading,
        tableLoading,
        error,
        setPage,
        reload,
    } = useOwnerMarketPrices(farmId);

    useEffect(() => {
        reload();
    }, [reload]);

    /**
     * Show toast only when API fails.
     * Remove inline red error UI.
     */
    useEffect(() => {
        if (error) {
            toast.error(
                "Không thể tải dữ liệu giá thị trường"
            );
        }
    }, [error, toast]);

    function openWatchlistPage() {
        navigate("/owner/market-watchlist");
    }

    if (initialLoading) {
        return (
            <OwnerMarketPricesSkeleton
                onOpenWatchlist={openWatchlistPage}
            />
        );
    }

    return (
        <section className="space-y-5">
            <OwnerMarketPricesHeader
                onOpenWatchlist={openWatchlistPage}
            />

            <OwnerMarketPriceStats
                summary={summary}
            />

            <OwnerMarketPriceTable
                prices={prices}
                pageInfo={pageInfo}
                filters={filters}
                speciesOptions={speciesOptions}
                loading={tableLoading}
                onFilterChange={updateFilter}
                onResetFilters={resetFilters}
                onRefresh={reload}
                onPageChange={setPage}
            />
        </section>
    );
}

