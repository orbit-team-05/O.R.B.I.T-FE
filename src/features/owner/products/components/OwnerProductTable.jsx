import { Image } from "lucide-react";
import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";
import Pagination from "../../../../components/common/pagination/Pagination";

const CATEGORY_LABELS = {
    FEED: "Thức ăn",
    MEDICINE: "Thuốc",
    CHEMICAL: "Hóa chất",
    MATERIAL: "Vật tư",
    HARVEST_PRODUCT: "Sản phẩm thu hoạch",
};

function formatDateTime(value) {
    if (!value) return "Chưa có";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatNumber(value) {
    if (value == null) return "0";
    return Number(value).toLocaleString("vi-VN");
}

export function OwnerProductTable({
                                      products,
                                      pageInfo,
                                      loading = false,
                                      onViewDetail,
                                      onPageChange,
                                  }) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Danh sách sản phẩm
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Sản phẩm dùng cho kho, keypad, QR và nhận diện IoT.
                </p>
            </header>

            {loading ? (
                <TableLoadingOverlay />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] border-collapse text-left">
                            <thead className="bg-slate-50">
                            <tr className="text-[11px] font-medium uppercase text-slate-600">
                                <th className="px-5 py-3 w-16">Ảnh</th>
                                <th className="px-5 py-3">Tên sản phẩm</th>
                                                                <th className="px-5 py-3">Loại</th>
                                <th className="px-5 py-3">Tồn tối thiểu</th>
                                <th className="px-5 py-3">Ngày tạo</th>
                                <th className="w-[120px] px-5 py-3">Hành động</th>
                            </tr>
                            </thead>

                            <tbody>
                            {products.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-slate-200 text-sm text-slate-700"
                                >
                                    <td className="px-5 py-4">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.productName} className="h-10 w-10 rounded-lg object-cover border border-slate-200 bg-slate-50" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                                                <Image size={20} />
                                            </div>
                                        )}
                                    </td>

                                    <td className="max-w-[260px] px-5 py-4">
                                        <div className="line-clamp-2 font-medium text-slate-900">
                                            {item.productName}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        {CATEGORY_LABELS[item.category] ?? item.category ?? "Chưa có"}
                                    </td>

                                    <td className="px-5 py-4 font-medium text-slate-900">
                                        {formatNumber(item.minimumStockQuantity ?? item.minimumStockGrams)}
                                    </td>

                                    <td className="px-5 py-4">
                                        {formatDateTime(item.createdAt)}
                                    </td>

                                    <td className="w-[120px] px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => onViewDetail?.(item)}
                                            className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {products.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-10 text-center text-sm text-slate-500"
                                    >
                                        Chưa có sản phẩm nào.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        page={pageInfo?.number}
                        totalPages={pageInfo?.totalPages}
                        totalElements={pageInfo?.totalElements}
                        loading={loading}
                        onPageChange={onPageChange}
                    />
                </>
            )}
        </section>
    );
}
