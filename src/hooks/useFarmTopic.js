export function useRealtimeTopic(topics, onMessage, options = {}) {
    return { connected: false };
}

export function useRealtimeRefresh(topics, reload, options = {}) {
    return { connected: false };
}

export function useFarmTopic(farmId, topic, onMessage, options = {}) {
    return { connected: false };
}

export function useFarmRealtimeRefresh(farmId, topics, reload, options = {}) {
    return { connected: false };
}

export function useAdminRealtimeRefresh(topics, reload, options = {}) {
    return { connected: false };
}
