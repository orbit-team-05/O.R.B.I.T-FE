import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../features/auth/context/AuthContext";
import { useToast } from "../../../components/common/toast/ToastProvider";

import { OwnerMarketPriceStats } from "../../../features/owner/market-prices/components/OwnerMarketPriceStats";
import { OwnerMarketPriceTable } from "../../../features/owner/market-prices/components/OwnerMarketPriceTable";

import { useOwnerMarketPrices } from "../../../features/owner/market-prices/hooks/useOwnerMarketPrices";

const FALLBACK_FARM_ID = 1;

function OwnerMarketPricesHeader({
    onOpenWatchlist,
}) {
    return (
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Content */}
            <div>
                {/* Breadcrumb */}
                <p className="text-sm font-medium text-[#006948]">
                    Owner / Market Prices
                </p>

                {/* Title */}
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    Giá thị trường
                </h1>

                {/* Description */}
                <p className="mt-1 text-sm text-slate-600">
                    Theo dõi giá thị trường mới nhất theo danh sách mặt hàng
                    farm đang quan tâm.
                </p>
            </div>

            {/* Right Button */}
            <div className="flex items-center lg:self-center">
                <button
                    type="button"
                    onClick={onOpenWatchlist}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#00583d]"
                >
                    <Plus size={16} />

                    Quản lý watchlist
                </button>
            </div>
        </header>
    );
}

function OwnerMarketPricesSkeleton({
    onOpenWatchlist,
}) {
    return (
        <section className="space-y-5">
            {/* Header Skeleton */}
            <div className="border border-slate-200 bg-white px-6 py-5">
                <OwnerMarketPricesHeader
                    onOpenWatchlist={
                        onOpenWatchlist
                    }
                />
            </div>

            {/* Stats Skeleton */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-[104px] animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                ))}
            </section>

            {/* Table Skeleton */}
            <section className="h-[420px] animate-pulse rounded-xl border border-slate-200 bg-white" />
        </section>
    );
}

export function OwnerMarketPricesPage() {
    const navigate = useNavigate();

    const toast = useToast();

    const { user } = useAuth();

    const farmId =
        user?.farmId ??
        FALLBACK_FARM_ID;

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
     */
    useEffect(() => {
        if (error) {
            toast.error(
                "Không thể tải dữ liệu giá thị trường",
            );
        }
    }, [error, toast]);

    function openWatchlistPage() {
        navigate(
            "/owner/market-watchlist",
        );
    }

    if (initialLoading) {
        return (
            <OwnerMarketPricesSkeleton
                onOpenWatchlist={
                    openWatchlistPage
                }
            />
        );
    }

    return (
        <section className="space-y-5">
            {/* Header */}
            <div className="border border-slate-200 bg-white px-6 py-5">
                <OwnerMarketPricesHeader
                    onOpenWatchlist={
                        openWatchlistPage
                    }
                />
            </div>

            {/* Stats */}
            <OwnerMarketPriceStats
                summary={summary}
            />

            {/* Table */}
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