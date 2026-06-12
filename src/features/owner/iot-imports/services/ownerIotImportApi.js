import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { httpClient } from "../../../../services/httpClient";

function getEndpoint(farmId) {
    return `/farms/${farmId}/iot-imports`;
}

function getSocketBaseUrl() {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

    if (!apiBaseUrl) {
        return "";
    }

    return apiBaseUrl.replace(/\/api\/?$/, "");
}

export async function getPendingImportScans(farmId, page = 0, size = 10) {
    const response = await httpClient.get(`${getEndpoint(farmId)}/pending`, {
        params: { page, size },
    });

    return response.data.data;
}

export async function confirmImportScan(farmId, transactionId, totalImportCost) {
    const response = await httpClient.patch(
        `${getEndpoint(farmId)}/${transactionId}/confirm`,
        { totalImportCost: Number(totalImportCost) },
    );

    return response.data.data;
}

export function connectIotImportSocket(
    farmId,
    onMessage,
    onError,
    onConnected,
    onDisconnected,
) {
    const socketUrl = `${getSocketBaseUrl()}/ws`;

    console.log("IOT IMPORT SOCKET URL:", socketUrl);

    const client = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        reconnectDelay: 3000,

        onConnect: () => {
            onConnected?.();

            client.subscribe(`/topic/farms/${farmId}/iot-imports`, (message) => {
                const payload = JSON.parse(message.body);
                onMessage?.(payload);
            });
        },

        onDisconnect: () => {
            onDisconnected?.();
        },

        onStompError: (frame) => {
            onError?.(frame?.headers?.message || "WebSocket lỗi.");
        },

        onWebSocketError: () => {
            onError?.("Không thể kết nối WebSocket.");
        },
    });

    client.activate();

    return () => {
        client.deactivate();
    };
}