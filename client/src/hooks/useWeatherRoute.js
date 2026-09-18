import { useState, useCallback } from 'react';
import { buildEnteredStops, sampleAutoWaypoints, mergeWaypoints } from '../utils/waypointSampler';
import { fetchWeatherAt } from '../utils/openMeteo';

const ROUTEMAPPER_API = 'https://morrislabs.app/routemapper/api';

export function useWeatherRoute() {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [waypoints, setWaypoints] = useState([]);
  const [overviewPolyline, setOverviewPolyline] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [error, setError] = useState(null);

  const calculate = useCallback(async ({ addresses, leaveTime, intervalMinutes }) => {
    setStatus('loading');
    setError(null);
    setWaypoints([]);
    setOverviewPolyline(null);

    try {
      const routeRes = await fetch(`${ROUTEMAPPER_API}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses, travelMode: 'driving' }),
      });

      if (!routeRes.ok) {
        const body = await routeRes.json().catch(() => ({}));
        throw new Error(body.error || `Route request failed (${routeRes.status})`);
      }

      const route = await routeRes.json();
      setOverviewPolyline(route.overviewPolyline);
      setBounds(route.bounds);

      const leaveTimeMs = new Date(leaveTime).getTime();
      const entered = buildEnteredStops(route.legs, leaveTimeMs);
      const auto = sampleAutoWaypoints(route.legs, leaveTimeMs, intervalMinutes);
      const merged = mergeWaypoints(entered, auto);

      // Fetch weather for all waypoints concurrently.
      const withWeather = await Promise.all(
        merged.map(async (wp) => {
          try {
            const weather = await fetchWeatherAt(wp.lat, wp.lng, wp.arrivalTimeMs);
            return { ...wp, weather };
          } catch {
            return { ...wp, weather: null };
          }
        })
      );

      setWaypoints(withWeather);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  return { status, waypoints, overviewPolyline, bounds, error, calculate };
}
