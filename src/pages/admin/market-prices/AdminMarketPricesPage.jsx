import { useToast } from "../../../components/common/toast/ToastProvider";
import { MarketPriceStats } from "../../../features/admin/market-prices/components/MarketPriceStats";
import { MarketPriceTable } from "../../../features/admin/market-prices/components/MarketPriceTable";
import { useAdminMarketPrices } from "../../../features/admin/market-prices/hooks/useAdminMarketPrices";

function AdminMarketPricesHeader({ onRunCrawl }) {
    return (
        <header className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Dữ liệu giá Crawl
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Theo dõi các dòng giá thị trường đã được crawler thu thập và lưu vào hệ thống
                </p>
            </div>

            <button
                type="button"
                onClick={onRunCrawl}
                className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"
            >
                Chạy crawl mới
            </button>
        </header>
    );
}

function AdminMarketPricesSkeleton() {
    return (
        <section className="space-y-5">
            <AdminMarketPricesHeader />

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

export function AdminMarketPricesPage() {
    const toast = useToast();

    const {
        prices,
        summary,
        sourceOptions,
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
    } = useAdminMarketPrices();

    function handleRunCrawl() {
        toast.error("Chưa có API chạy crawl thủ công.");
    }

    if (initialLoading) {
        return <AdminMarketPricesSkeleton />;
    }

    if (error) {
        return (
            <section className="space-y-5">
                <AdminMarketPricesHeader onRunCrawl={handleRunCrawl} />

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
        <section className="space-y-5">
            <AdminMarketPricesHeader onRunCrawl={handleRunCrawl} />

            <MarketPriceStats summary={summary} />

            <MarketPriceTable
                prices={prices}
                pageInfo={pageInfo}
                filters={filters}
                sourceOptions={sourceOptions}
                speciesOptions={speciesOptions}
                loading={tableLoading}
                onFilterChange={updateFilter}
                onResetFilters={resetFilters}
                onPageChange={setPage}
            />
        </section>
    );
}