import { useState } from "react";
import { ClipboardCheck, Clock3, Plus, Scale, ShieldCheck } from "lucide-react";
import { CreateTransactionDrawer } from "../../../features/owner/inventory/components/CreateTransactionDrawer";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { OwnerPageHeader } from "../../owner/common/OwnerPageHeader";

const WAREHOUSES = [
    { value: "MATERIAL", label: "Kho vật tư", description: "Nhập vật tư hoặc xuất vật tư cho mùa vụ." },
    { value: "PRODUCT", label: "Kho sản phẩm", description: "Lưu kho hoặc bán trực tiếp sản lượng thu hoạch." },
];

function InfoCard({ icon: Icon, title, description, tone = "bg-emerald-50 text-[#006948]" }) {
    return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon size={19} strokeWidth={1.8} /></div><h2 className="mt-4 font-semibold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></article>;
}

export function StaffTransactionsPage() {
    const { user } = useAuth();
    const [warehouseType, setWarehouseType] = useState("MATERIAL");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const selectedWarehouse = WAREHOUSES.find((item) => item.value === warehouseType) || WAREHOUSES[0];

    return <section className="space-y-6 animate-fade-in">
        <OwnerPageHeader title="Tạo giao dịch" description="Ghi nhận nhập, xuất và thu hoạch cho Farm. Giao dịch Staff sẽ chờ Owner hoặc Farm Manager duyệt." actions={<button type="button" onClick={() => setDrawerOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#00583d]"><Plus size={16} />Tạo giao dịch</button>} />
        {!user?.farmId && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">Tài khoản Staff chưa được gán Farm.</div>}
        <div className="grid gap-4 md:grid-cols-3"><InfoCard icon={Clock3} title="Chờ duyệt" description="Giao dịch chỉ cập nhật tồn kho thực tế sau khi được duyệt." tone="bg-amber-50 text-amber-700" /><InfoCard icon={Scale} title="Lấy từ cân IoT" description="Có thể chọn cân ACTIVE và lấy khối lượng mới nhất ngay trong biểu mẫu." /><InfoCard icon={ShieldCheck} title="Có bằng chứng" description="Đính kèm ảnh hóa đơn hoặc bằng chứng giao dịch tối đa 20MB." /></div>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-semibold text-slate-900">Chọn kho giao dịch</h2><p className="mt-1 text-sm text-slate-500">Chọn đúng kho trước khi mở biểu mẫu.</p></div><div className="flex rounded-xl bg-slate-100 p-1">{WAREHOUSES.map((warehouse) => <button type="button" key={warehouse.value} onClick={() => setWarehouseType(warehouse.value)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${warehouseType === warehouse.value ? "bg-white text-[#006948] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{warehouse.label}</button>)}</div></div><div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#006948]"><ClipboardCheck size={19} /></div><div><h3 className="font-semibold text-[#006948]">{selectedWarehouse.label}</h3><p className="mt-1 text-sm text-emerald-900/70">{selectedWarehouse.description}</p></div></div><button type="button" onClick={() => setDrawerOpen(true)} className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"><Plus size={16} />Mở biểu mẫu {selectedWarehouse.label.toLowerCase()}</button></div></section>
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">Staff chỉ tạo giao dịch cho Farm được gán. Không thể chỉnh sửa hoặc duyệt giao dịch sau khi gửi; việc phê duyệt sẽ do Owner hoặc Farm Manager thực hiện.</div>
        <CreateTransactionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSuccess={() => setDrawerOpen(false)} warehouseType={warehouseType} staffMode />
    </section>;
}
