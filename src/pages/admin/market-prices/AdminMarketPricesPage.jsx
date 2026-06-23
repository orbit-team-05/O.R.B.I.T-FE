import { useToast } from "../../../components/common/toast/ToastProvider";
import { MarketPriceStats } from "../../../features/admin/market-prices/components/MarketPriceStats";
import { MarketPriceTable } from "../../../features/admin/market-prices/components/MarketPriceTable";
import { useAdminMarketPrices } from "../../../features/admin/market-prices/hooks/useAdminMarketPrices";

function AdminMarketPricesHeader({ onRunCrawl, crawling }) {
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
                disabled={crawling}
                onClick={onRunCrawl}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {crawling ? (
                    <>
                        <svg className="mr-2 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang crawl...
                    </>
                ) : (
                    "Chạy crawl mới"
                )}
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
        crawling,
        runCrawl,
    } = useAdminMarketPrices();

    async function handleRunCrawl() {
        if (crawling) return;
        toast.info("Đang bắt đầu chạy crawl dữ liệu giá mới...");
        const res = await runCrawl();
        if (res.success) {
            toast.success(`Crawl thành công! Đã lưu mới ${res.count} dữ liệu giá.`);
        } else {
            toast.error(res.error);
        }
    }

    if (initialLoading) {
        return <AdminMarketPricesSkeleton />;
    }

    if (error) {
        return (
            <section className="space-y-5">
                <AdminMarketPricesHeader onRunCrawl={handleRunCrawl} crawling={crawling} />

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
            <AdminMarketPricesHeader onRunCrawl={handleRunCrawl} crawling={crawling} />

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