import { Eye, ListRestart, Plus, RefreshCw, Shapes, Tags } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useToast } from "../../../components/common/toast/ToastProvider";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { useOwnerMarketWatchlist } from "../../../features/owner/market-watchlist/hooks/useOwnerMarketWatchlist";

const FALLBACK_FARM_ID = 1;

const STAT_CARDS = [
    {
        key: "activeWatchlist",
        title: "Đang theo dõi",
        suffix: "Species",
        description: "Trong watchlist",
        icon: Eye,
        tone: "text-slate-900",
    },
    {
        key: "availableCount",
        title: "Có thể thêm",
        suffix: "Species",
        description: "Sẵn sàng thêm",
        icon: Plus,
        tone: "text-[#006948]",
    },
    {
        key: "visibleCount",
        title: "Đang hiển thị",
        suffix: "Dòng",
        description: "Ở trang hiện tại",
        icon: Tags,
        tone: "text-blue-600",
    },
    {
        key: "currentPageLabel",
        title: "Trang watchlist",
        suffix: "",
        description: "Theo phân trang",
        icon: ListRestart,
        tone: "text-amber-600",
    },
];

function formatDate(value) {
    if (!value) return "Không hiển thị dữ liệu";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

function formatCategoryGroup(value) {
    if (!value) return "Không hiển thị dữ liệu";

    return String(value).replaceAll("_", " ");
}

function LoadingSkeleton() {
    return (
        <section className="space-y-5">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-10 w-72 animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-5 w-96 animate-pulse rounded-lg bg-slate-100" />
                </div>

                <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-200" />
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-[108px] animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
                <div className="h-[320px] animate-pulse rounded-xl border border-slate-200 bg-white" />
                <div className="h-[480px] animate-pulse rounded-xl border border-slate-200 bg-white" />
            </section>
        </section>
    );
}

function StatCards({ stats }) {
    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STAT_CARDS.map(({ key, title, suffix, description, icon: Icon, tone }) => (
                <article
                    key={key}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-4"
                >
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {title}
                        </p>

                        <Icon size={18} className={tone} strokeWidth={1.8} />
                    </div>

                    <div className="mt-3 flex items-end gap-2">
                        <span className={`text-4xl font-bold ${tone}`}>
                            {stats[key]}
                        </span>

                        {suffix ? (
                            <span className="pb-1 text-sm text-slate-500">
                                {suffix}
                            </span>
                        ) : null}
                    </div>

                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                </article>
            ))}
        </section>
    );
}

function EmptyPanel({ message, minHeight = 220 }) {
    return (
        <div
            className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500"
            style={{ minHeight }}
        >
            {message}
        </div>
    );
}

