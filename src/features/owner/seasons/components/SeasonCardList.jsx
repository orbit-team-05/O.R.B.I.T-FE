import { useMemo, useState } from "react";
import { Calendar, Sprout, TrendingUp, DollarSign, Image as ImageIcon } from "lucide-react";
import { formatCurrency, formatNumber } from "../../../../utils/formatUtils";
import { SeasonStatusBadge } from "./SeasonStatusBadge";
import Pagination from "../../../../components/common/pagination/Pagination";
import { SortSelect } from "../../../../components/common/sort/SortSelect";
import { sortItems } from "../../../../utils/listSort";

function formatDate(value) {
    if (!value) return "Chưa có";
    try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return String(value);
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(date);
    } catch {
        return String(value);
    }
}

export function SeasonCardList({
    seasons = [],
    pageInfo,
    loading = false,
    loadingDetailId = null,
    onPageChange,
    onViewDetail,
}) {
    const [sortKey, setSortKey] = useState("createdDesc");
    const sortedSeasons = useMemo(() => sortItems(seasons, sortKey, {
        nameAsc: { value: (item) => item.seasonName, direction: "asc" },
        nameDesc: { value: (item) => item.seasonName, direction: "desc" },
        createdDesc: { value: (item) => new Date(item.createdAt || 0).getTime(), direction: "desc" },
        startAsc: { value: (item) => new Date(item.startDate || 0).getTime(), direction: "asc" },
        status: { value: (item) => item.status, direction: "asc" },
    }), [seasons, sortKey]);

    if (loading && seasons.length === 0) {
        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="h-[360px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                    />
                ))}
            </div>
        );
    }

    if (seasons.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
                    <Sprout size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Chưa có mùa vụ nào</h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                    Bạn chưa tạo mùa vụ nào cho nông trại của mình. Hãy bắt đầu bằng cách lên kế hoạch cho mùa vụ mới!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <SortSelect value={sortKey} onChange={setSortKey} options={[
                    { value: "createdDesc", label: "Mới tạo trước" },
                    { value: "startAsc", label: "Bắt đầu sớm nhất" },
                    { value: "nameAsc", label: "Tên A → Z" },
                    { value: "nameDesc", label: "Tên Z → A" },
                    { value: "status", label: "Theo trạng thái" },
                ]} />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedSeasons.map((season) => (
                    <div
                        key={season.id}
                        onClick={() => onViewDetail?.(season)}
                        className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                        {/* Image Header */}
                        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                            {season.imageUrl ? (
                                <img
                                    src={season.imageUrl}
                                    alt={season.seasonName}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200">
                                    <ImageIcon size={48} className="opacity-50 mb-2" />
                                    <span className="text-xs font-medium uppercase tracking-wider opacity-60">Không có ảnh</span>
                                </div>
                            )}
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                            
                            {/* Badges */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <SeasonStatusBadge status={season.status} />
                            </div>
                            
                            {/* Title inside Image */}
                            <div className="absolute bottom-4 left-4 right-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-300 drop-shadow-sm">
                                    {season.seasonCode}
                                </p>
                                <h3 className="mt-1 truncate text-lg font-bold text-white drop-shadow-md" title={season.seasonName}>
                                    {season.seasonName}
                                </h3>
                            </div>
                        </div>

                        {/* Body Details */}
                        <div className="flex flex-1 flex-col p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                    <Sprout size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đối tượng nuôi trồng</p>
                                    <p className="text-sm font-bold text-slate-900">{season.cropName || "Chưa cập nhật"}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <Calendar size={14} className="text-slate-400" />
                                        Bắt đầu
                                    </div>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(season.startDate)}</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <Calendar size={14} className="text-slate-400" />
                                        Kết thúc
                                    </div>
                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                        {season.endDate ? formatDate(season.endDate) : formatDate(season.plannedEndDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <TrendingUp size={14} className="text-emerald-500" />
                                        Sản lượng
                                    </div>
                                    <p className="mt-1 text-sm font-bold text-emerald-600">
                                        {season.actualYieldKg != null && Number(season.actualYieldKg) > 0
                                            ? `${formatNumber(season.actualYieldKg)} kg`
                                            : season.expectedYieldKg != null && Number(season.expectedYieldKg) > 0
                                                ? `${formatNumber(season.expectedYieldKg)} kg`
                                                : "Chưa có mục tiêu"}
                                        <span className="text-xs font-normal text-slate-500 ml-1">
                                            {season.actualYieldKg != null && Number(season.actualYieldKg) > 0 ? "thực tế" : season.expectedYieldKg != null && Number(season.expectedYieldKg) > 0 ? "mục tiêu" : ""}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <DollarSign size={14} className="text-blue-500" />
                                        Doanh thu
                                    </div>
                                    <p className="mt-1 text-sm font-bold text-blue-600">
                                        {formatCurrency(season.totalRevenue || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Loading Overlay when viewing detail */}
                        {loadingDetailId === season.id && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                                <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-emerald-600 shadow-md">
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Đang tải...
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <Pagination
                page={pageInfo?.number}
                totalPages={pageInfo?.totalPages}
                totalElements={pageInfo?.totalElements}
                pageSize={pageInfo?.size}
                itemCount={seasons.length}
                loading={loading}
                onPageChange={onPageChange}
            />
        </div>
    );
}
