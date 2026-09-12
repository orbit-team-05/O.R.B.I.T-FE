import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { X, Search, MapPin } from "lucide-react";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { reverseFarmLocation, searchFarmLocations } from "../../features/owner/services/ownerFarmApi";

L.Marker.prototype.options.icon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function LocationMarker({ position, setPosition, onPositionChange }) {
    useMapEvents({
        click(event) {
            const next = { lat: event.latlng.lat, lng: event.latlng.lng };
            setPosition(next);
            onPositionChange(next);
        },
    });

    if (!position) return null;

    return (
        <Marker
            position={position}
            draggable
            eventHandlers={{
                dragend(event) {
                    const next = event.target.getLatLng();
                    const normalized = { lat: next.lat, lng: next.lng };
                    setPosition(normalized);
                    onPositionChange(normalized);
                },
            }}
        />
    );
}

function RecenterComponent({ center }) {
    const map = useMap();

    useEffect(() => {
        if (center) map.flyTo(center, 15);
    }, [center, map]);

    return null;
}

export function MapPickerModal({
    isOpen,
    onClose,
    onConfirm,
    initialAddress = "",
    initialLatitude = null,
    initialLongitude = null,
}) {
    const [position, setPosition] = useState(null);
    const [addressText, setAddressText] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]);

    useEffect(() => {
        if (!isOpen) return;

        const hasInitialPosition = initialLatitude !== null && initialLongitude !== null;
        const initialPosition = hasInitialPosition
            ? { lat: Number(initialLatitude), lng: Number(initialLongitude) }
            : null;

        // The modal form is reset whenever it opens or receives a new farm location.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPosition(initialPosition);
        setAddressText(initialAddress || "");
        setSuggestions([]);
        if (initialPosition) setMapCenter([initialPosition.lat, initialPosition.lng]);
        if (!initialPosition && initialAddress?.trim().length >= 3) {
            searchAddress(initialAddress);
        }
        // Search is intentionally triggered only when the modal receives a new location.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialAddress, initialLatitude, initialLongitude]);

    async function searchAddress(query = addressText) {
        if (query.trim().length < 3) return;
        setIsLoading(true);
        try {
            setSuggestions(await searchFarmLocations(query.trim()));
        } catch {
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }

    function applyLocation(location) {
        const next = { lat: Number(location.latitude), lng: Number(location.longitude) };
        setPosition(next);
        setMapCenter([next.lat, next.lng]);
        setAddressText(location.label || "");
        setSuggestions([]);
    }

    async function onPositionChange(next) {
        setIsLoading(true);
        try {
            const result = await reverseFarmLocation(next.lat, next.lng);
            if (result?.label) setAddressText(result.label);
        } catch {
            // Keep the marker usable even when reverse geocoding is temporarily unavailable.
        } finally {
            setIsLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex h-[min(760px,90vh)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-600">Farm Profile</p>
                        <h2 className="mt-1 text-lg font-semibold text-slate-900">Chọn vị trí nông trại</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Đóng">
                        <X size={20} />
                    </button>
                </header>

                <div className="border-b border-slate-200 p-4">
                    <div className="relative flex gap-2">
                        <div className="relative flex-1">
                            <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                                value={addressText}
                                onChange={(event) => setAddressText(event.target.value)}
                                onKeyDown={(event) => event.key === "Enter" && searchAddress()}
                                placeholder="Tìm địa chỉ tại Việt Nam"
                                className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                            />
                            {suggestions.length > 0 && (
                                <div className="absolute inset-x-0 top-12 z-20 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={`${suggestion.providerId}-${suggestion.latitude}-${suggestion.longitude}`}
                                            type="button"
                                            onClick={() => applyLocation(suggestion)}
                                            className="block w-full border-b border-slate-100 px-3 py-2.5 text-left text-sm text-slate-700 last:border-0 hover:bg-emerald-50"
                                        >
                                            {suggestion.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button type="button" onClick={() => searchAddress()} disabled={isLoading} className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60">
                            <Search size={16} />
                            Tìm
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Chọn gợi ý hoặc kéo marker đến vị trí chính xác của Farm.</p>
                </div>

                <div className="min-h-0 flex-1 bg-slate-100">
                    <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <RecenterComponent center={mapCenter} />
                        <LocationMarker position={position} setPosition={setPosition} onPositionChange={onPositionChange} />
                    </MapContainer>
                </div>

                <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                    <span className="text-xs text-slate-500">{isLoading ? "Đang xác định địa chỉ..." : "Marker có thể kéo để điều chỉnh"}</span>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                        <button
                            type="button"
                            onClick={() => onConfirm({ address: addressText, latitude: position?.lat, longitude: position?.lng })}
                            disabled={!position || !addressText || isLoading}
                            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Xác nhận vị trí
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
