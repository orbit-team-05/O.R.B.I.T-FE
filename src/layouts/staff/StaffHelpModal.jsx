import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const HELP = {
    dashboard: { title: "Tổng quan Staff", summary: "Theo dõi nhanh giao dịch do bạn tạo, thiết bị cân và mùa vụ đang vận hành.", steps: ["Kiểm tra giao dịch đang chờ duyệt.", "Kiểm tra lần cân gần nhất trước khi tạo giao dịch.", "Dùng các nút thao tác nhanh để mở đúng luồng vận hành."] },
    transactions: { title: "Tạo giao dịch", summary: "Giao dịch Staff tạo sẽ ở trạng thái chờ duyệt và chưa làm thay đổi tồn thực tế.", steps: ["Chọn đúng loại giao dịch và sản phẩm.", "Dùng khối lượng từ cân nếu có.", "Đính kèm bằng chứng trước khi gửi."] },
    devices: { title: "Thiết bị cân", summary: "Thiết bị cân chỉ gửi khối lượng lên hệ thống; Staff không thay đổi cấu hình thiết bị.", steps: ["Chọn thiết bị đang hoạt động.", "Kiểm tra thời điểm khối lượng gần nhất.", "Nếu dữ liệu cũ, có thể dùng nhập tay theo quy trình."] },
    lookup: { title: "Tra cứu Farm", summary: "Tra cứu dữ liệu cần thiết để tạo giao dịch trong Farm được phân công.", steps: ["Chỉ sử dụng sản phẩm đang hoạt động.", "Chọn mùa vụ phù hợp với nghiệp vụ.", "Không chỉnh sửa dữ liệu danh mục từ workspace Staff."] },
    history: { title: "Lịch sử giao dịch", summary: "Theo dõi các giao dịch do chính bạn tạo và kết quả phê duyệt.", steps: ["Dùng bộ lọc để xem giao dịch đang chờ, đã duyệt hoặc bị từ chối.", "Nếu bị từ chối, đọc lý do trước khi tạo giao dịch mới.", "Bấm Xem bằng chứng để kiểm tra ảnh đã gửi cùng giao dịch."] },
};

function getHelp(pathname) {
    if (pathname.includes("transaction-history")) return HELP.history;
    if (pathname.includes("transactions")) return HELP.transactions;
    if (pathname.includes("devices")) return HELP.devices;
    if (pathname.includes("lookup")) return HELP.lookup;
    return HELP.dashboard;
}

export function StaffHelpModal({ open, pathname, onClose }) {
    const dialogRef = useRef(null);
    const section = getHelp(pathname);

    useEffect(() => {
        if (!open) return undefined;
        const handleKeyDown = (event) => { if (event.key === "Escape") onClose(); };
        document.addEventListener("keydown", handleKeyDown);
        dialogRef.current?.focus();
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-start justify-end bg-slate-900/30 p-4 pt-[82px] backdrop-blur-[2px]" onClick={onClose}>
            <section ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1} className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none" onClick={(event) => event.stopPropagation()}>
                <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#006948]">Hướng dẫn Staff</p><h2 className="mt-1 text-lg font-semibold text-slate-900">{section.title}</h2></div><button type="button" onClick={onClose} aria-label="Đóng hướng dẫn" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"><X size={18} /></button></header>
                <div className="space-y-5 px-5 py-5"><p className="text-sm leading-6 text-slate-600">{section.summary}</p><ol className="space-y-3">{section.steps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-5 text-slate-700"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-[#006948]">{index + 1}</span><span>{step}</span></li>)}</ol></div>
            </section>
        </div>
    );
}
