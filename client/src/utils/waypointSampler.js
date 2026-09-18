import { decodePolyline } from './polyline';

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

// Finds the polyline point index closest to `target`, searching from `fromIdx` forward.
// Searching forward ensures leg boundaries are found in route order.
function findClosestPolylineIndex(points, target, fromIdx) {
  let bestIdx = fromIdx;
  let bestDist = Infinity;
  for (let i = fromIdx; i < points.length; i++) {
    const dLat = points[i].lat - target.lat;
    const dLng = points[i].lng - target.lng;
    const d = dLat * dLat + dLng * dLng;
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  }
  return bestIdx;
}

// Interpolates a lat/lng position at `targetDist` along a polyline segment
// defined by cumulative chord distances `cumDist` and point array `pts`.
function samplePolylineAt(pts, cumDist, targetDist) {
  let k = 1;
  while (k < cumDist.length - 1 && cumDist[k] < targetDist) k++;
  const segLen = cumDist[k] - cumDist[k - 1];
  const frac = segLen > 0 ? (targetDist - cumDist[k - 1]) / segLen : 0;
  return {
    lat: pts[k - 1].lat + frac * (pts[k].lat - pts[k - 1].lat),
    lng: pts[k - 1].lng + frac * (pts[k].lng - pts[k - 1].lng),
  };
}

// Returns auto-sampled waypoints at every intervalMinutes along the route.
// Positions follow the actual road geometry from overviewPolyline.
// Waypoints at elapsed=0 and elapsed=total are skipped (those are entered stops).
export function sampleAutoWaypoints(legs, leaveTimeMs, intervalMinutes, overviewPolyline) {
  const intervalMs = intervalMinutes * 60 * 1000;
  const waypoints = [];
  let elapsedMs = 0;
  let nextMarkMs = intervalMs;
  let autoIdx = 0;

  if (!overviewPolyline) {
    // Fallback: straight-line interpolation between leg endpoints.
    for (const leg of legs) {
      const legMs = leg.durationSeconds * 1000;
      while (nextMarkMs < elapsedMs + legMs) {
        const frac = (nextMarkMs - elapsedMs) / legMs;
        waypoints.push({
          id: `auto-${autoIdx++}`,
          lat: leg.startLocation.lat + frac * (leg.endLocation.lat - leg.startLocation.lat),
          lng: leg.startLocation.lng + frac * (leg.endLocation.lng - leg.startLocation.lng),
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

  const points = decodePolyline(overviewPolyline);

  // Map each leg boundary to the closest polyline point, searching forward
  // from the previous boundary to preserve route order.
  const boundaryIndices = [0];
  for (const leg of legs) {
    const prev = boundaryIndices[boundaryIndices.length - 1];
    boundaryIndices.push(findClosestPolylineIndex(points, leg.endLocation, prev));
  }

  for (let li = 0; li < legs.length; li++) {
    const legMs = legs[li].durationSeconds * 1000;
    const seg = points.slice(boundaryIndices[li], boundaryIndices[li + 1] + 1);

    // Cumulative chord distances within this leg's polyline segment.
    const cumDist = [0];
    for (let k = 1; k < seg.length; k++) {
      const dLat = seg[k].lat - seg[k - 1].lat;
      const dLng = seg[k].lng - seg[k - 1].lng;
      cumDist.push(cumDist[k - 1] + Math.sqrt(dLat * dLat + dLng * dLng));
    }
    const totalChord = cumDist[cumDist.length - 1];

    while (nextMarkMs < elapsedMs + legMs) {
      const frac = (nextMarkMs - elapsedMs) / legMs;
      const pos = totalChord > 0
        ? samplePolylineAt(seg, cumDist, frac * totalChord)
        : { lat: seg[0].lat, lng: seg[0].lng };
      waypoints.push({
        id: `auto-${autoIdx++}`,
        lat: pos.lat,
        lng: pos.lng,
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
