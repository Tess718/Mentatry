"use client";

import { useEffect, useRef } from "react";

interface UseSSERelayOptions {
  roomId: string;
  onEvent: (event: any) => void;
  onResync: () => void;
  enabled?: boolean;
}

export function useSSERelay({ roomId, onEvent, onResync, enabled = true }: UseSSERelayOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const isMounted = useRef(true);
  const hasConnectedOnce = useRef(false);

  // Store callbacks in refs so the EventSource handlers always call
  // the latest version without needing them in the useEffect dep array.
  // This prevents the EventSource from being torn down and reconnected
  // on every render (since inline arrows create new function identities).
  const onEventRef = useRef(onEvent);
  const onResyncRef = useRef(onResync);
  onEventRef.current = onEvent;
  onResyncRef.current = onResync;

  useEffect(() => {
    isMounted.current = true;
    const relayUrl = process.env.NEXT_PUBLIC_RELAY_URL;
    
    if (!enabled) {
      return;
    }

    if (!relayUrl || !roomId) {
      return;
    }

    function connect() {
      if (!isMounted.current) return;

      const url = `${relayUrl}/subscribe/${roomId}`;
      const source = new EventSource(url);
      eventSourceRef.current = source;

      source.onopen = () => {
        if (hasConnectedOnce.current) {
          // This is a reconnection after a drop. We might have missed events.
          // Trigger an out-of-band resync to catch up on state immediately.
          onResyncRef.current();
        }
        hasConnectedOnce.current = true;
      };

      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onEventRef.current(data);
        } catch (e) {
          console.error("[SSE Relay] Failed to parse message:", e);
        }
      };

      source.onerror = () => {
        // The browser will automatically try to reconnect. 
        // We let the native EventSource handle the backoff reconnects.
        // Once it succeeds, onopen will fire again and trigger onResync.
        if (source.readyState === EventSource.CLOSED) {
          console.warn("[SSE Relay] Connection closed.");
        } else {
          console.warn("[SSE Relay] Connection error, reconnecting...");
        }
      };
    }

    connect();

    return () => {
      isMounted.current = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [roomId, enabled]); // Reconnect when roomId or enabled state changes
}
