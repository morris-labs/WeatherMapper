import { useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { StopList } from './components/StopList';
import { LeaveTimePicker } from './components/LeaveTimePicker';
import { IntervalSelector } from './components/IntervalSelector';
import { RouteMap } from './components/RouteMap';
import { WaypointSidebar } from './components/WaypointSidebar';
import { useWeatherRoute } from './hooks/useWeatherRoute';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY;

function defaultLeaveTime() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  // datetime-local value format: YYYY-MM-DDTHH:MM
  return d.toISOString().slice(0, 16);
}

export default function App() {
  const [stops, setStops] = useState(['', '']);
  const [leaveTime, setLeaveTime] = useState(defaultLeaveTime);
  const [intervalMinutes, setIntervalMinutes] = useState(60);

  const { status, waypoints, overviewPolyline, bounds, error, calculate } = useWeatherRoute();

  function handleSubmit(e) {
    e.preventDefault();
    const filled = stops.map((s) => s.trim()).filter(Boolean);
    if (filled.length < 2) return;
    calculate({ addresses: filled, leaveTime, intervalMinutes });
  }

  const isLoading = status === 'loading';

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="flex h-screen overflow-hidden bg-gray-100">
        {/* Left panel */}
        <aside className="flex w-80 flex-shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white">
          <header className="border-b border-gray-200 px-4 py-3">
            <h1 className="text-base font-semibold text-gray-900">WeatherMapper</h1>
            <p className="text-xs text-gray-500">See the weather where you'll be, when you'll be there.</p>
          </header>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto p-4">
            <StopList stops={stops} onChange={setStops} />
            <LeaveTimePicker value={leaveTime} onChange={setLeaveTime} />
            <IntervalSelector value={intervalMinutes} onChange={setIntervalMinutes} />

            <button
              type="submit"
              disabled={isLoading || stops.filter(Boolean).length < 2}
              className="rounded bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Calculating...' : 'Calculate route'}
            </button>

            {status === 'error' && (
              <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
          </form>

          {waypoints.length > 0 && (
            <div className="flex-1 overflow-hidden border-t border-gray-200">
              <WaypointSidebar waypoints={waypoints} />
            </div>
          )}
        </aside>

        {/* Map */}
        <main className="relative flex-1 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <div className="rounded-lg bg-white px-6 py-4 shadow-lg text-sm text-gray-700">
                Fetching route and weather...
              </div>
            </div>
          )}
          <RouteMap
            waypoints={waypoints}
            overviewPolyline={overviewPolyline}
            bounds={bounds}
          />
        </main>
      </div>
    </APIProvider>
  );
}
