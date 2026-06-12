import { useState } from "react";
import { RefreshCcw, Wifi, WifiOff } from "lucide-react";
import { IotImportConfirmDrawer } from "../../../features/owner/iot-imports/components/IotImportConfirmDrawer";
import { IotImportPendingTable } from "../../../features/owner/iot-imports/components/IotImportPendingTable";
import { useOwnerIotImports } from "../../../features/owner/iot-imports/hooks/useOwnerIotImports";

const CURRENT_FARM_ID = 1;

function PageHeader({ connected, onRefresh }) {
    return (
        <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p className="text-sm font-medium text-[#006948]">
                    Owner / Nhập kho realtime
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    Nhập kho từ trạm cân IoT
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Scan từ thiết bị sẽ hiện realtime để Owner nhập giá và xác nhận nhập kho.
                </p>
            </div>

            <div className="flex items-center gap-2">
                <div
                    className={[
                        "inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium",
                        connected
                            ? "border-emerald-100 bg-emerald-50 text-[#006948]"
                            : "border-slate-200 bg-slate-50 text-slate-500",
                    ].join(" ")}
                >
                    {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
                    {connected ? "Realtime online" : "Đang kết nối"}
                </div>

                <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    <RefreshCcw size={16} />
                    Làm mới
                </button>
            </div>
        </header>
    );
}

function ImportStats({ summary }) {
    const items = [
        { key: "pending", label: "Chờ xác nhận" },
        { key: "recognized", label: "Đã nhận diện QR" },
        { key: "unrecognized", label: "Lỗi QR" },
    ];

    return (
        <section className="grid gap-4 md:grid-cols-3">
            {items.map((item) => (
                <div
                    key={item.key}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-4"
                >
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {item.label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {summary?.[item.key] ?? 0}
                    </p>
                </div>
            ))}
        </section>
    );
}

export function OwnerIotImportsPage() {
    const {
        scans,
        summary,
        pageInfo,
        connected,
        initialLoading,
        tableLoading,
        submittingId,
        error,
        socketError,
        actionError,
        actionSuccess,
        setPage,
        reload,
        confirmImport,
        clearActionMessages,
    } = useOwnerIotImports(CURRENT_FARM_ID);

    const [selectedScan, setSelectedScan] = useState(null);

    function openConfirmDrawer(scan) {
        clearActionMessages();
        setSelectedScan(scan);
    }

    function closeConfirmDrawer() {
        clearActionMessages();
        setSelectedScan(null);
    }

    async function handleConfirmImport(transactionId, totalImportCost) {
        const result = await confirmImport(transactionId, totalImportCost);

        if (result) {
            closeConfirmDrawer();
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader connected={connected} onRefresh={reload} />

            <main className="space-y-5 px-6 py-6">
                {socketError && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        {socketError}
                    </div>
                )}

                {actionSuccess && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-[#006948]">
                        {actionSuccess}
                    </div>
                )}

                {error ? (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                ) : (
                    <>
                        <ImportStats summary={summary} />

                        <IotImportPendingTable
                            scans={scans}
                            pageInfo={pageInfo}
                            loading={initialLoading || tableLoading}
                            submittingId={submittingId}
                            onConfirm={openConfirmDrawer}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </main>

            <IotImportConfirmDrawer
                open={Boolean(selectedScan)}
                scan={selectedScan}
                submitting={submittingId === selectedScan?.transactionId}
                actionError={actionError}
                onClose={closeConfirmDrawer}
                onConfirm={handleConfirmImport}
            />
        </div>
    );
}