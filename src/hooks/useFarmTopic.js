import { useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const STORAGE_TOKEN_KEY = "orbit_access_token";

function getSocketUrl() {
    const wsUrl = import.meta.env.VITE_WS_URL;

    if (wsUrl) {
        return wsUrl;
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    if (!apiBaseUrl) {
        return "/ws";
    }

    const backendBaseUrl = apiBaseUrl
        .replace(/\/api\/?$/, "")
        .replace(/\/$/, "");

    return `${backendBaseUrl}/ws`;
}

function toArray(value) {
    if (Array.isArray(value)) {
        return value;
    }

    return value ? [value] : [];
}

function unique(items) {
    return Array.from(new Set(items.filter(Boolean)));
}

function normalizeTopic(topic) {
    if (!topic) {
        return "";
    }

    if (
        topic.startsWith("/topic/") ||
        topic.startsWith("/queue/") ||
        topic.startsWith("/user/")
    ) {
        return topic;
    }

    return `/topic/${topic.replace(/^\/+/, "")}`;
}

function getFarmTopicDestinations(farmId, topic) {
    if (topic.startsWith("/topic/")) {
        return [topic];
    }

    const normalizedTopic = topic.replace(/^\/+/, "");

    return [
        `/topic/farms/${farmId}/${normalizedTopic}`,
        `/topic/${normalizedTopic}`,
    ];
}

function getAdminTopicDestinations(topic) {
    if (topic.startsWith("/topic/")) {
        return [topic];
    }

    const normalizedTopic = topic.replace(/^\/+/, "");

    return [
        `/topic/admin/${normalizedTopic}`,
        `/topic/${normalizedTopic}`,
    ];
}

function getConnectHeaders() {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);

    return token
        ? {
            Authorization: `Bearer ${token}`,
        }
        : {};
}

export function useRealtimeTopic(topics, onMessage, options = {}) {
    const onMessageRef = useRef(onMessage);
    const optionsRef = useRef(options);
    const [connected, setConnected] = useState(false);
    const enabled = options.enabled ?? true;
    const reconnectDelay = options.reconnectDelay ?? 5000;
    const debug = options.debug ?? false;

    const destinations = useMemo(
        () =>
            toArray(topics)
                .map(normalizeTopic)
                .filter(Boolean),
        [topics],
    );

    const destinationKey = destinations.join("|");

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    useEffect(() => {
        if (!enabled || destinations.length === 0) {
            return undefined;
        }

        let subscriptions = [];

        const client = new Client({
            webSocketFactory: () => new SockJS(getSocketUrl()),
            connectHeaders: getConnectHeaders(),
            reconnectDelay,
            debug: debug ? console.debug : () => {},
            beforeConnect: () => {
                client.connectHeaders = getConnectHeaders();
            },
            onConnect: () => {
                setConnected(true);

                if (import.meta.env.DEV) {
                    console.debug("[ORBIT WS] connected", destinations);
                }

                subscriptions = destinations.map((destination) =>
                    client.subscribe(destination, (message) => {
                        try {
                            const payload = message.body
                                ? JSON.parse(message.body)
                                : null;

                            if (import.meta.env.DEV) {
                                console.debug("[ORBIT WS] message", {
                                    destination,
                                    payload,
                                });
                            }

                            onMessageRef.current?.(payload, message);
                        } catch (error) {
                            optionsRef.current.onError?.(error);
                        }
                    }),
                );
            },
            onDisconnect: () => {
                setConnected(false);
            },
            onStompError: (frame) => {
                setConnected(false);
                optionsRef.current.onError?.(frame);
            },
            onWebSocketClose: (event) => {
                setConnected(false);
                optionsRef.current.onClose?.(event);
            },
        });

        client.activate();

        return () => {
            setConnected(false);
            subscriptions.forEach((subscription) => {
                subscription.unsubscribe();
            });
            void client.deactivate();
        };
    }, [debug, destinationKey, destinations, enabled, reconnectDelay]);

    return { connected };
}

export function useRealtimeRefresh(topics, reload, options = {}) {
    const reloadRef = useRef(reload);
    const timerRef = useRef(null);
    const debounceMs = options.debounceMs ?? 300;

    useEffect(() => {
        reloadRef.current = reload;
    }, [reload]);

    useEffect(
        () => () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        },
        [],
    );

    return useRealtimeTopic(
        topics,
        () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                void Promise.resolve(reloadRef.current?.()).catch((error) => {
                    options.onError?.(error);
                });
            }, debounceMs);
        },
        options,
    );
}

export function useFarmTopic(farmId, topic, onMessage, options = {}) {
    const destinations = useMemo(() => {
        if (!farmId) {
            return [];
        }

        return toArray(topic)
            .filter(Boolean)
            .flatMap((item) => getFarmTopicDestinations(farmId, item))
            .concat(`/topic/farms/${farmId}`)
            .filter(Boolean);
    }, [farmId, topic]);
    const uniqueDestinations = useMemo(
        () => unique(destinations),
        [destinations],
    );

    return useRealtimeTopic(uniqueDestinations, onMessage, {
        ...options,
        enabled: (options.enabled ?? true) && Boolean(farmId),
    });
}

export function useFarmRealtimeRefresh(farmId, topics, reload, options = {}) {
    const destinations = useMemo(() => {
        if (!farmId) {
            return [];
        }

        return toArray(topics)
            .filter(Boolean)
            .flatMap((topic) => getFarmTopicDestinations(farmId, topic))
            .concat(`/topic/farms/${farmId}`)
            .filter(Boolean);
    }, [farmId, topics]);
    const uniqueDestinations = useMemo(
        () => unique(destinations),
        [destinations],
    );

    return useRealtimeRefresh(uniqueDestinations, reload, {
        ...options,
        enabled: (options.enabled ?? true) && Boolean(farmId),
    });
}

export function useAdminRealtimeRefresh(topics, reload, options = {}) {
    const destinations = useMemo(
        () =>
            toArray(topics)
                .filter(Boolean)
                .flatMap(getAdminTopicDestinations)
                .concat("/topic/admin")
                .filter(Boolean),
        [topics],
    );
    const uniqueDestinations = useMemo(
        () => unique(destinations),
        [destinations],
    );

    return useRealtimeRefresh(uniqueDestinations, reload, options);
}