function WatchlistTable({
    items,
    pageInfo,
    loading,
    removingSpeciesId,
    onPageChange,
    onRemove,
}) {
    const currentPage = Math.max(Number(pageInfo?.number ?? 0), 0);
    const totalPages = Math.max(Number(pageInfo?.totalPages ?? 1), 1);
    const isFirstPage = currentPage <= 0 || pageInfo?.first;
    const isLastPage = currentPage >= totalPages - 1 || pageInfo?.last;

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-5">
                <h2 className="text-lg font-semibold text-slate-900">
                    Danh sách mặt hàng đang theo dõi
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                    Species đang được farm theo dõi giá thị trường.
                </p>
            </header>

            {loading ? (
                <div className="flex min-h-[420px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#006948]" />
                </div>
            ) : items.length === 0 ? (
                <div className="p-5">
                    <EmptyPanel
                        minHeight={420}
                        message="Không hiển thị dữ liệu species đang theo dõi."
                    />
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] border-collapse text-left">
                            <thead className="bg-slate-50">
                                <tr className="text-[11px] font-semibold uppercase text-slate-600">
                                    <th className="px-5 py-4">Species</th>
                                    <th className="px-5 py-4">Nhóm</th>
                                    <th className="px-5 py-4">Đơn vị</th>
                                    <th className="px-5 py-4">Trạng thái</th>
                                    <th className="px-5 py-4">Ngày thêm</th>
                                    <th className="px-5 py-4 text-right">Hành động</th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => {
                                    const removing = removingSpeciesId === item.speciesId;

                                    return (
                                        <tr
                                            key={item.id}
                                            className="border-t border-slate-200 text-sm text-slate-700"
                                        >
                                            <td className="max-w-[240px] px-5 py-4 font-semibold text-slate-900">
                                                <div className="line-clamp-2">
                                                    {item.speciesName || "Không hiển thị dữ liệu"}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                {formatCategoryGroup(item.categoryGroup)}
                                            </td>

                                            <td className="px-5 py-4">
                                                {item.marketUnit || "Không hiển thị dữ liệu"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex rounded-xl bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#006948]">
                                                    {item.isActive ? "Đang theo dõi" : "Tạm dừng"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                {formatDate(item.createdAt)}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    disabled={removing}
                                                    onClick={() => onRemove(item)}
                                                    className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {removing ? "Đang xóa..." : "Xóa"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <footer className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500">
                            Tổng {pageInfo.totalElements} species đang theo dõi
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={isFirstPage}
                                onClick={() => {
                                    if (isFirstPage) return;
                                    onPageChange(currentPage - 1);
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Trước
                            </button>

                            <span className="text-xs text-slate-600">
                                Trang {currentPage + 1} / {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={isLastPage}
                                onClick={() => {
                                    if (isLastPage) return;
                                    onPageChange(currentPage + 1);
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Sau
                            </button>
                        </div>
                    </footer>
                </>
            )}
        </section>
    );
}

export function OwnerMarketWatchlistPage() {
    const { user } = useAuth();
    const toast = useToast();
    const farmId = user?.farmId ?? FALLBACK_FARM_ID;

    const {
        watchlist,
        availableSpecies,
        stats,
        initialLoading,
        tableLoading,
        error,
        submitting,
        removingSpeciesId,
        pageInfo,
        reload,
        setPage,
        addSpecies,
        removeSpecies,
    } = useOwnerMarketWatchlist(farmId);

    const [selectedSpeciesId, setSelectedSpeciesId] = useState("");

    useEffect(() => {
        reload();
    }, [reload]);

    const statValues = useMemo(
        () => ({
            activeWatchlist: stats.activeWatchlist,
            availableCount: stats.availableCount,
            visibleCount: stats.visibleCount,
            currentPageLabel: `${stats.currentPage}/${stats.totalPages}`,
        }),
        [stats],
    );

    async function handleAddSpecies(event) {
        event.preventDefault();

        if (!selectedSpeciesId) {
            toast.error("Vui lòng chọn species để thêm vào watchlist.");
            return;
        }

        try {
            const addedItem = await addSpecies(Number(selectedSpeciesId));
            toast.success(
                `Đã thêm "${addedItem?.speciesName || "species"}" vào watchlist.`,
            );
            setSelectedSpeciesId("");
        } catch (err) {
            toast.error(err.message || "Không thể thêm species vào watchlist.");
        }
    }

    async function handleRemoveSpecies(item) {
        try {
            await removeSpecies(item.speciesId);
            toast.success(
                `Đã xóa "${item.speciesName || "species"}" khỏi watchlist.`,
            );
        } catch (err) {
            toast.error(err.message || "Không thể xóa species khỏi watchlist.");
        }
    }

    if (initialLoading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return (
            <section className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Watchlist Farm
                        </h1>

                        <p className="mt-1 text-sm text-slate-600">
                            Quản lý danh sách species farm muốn theo dõi giá thị trường.
                        </p>
                    </div>
                </div>

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
            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Watchlist Farm
                    </h1>

                    <p className="mt-1 max-w-2xl text-sm text-slate-600">
                        Quản lý danh sách species farm muốn theo dõi giá thị trường.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={reload}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    <RefreshCw size={16} />
                    Làm mới
                </button>
            </header>

            <StatCards stats={statValues} />

            <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
                <section className="rounded-xl border border-slate-200 bg-white">
                    <header className="border-b border-slate-200 px-5 py-5">
                        <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                            <Shapes size={18} className="text-[#006948]" />
                            Thêm mặt hàng theo dõi
                        </h2>

                        <p className="mt-1 text-sm text-slate-600">
                            Chọn species có sẵn để thêm vào watchlist.
                        </p>
                    </header>

                    <form onSubmit={handleAddSpecies} className="space-y-4 px-5 py-5">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Chọn species
                            </label>

                            <select
                                value={selectedSpeciesId}
                                onChange={(event) => setSelectedSpeciesId(event.target.value)}
                                className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/10"
                            >
                                <option value="">Chọn species để thêm</option>
                                {availableSpecies.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} - {formatCategoryGroup(item.categoryGroup)} - {item.marketUnit}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {availableSpecies.length === 0 ? (
                            <EmptyPanel
                                minHeight={120}
                                message="Không còn species khả dụng để thêm."
                            />
                        ) : null}

                        <button
                            type="submit"
                            disabled={submitting || availableSpecies.length === 0}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Plus size={16} />
                            {submitting ? "Đang thêm..." : "Thêm vào watchlist"}
                        </button>
                    </form>
                </section>

                <WatchlistTable
                    items={watchlist}
                    pageInfo={pageInfo}
                    loading={tableLoading}
                    removingSpeciesId={removingSpeciesId}
                    onPageChange={setPage}
                    onRemove={handleRemoveSpecies}
                />
            </section>
        </section>
    );
}
