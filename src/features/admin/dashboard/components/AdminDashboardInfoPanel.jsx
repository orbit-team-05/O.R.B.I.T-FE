export function AdminDashboardInfoPanel({ pendingActions }) {
    const actions = pendingActions || {};

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Việc cần xử lý
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Các giao dịch cần Admin kiểm tra
                </p>
            </header>

            <div className="divide-y divide-slate-200 px-5">
                <div className="flex items-center justify-between py-3 text-sm">
                    <span className="text-slate-600">Phiếu nhập chờ duyệt</span>
                    <strong className={actions.pendingImports > 0 ? "text-amber-600" : "text-[#006948]"}>
                        {actions.pendingImports ?? 0}
                    </strong>
                </div>

                <div className="flex items-center justify-between py-3 text-sm">
                    <span className="text-slate-600">Phiếu xuất chờ duyệt</span>
                    <strong className={actions.pendingExports > 0 ? "text-amber-600" : "text-[#006948]"}>
                        {actions.pendingExports ?? 0}
                    </strong>
                </div>

                <div className="flex items-center justify-between py-3 text-sm">
                    <span className="text-slate-600">Giao dịch bị từ chối</span>
                    <strong className={actions.failedTransactions > 0 ? "text-red-600" : "text-[#006948]"}>
                        {actions.failedTransactions ?? 0}
                    </strong>
                </div>

                <div className="flex items-center justify-between py-3 text-sm">
                    <span className="text-slate-600">Thiết bị cân chưa tạo</span>
                    <strong className={actions.uncreatedDevices > 0 ? "text-amber-600" : "text-[#006948]"}>
                        {actions.uncreatedDevices ?? 0}
                    </strong>
                </div>

                <div className="flex items-center justify-between py-3 text-sm">
                    <span className="text-slate-600">Thiết bị cân chưa gắn Farm</span>
                    <strong className={actions.unassignedDevices > 0 ? "text-amber-600" : "text-[#006948]"}>
                        {actions.unassignedDevices ?? 0}
                    </strong>
                </div>
            </div>
        </section>
    );
}
