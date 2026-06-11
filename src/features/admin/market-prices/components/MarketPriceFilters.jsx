export function MarketPriceFilters({
                                       filters,
                                       sourceOptions,
                                       speciesOptions,
                                       onFilterChange,
                                       onReset,
                                   }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
            <div>
                <h2 className="text-base font-semibold text-slate-900">
                    Danh sách Giá đã Crawl
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Dữ liệu giá thị trường mới nhất được lưu từ các nguồn crawl
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <select
                    value={filters.sourceId}
                    onChange={(event) => onFilterChange("sourceId", event.target.value)}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                >
                    <option value="">Tất cả nguồn</option>

                    {sourceOptions.map((source) => (
                        <option key={source.id} value={source.id}>
                            {source.sourceCode}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.speciesId}
                    onChange={(event) => onFilterChange("speciesId", event.target.value)}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                >
                    <option value="">Tất cả species</option>

                    {speciesOptions.map((species) => (
                        <option key={species.id} value={species.id}>
                            {species.name}
                        </option>
                    ))}
                </select>

                <input
                    value={filters.location}
                    onChange={(event) => onFilterChange("location", event.target.value)}
                    placeholder="Tất cả khu vực"
                    className="h-9 w-[150px] rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                />

                <button
                    type="button"
                    onClick={onReset}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                    Xóa lọc
                </button>
            </div>
        </div>
    );
}