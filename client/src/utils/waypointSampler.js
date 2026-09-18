export function formatElapsed(ms) {
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `+${m}m`;
  if (m === 0) return `+${h}h`;
  return `+${h}h ${m}m`;
}

// Returns waypoints for each entered stop (leg endpoints).
export function buildEnteredStops(legs, leaveTimeMs) {
  const stops = [];
  let elapsedMs = 0;

  for (let i = 0; i < legs.length; i++) {
    stops.push({
      id: `stop-${i}`,
      lat: legs[i].startLocation.lat,
      lng: legs[i].startLocation.lng,
      arrivalTimeMs: leaveTimeMs + elapsedMs,
      elapsedMs,
      type: 'entered',
      label: legs[i].startAddress,
    });
    elapsedMs += legs[i].durationSeconds * 1000;
  }

  const last = legs[legs.length - 1];
  stops.push({
    id: `stop-${legs.length}`,
    lat: last.endLocation.lat,
    lng: last.endLocation.lng,
    arrivalTimeMs: leaveTimeMs + elapsedMs,
    elapsedMs,
    type: 'entered',
    label: last.endAddress,
  });

  return stops;
}

// Returns auto-sampled waypoints at every intervalMinutes along the route.
// Waypoints at elapsed=0 and elapsed=total are skipped (those are entered stops).
export function sampleAutoWaypoints(legs, leaveTimeMs, intervalMinutes) {
  const intervalMs = intervalMinutes * 60 * 1000;
  const waypoints = [];
  let elapsedMs = 0;
  let nextMarkMs = intervalMs;
  let autoIdx = 0;

  for (const leg of legs) {
    const legMs = leg.durationSeconds * 1000;

    while (nextMarkMs < elapsedMs + legMs) {
      const frac = (nextMarkMs - elapsedMs) / legMs;
      const lat = leg.startLocation.lat + frac * (leg.endLocation.lat - leg.startLocation.lat);
      const lng = leg.startLocation.lng + frac * (leg.endLocation.lng - leg.startLocation.lng);
      waypoints.push({
        id: `auto-${autoIdx++}`,
        lat,
        lng,
        arrivalTimeMs: leaveTimeMs + nextMarkMs,
        elapsedMs: nextMarkMs,
        type: 'auto',
        label: null,
      });
      nextMarkMs += intervalMs;
    }

    elapsedMs += legMs;
  }

  return waypoints;
}

// Merges entered stops and auto waypoints into a single time-sorted list.
export function mergeWaypoints(entered, auto) {
  return [...entered, ...auto].sort((a, b) => a.elapsedMs - b.elapsedMs);
}
