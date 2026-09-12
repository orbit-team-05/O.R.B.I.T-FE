import { useForm } from "react-hook-form";
import { X, Save, Upload, Loader2, Weight } from "lucide-react";
import { useEffect, useState } from "react";
import { httpClient } from "../../../../services/httpClient";
import { useAuth } from "../../../auth/context/AuthContext";
import { useToast } from "../../../../components/common/toast/ToastProvider";
import { uploadInventoryEvidence } from "../services/inventoryEvidenceApi";
import { ImagePreviewModal } from "../../../../components/ui/ImagePreviewModal";

const TRANSACTION_TYPES = [
    { value: "IMPORT", label: "Nhập kho (Mua mới)" },
    { value: "EXPORT_FEED", label: "Xuất kho (Sử dụng / Hao hụt)" },
    { value: "HARVEST_EXPORT", label: "Bán trực tiếp khi thu hoạch" },
    { value: "HARVEST_IN", label: "Đưa sản lượng thu hoạch vào kho" },
    { value: "RETURN_OUT", label: "Xuất trả NCC" },
    { value: "RETURN_IN", label: "Hoàn trả vào kho" }
];

const MATERIAL_TRANSACTION_TYPES = new Set(["IMPORT", "EXPORT_FEED", "RETURN_OUT", "RETURN_IN"]);
const PRODUCT_TRANSACTION_TYPES = new Set(["HARVEST_IN", "HARVEST_EXPORT", "PRODUCT_SALE"]);

function parseLocalizedNumber(value) {
    return Number(String(value ?? "").replace(/\./g, "").replace(",", "."));
}

function formatLocalizedNumber(value) {
    if (value === null || value === undefined || value === "") return "";
    return Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 3 });
}

function formatNumberField(event) {
    const value = event.target.value.replace(/\s/g, "").replace(/[^0-9,.]/g, "");
    const commaIndex = value.indexOf(",");
    const dotCount = (value.match(/\./g) || []).length;
    let integerPart;
    let decimalPart = "";

    if (commaIndex >= 0) {
        integerPart = value.slice(0, commaIndex).replace(/\./g, "").replace(/\D/g, "");
        decimalPart = value.slice(commaIndex + 1).replace(/\D/g, "");
    } else if (dotCount === 1 && value.split(".")[1].length <= 2) {
        [integerPart, decimalPart] = value.split(".");
        integerPart = integerPart.replace(/\D/g, "");
        decimalPart = decimalPart.replace(/\D/g, "");
    } else {
        integerPart = value.replace(/\./g, "").replace(/\D/g, "");
    }

    const formattedInteger = integerPart ? Number(integerPart).toLocaleString("vi-VN") : "";
    event.target.value = decimalPart.length > 0
        ? `${formattedInteger},${decimalPart}`
        : formattedInteger;
    return event;
}

