/**
 * Utility to push events to the Mentatry SSE Relay
 */

export async function pushToRelay(roomId: string, payload: any) {
  const relayUrl = process.env.RELAY_INGEST_URL;
  const secret = process.env.INGEST_SECRET;

  if (!relayUrl || !secret) {
    // If not configured, just return silently. This means the SSE relay is disabled
    // and clients will rely purely on the polling fallback.
    return false;
  }

  try {
    const response = await fetch(`${relayUrl}/${roomId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secret}`,
      },
      // Short timeout to prevent the server action from hanging if the relay is slow or down
      signal: AbortSignal.timeout(2000), 
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[SSE Relay] Failed to push event. Status: ${response.status}`);
      return false;
    }
    
    return true;
  } catch (error) {
    // Catch-all fail-open behavior. If the relay is unreachable, down, or times out,
    // we log the warning and return gracefully so the main action still succeeds.
    console.warn("[SSE Relay] Connection failed. Clients will use polling fallback.", error);
    return false;
  }
}
