import { RefreshCw } from "lucide-react";

const summaryCards = [
    {
        title: "Đang theo dõi",
        value: "3",
        description: "Mặt hàng",
    },
    {
        title: "Đồng giá",
        value: "9",
        description: "Từ crawler",
    },
    {
        title: "Tăng giá",
        value: "4",
        description: "So với kỳ trước",
    },
    {
        title: "Giảm giá",
        value: "5",
        description: "Cần theo dõi",
    },
];

const marketPrices = [
    {
        product: "Tôm thẻ 20 con/kg",
        species: "Tôm thẻ chân trắng",
        region: "Toàn quốc",
        size: "20",
        price: "204.000",
        unit: "đ/kg",
        change: "-4.20%",
        source: "TEPBAC",
    },
    {
        product: "Tôm thẻ 30 con/kg",
        species: "Tôm thẻ chân trắng",
        region: "Toàn quốc",
        size: "30",
        price: "153.000",
        unit: "đ/kg",
        change: "+23.40%",
        source: "TEPBAC",
    },
    {
        product: "Cá tra",
        species: "Cá tra",
        region: "Đồng Tháp",
        size: "DEFAULT",
        price: "29.000",
        unit: "đ/kg",
        change: "+1.20%",
        source: "TONGHOP",
    },
];

export function OwnerMarketPricesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">
                    Giá thị trường
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Theo dõi giá thị trường mới nhất theo danh sách mặt hàng
                    farm đang quan tâm
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                    <div
                        key={card.title}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <p className="text-xs font-medium uppercase text-slate-500">
                            {card.title}
                        </p>

                        <div className="mt-2 flex items-end gap-2">
                            <span className="text-4xl font-bold text-[#006948]">
                                {card.value}
                            </span>

                            <span className="pb-1 text-sm text-slate-500">
                                {card.description}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
                    <div>
                        <h2 className="font-semibold text-slate-800">
                            Danh sách giá theo dõi
                        </h2>

                        <p className="text-sm text-slate-500">
                            Giá được lấy từ watchlist của farm
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <option>Tất cả species</option>
                        </select>

                        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <option>Tất cả nguồn</option>
                        </select>

                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
                            <RefreshCw size={16} />
                            Làm mới
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Mặt hàng
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Species
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Khu vực
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Size
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Giá
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Đơn vị
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Thay đổi
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Nguồn
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {marketPrices.map((item) => (
                                <tr
                                    key={item.product}
                                    className="border-t border-slate-100"
                                >
                                    <td className="px-4 py-4 font-medium">
                                        {item.product}
                                    </td>

                                    <td className="px-4 py-4">
                                        {item.species}
                                    </td>

                                    <td className="px-4 py-4">
                                        {item.region}
                                    </td>

                                    <td className="px-4 py-4">{item.size}</td>

                                    <td className="px-4 py-4 font-semibold">
                                        {item.price}
                                    </td>

                                    <td className="px-4 py-4">{item.unit}</td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                item.change.includes("+")
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {item.change}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                                            {item.source}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-slate-800">
                        Biến động đáng chú ý
                    </h3>

                    <ul className="mt-4 space-y-3 text-sm">
                        <li className="text-green-600">
                            ↑ Tôm thẻ 30 con/kg tăng 23.40%
                        </li>

                        <li className="text-red-600">
                            ↓ Tôm thẻ 40 con/kg giảm 10.80%
                        </li>

                        <li className="text-slate-600">
                            Giá cá tra ổn định trong 24h
                        </li>
                    </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-slate-800">
                        Nguồn dữ liệu
                    </h3>

                    <div className="mt-4 grid gap-3">
                        {["TEPBAC", "TONGHOP", "FRUITVN"].map((source) => (
                            <div
                                key={source}
                                className="rounded-xl border border-slate-200 p-4"
                            >
                                <p className="font-medium">{source}</p>

                                <p className="text-xs text-slate-500">
                                    Cập nhật 20 phút trước
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}