export function CreateTransactionDrawer({ open, onClose, onSuccess, warehouseType = "MATERIAL", staffMode = false }) {
    const { user } = useAuth();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [products, setProducts] = useState([]);
    const [devices, setDevices] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [certificateFiles, setCertificateFiles] = useState([]);
    const [certificatePreviewUrls, setCertificatePreviewUrls] = useState([]);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            transactionType: "IMPORT",
            productId: "",
            quantityKg: "",
            unitPrice: "",
            totalAmount: "",
            salePriceKg: "",
            evidenceImageUrl: "",
            deviceId: "",
            seasonId: ""
        }
    });

    const watchType = watch("transactionType");
    const watchProductId = watch("productId");
    const selectedProduct = products?.find(p => p.id === Number(watchProductId));
    const isProductWarehouse = warehouseType === "PRODUCT";
    const staffTransactionTypes = isProductWarehouse
        ? new Set(["HARVEST_EXPORT", "HARVEST_IN"])
        : new Set(["IMPORT", "EXPORT_FEED"]);
    const allowedTransactionTypes = TRANSACTION_TYPES.filter((item) =>
        (staffMode ? staffTransactionTypes : (isProductWarehouse ? PRODUCT_TRANSACTION_TYPES : MATERIAL_TRANSACTION_TYPES)).has(item.value)
    );
    const availableProducts = products?.filter((product) =>
        product.status !== "INACTIVE" && (isProductWarehouse
            ? product.category === "HARVEST_PRODUCT"
            : product.category !== "HARVEST_PRODUCT")
    );
    const availableDevices = devices?.filter((device) => !staffMode || device.status === "ACTIVE");
    const availableSeasons = seasons?.filter((season) => !staffMode || ["PLANNING", "ACTIVE", "HARVESTING"].includes(season.status));
    const isPurchaseInbound = ["IMPORT", "RETURN_IN"].includes(watchType);
    const isDirectHarvestSale = watchType === "HARVEST_EXPORT";
    const isStoredProductSale = watchType === "PRODUCT_SALE";
    const isSale = isDirectHarvestSale || isStoredProductSale;
    const isHarvestToStock = watchType === "HARVEST_IN";
    const requiresSeason = ["EXPORT_FEED", "HARVEST_IN", "HARVEST_EXPORT", "PRODUCT_SALE"].includes(watchType);

    useEffect(() => {
        if (!open || !user?.farmId) return;

        // Fetch products and devices
        const fetchData = async () => {
            try {
                const [productsRes, devicesRes, seasonsRes] = await Promise.allSettled([
                    httpClient.get(`/farms/${user.farmId}/products?size=1000`),
                    httpClient.get(`/farms/${user.farmId}/iot-devices`),
                    httpClient.get(`/seasons/cards?size=1000`)
                ]);
                
                const productsData = productsRes.status === "fulfilled" ? productsRes.value.data : null;
                const devicesData = devicesRes.status === "fulfilled" ? devicesRes.value.data : null;
                const seasonsData = seasonsRes.status === "fulfilled" ? seasonsRes.value.data : null;

                setProducts(productsData?.data?.content || productsData?.data || []);
                setDevices(devicesData?.data?.content || devicesData?.data || []);
                setSeasons(seasonsData?.data?.content || seasonsData?.data || []);
            } catch (error) {
                console.error("Failed to fetch dependencies", error);
            }
        };
        fetchData();
        reset({ transactionType: isProductWarehouse ? "HARVEST_IN" : "IMPORT" });
        setImageFile(null);
        setImagePreviewUrl(null);
        setCertificateFiles([]);
        setCertificatePreviewUrls([]);
    }, [open, user?.farmId, reset, isProductWarehouse]);

    const fetchWeightFromDevice = async () => {
        // react-hook-form's watch is intentionally used for this imperative action.
        // eslint-disable-next-line react-hooks/incompatible-library
        const deviceId = watch("deviceId");
        if (!deviceId) {
            toast.error("Vui lòng chọn thiết bị cân để lấy dữ liệu");
            return;
        }

        try {
            const response = await httpClient.get(`/farms/${user.farmId}/iot-devices/${deviceId}/latest-weight`);
            const weightGrams = response.data?.data?.weightGrams;
            if (weightGrams == null) {
                toast.error("Cân chưa gửi khối lượng mới.");
                return;
            }
            setValue("quantityKg", formatLocalizedNumber(Number(weightGrams) / 1000), { shouldValidate: true });
            toast.success("Đã lấy khối lượng mới nhất từ cân.");
        } catch {
            toast.error("Không thể lấy dữ liệu từ cân");
        }
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const parsedTotal = parseLocalizedNumber(data.totalAmount);
            const parsedSalePrice = parseLocalizedNumber(data.salePriceKg);
            const parsedQty = parseLocalizedNumber(data.quantityKg);
            if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
                toast.error("Số lượng phải lớn hơn 0.");
                return;
            }
            if (isPurchaseInbound && (!Number.isFinite(parsedTotal) || parsedTotal <= 0)) {
                toast.error("Tổng tiền nhập kho phải lớn hơn 0.");
                return;
            }
            if (isSale && (!Number.isFinite(parsedSalePrice) || parsedSalePrice <= 0)) {
                toast.error("Giá bán thực tế phải lớn hơn 0.");
                return;
            }
            let imageUrl = null;
            if (imageFile) {
                imageUrl = await uploadInventoryEvidence(imageFile);
            }
            const certificateImageUrls = isHarvestToStock
                ? await Promise.all(certificateFiles.map((file) => uploadInventoryEvidence(file)))
                : [];
            const payload = {
                farmId: user.farmId,
                productId: Number(data.productId),
                transactionType: data.transactionType,
                quantityKg: parsedQty,
                unitPrice: isSale
                    ? parsedSalePrice
                    : isPurchaseInbound && parsedTotal > 0 ? (parsedTotal / parsedQty) : null,
                evidenceImageUrl: imageUrl || null,
                certificateImageUrls,
                deviceId: data.deviceId || null,
                seasonId: requiresSeason && data.seasonId ? Number(data.seasonId) : null
            };

            await httpClient.post("/inventory/transactions", payload);
            toast.success("Tạo giao dịch thành công");
            onSuccess?.();
            onClose();
        } catch (error) {
            const errStr = error.response ? JSON.stringify(error.response.data) : error.message;
            toast.error("CHI TIẾT LỖI: " + errStr);
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
    <>
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            />

                <aside className="absolute right-0 top-0 flex h-full w-full lg:w-2/3 flex-col border-l border-slate-200 bg-white shadow-2xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {isProductWarehouse ? "Tạo giao dịch kho sản phẩm" : "Tạo giao dịch kho vật tư"}
                        </h2>
                        <p className="text-xs text-slate-500">
                            {isProductWarehouse
                                ? "Lưu sản lượng hoặc bán sản phẩm đã thu hoạch"
                                : "Nhập/xuất vật tư phục vụ sản xuất"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </header>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-1 flex-col overflow-hidden"
                >
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Loại giao dịch <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("transactionType", { required: true })}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#006948] focus:outline-none focus:ring-1 focus:ring-[#006948]"
                            >
                                {allowedTransactionTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Vật tư / Sản phẩm <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("productId", { required: "Vui lòng chọn vật tư" })}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#006948] focus:outline-none focus:ring-1 focus:ring-[#006948]"
                            >
                                <option value="">-- Chọn vật tư --</option>
                                {availableProducts?.map(p => (
                                    <option key={p.id} value={p.id}>{p.productName || p.name}</option>
                                ))}
                            </select>
                            {errors.productId && <p className="mt-1 text-xs text-red-500">{errors.productId.message}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 flex justify-between text-sm font-medium text-slate-700">
                                <span>Số lượng / Khối lượng {selectedProduct ? `(${selectedProduct.storageUnit})` : ""} <span className="text-red-500">*</span></span>
                                <button type="button" onClick={fetchWeightFromDevice} className="text-[#006948] hover:underline flex items-center gap-1">
                                    <Weight size={14} /> Lấy từ cân
                                </button>
                            </label>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="VD: 25.5"
                                {...register("quantityKg", {
                                    required: "Vui lòng nhập số lượng/khối lượng",
                                    onChange: formatNumberField,
                                    validate: (value) => parseLocalizedNumber(value) > 0 || "Số lượng phải lớn hơn 0",
                                })}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#006948] focus:outline-none focus:ring-1 focus:ring-[#006948]"
                            />
                            {errors.quantityKg && <p className="mt-1 text-xs text-red-500">{errors.quantityKg.message}</p>}
                        </div>

                        {requiresSeason && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    {isHarvestToStock || isSale ? "Mùa vụ nguồn" : "Mùa vụ sử dụng"} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register("seasonId", { required: "Vui lòng chọn mùa vụ" })}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#006948] focus:outline-none focus:ring-1 focus:ring-[#006948]"
                                >
                                    <option value="">-- Chọn mùa vụ --</option>
                                    {availableSeasons?.map(s => (
                                        <option key={s.seasonId || s.id} value={s.seasonId || s.id}>{s.seasonName || s.name || s.title || `Mùa vụ #${s.seasonId || s.id}`}</option>
                                    ))}
                                </select>
                                {errors.seasonId && <p className="mt-1 text-xs text-red-500">{errors.seasonId.message}</p>}
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Thiết bị cân IoT (Tùy chọn)
                            </label>
                            <select
                                {...register("deviceId")}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#006948] focus:outline-none focus:ring-1 focus:ring-[#006948]"
                            >
                                <option value="">-- Chọn cân --</option>
                                {availableDevices?.map(d => (
                                    <option key={d.deviceId} value={d.deviceId}>{d.deviceName || d.deviceId}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-slate-500">Chọn cân nếu bạn muốn lấy khối lượng tự động</p>
                        </div>

                        {isPurchaseInbound && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Tổng tiền hóa đơn (VNĐ) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="VD: 1.500.000"
                                    {...register("totalAmount", { 
                                        required: "Vui lòng nhập tổng tiền/đơn giá",
                                        onChange: formatNumberField,
                                        validate: (value) => parseLocalizedNumber(value) > 0 || "Số tiền phải lớn hơn 0",
                                    })}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#006948] focus:outline-none focus:ring-1 focus:ring-[#006948]"
                                />
                                {errors.totalAmount && <p className="mt-1 text-xs text-red-500">{errors.totalAmount.message}</p>}
                            </div>
                        )}

                        {isSale && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Giá bán thực tế (VNĐ/kg) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="VD: 85.000"
                                    {...register("salePriceKg", {
                                        required: "Vui lòng nhập giá bán thực tế",
                                        onChange: formatNumberField,
                                        validate: (value) => parseLocalizedNumber(value) > 0 || "Giá bán phải lớn hơn 0",
                                    })}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#006948] focus:outline-none focus:ring-1 focus:ring-[#006948]"
                                />
                                {errors.salePriceKg && <p className="mt-1 text-xs text-red-500">{errors.salePriceKg.message}</p>}
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Ảnh hóa đơn / Bằng chứng
                            </label>
                            <div className="flex gap-4">
                                <label className="flex h-32 w-32 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-[#006948] hover:bg-emerald-50">
                                    <Upload className="mb-2 h-6 w-6 text-slate-400" />
                                    <p className="text-xs font-semibold text-[#006948]">Tải ảnh lên</p>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files[0] || null;
                                        if (file && file.size > 20 * 1024 * 1024) {
                                            toast.error("Kích thước ảnh không được vượt quá 20MB");
                                            e.target.value = "";
                                            return;
                                        }
                                        if (file && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                                            toast.error("Chỉ chấp nhận ảnh JPG, PNG hoặc WebP");
                                            e.target.value = "";
                                            return;
                                        }
                                        setImageFile(file);
                                        setImagePreviewUrl(file ? URL.createObjectURL(file) : null);
                                    }}
                                    />
                                </label>

                                {imageFile && (
                                    <div className="relative h-32 flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2">
                                        <button 
                                            type="button"
                                            onClick={() => setPreviewImage(imagePreviewUrl)}
                                            className="h-full w-full"
                                        >
                                            <img
                                                src={imagePreviewUrl}
                                                alt="Preview"
                                                className="h-full w-full object-contain rounded-lg"
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageFile(null);
                                                setImagePreviewUrl(null);
                                            }}
                                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-slate-500">Có thể bỏ qua và bổ sung sau bằng app trên điện thoại</p>
                        </div>

                        {isHarvestToStock && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Ảnh chứng chỉ sản phẩm
                                </label>
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#006948] transition-colors hover:border-[#006948] hover:bg-emerald-50">
                                        <Upload size={17} />
                                        Thêm ảnh chứng chỉ
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={(event) => {
                                                const selectedFiles = Array.from(event.target.files || []);
                                                const remainingSlots = Math.max(0, 10 - certificateFiles.length);
                                                const filesToAdd = selectedFiles.slice(0, remainingSlots);
                                                if (selectedFiles.length > remainingSlots) {
                                                    toast.error("Có thể tải tối đa 10 ảnh chứng chỉ cho một giao dịch");
                                                }
                                                const validFiles = filesToAdd.filter((file) => {
                                                    if (file.size > 20 * 1024 * 1024) {
                                                        toast.error(`${file.name}: kích thước không được vượt quá 20MB`);
                                                        return false;
                                                    }
                                                    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                                                        toast.error(`${file.name}: chỉ chấp nhận ảnh JPG, PNG hoặc WebP`);
                                                        return false;
                                                    }
                                                    return true;
                                                });
                                                setCertificateFiles((current) => [...current, ...validFiles]);
                                                setCertificatePreviewUrls((current) => [
                                                    ...current,
                                                    ...validFiles.map((file) => URL.createObjectURL(file)),
                                                ]);
                                                event.target.value = "";
                                            }}
                                        />
                                    </label>
                                    {certificatePreviewUrls.length > 0 ? (
                                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            {certificatePreviewUrls.map((url, index) => (
                                                <div key={`${url}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewImage(url)}
                                                        className="h-full w-full"
                                                        aria-label={`Xem ảnh chứng chỉ ${index + 1}`}
                                                    >
                                                        <img src={url} alt={`Chứng chỉ ${index + 1}`} className="h-full w-full object-cover" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            URL.revokeObjectURL(url);
                                                            setCertificateFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
                                                            setCertificatePreviewUrls((current) => current.filter((_, previewIndex) => previewIndex !== index));
                                                        }}
                                                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                                                        aria-label={`Xóa ảnh chứng chỉ ${index + 1}`}
                                                    >
                                                        <X size={13} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-xs text-slate-500">Có thể tải nhiều ảnh, tối đa 10 ảnh; mỗi ảnh không quá 20MB.</p>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#00583d] disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Lưu Giao Dịch
                        </button>
                    </footer>
                </form>
            </aside>
        </div>
            <ImagePreviewModal open={!!previewImage} src={previewImage} onClose={() => setPreviewImage(null)} />
        </>
    );
}
