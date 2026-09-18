import { useState, useEffect } from 'react';
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
  return d.toISOString().slice(0, 16);
}

function parseUrlParams() {
  const p = new URLSearchParams(location.search);
  const stopsRaw = p.get('stops');
  return {
    stops: stopsRaw ? stopsRaw.split('|') : null,
    leave: p.get('leave'),
    interval: p.get('interval') ? Number(p.get('interval')) : null,
  };
}

function buildShareUrl(stops, leaveTime, intervalMinutes) {
  const p = new URLSearchParams({
    stops: stops.filter(Boolean).join('|'),
    leave: leaveTime,
    interval: String(intervalMinutes),
  });
  return `${location.origin}${location.pathname}?${p}`;
}

// Shared route controls rendered in the sidebar (desktop) and Plan tab (mobile).
function RouteForm({ stops, setStops, leaveTime, setLeaveTime, intervalMinutes, setIntervalMinutes, onSubmit, isLoading, hasRoute, error, onShare, copied }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 p-4">
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

      {hasRoute && (
        <button
          type="button"
          onClick={onShare}
          className="rounded border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {copied ? '✓ Copied!' : 'Copy share link'}
        </button>
      )}

      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
    </form>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
      <div className="rounded-lg bg-white px-6 py-4 shadow-lg text-sm text-gray-700">
        Fetching route and weather...
      </div>
    </div>
  );
}

export default function App() {
  const urlState = parseUrlParams();

  const [stops, setStops] = useState(urlState.stops ?? ['', '']);
  const [leaveTime, setLeaveTime] = useState(urlState.leave ?? defaultLeaveTime());
  const [intervalMinutes, setIntervalMinutes] = useState(urlState.interval ?? 60);
  const [activeTab, setActiveTab] = useState('form');
  const [copied, setCopied] = useState(false);

  const { status, waypoints, overviewPolyline, bounds, error, calculate } = useWeatherRoute();

  // Auto-calculate when the page loads with shared URL params.
  useEffect(() => {
    const { stops: s, leave: l, interval: i } = urlState;
    if (s && s.length >= 2) {
      calculate({ addresses: s, leaveTime: l ?? defaultLeaveTime(), intervalMinutes: i ?? 60 });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Switch to the map tab on mobile after a successful calculation.
  useEffect(() => {
    if (status === 'success') setActiveTab('map');
  }, [status]);

  function handleSubmit(e) {
    e.preventDefault();
    const filled = stops.map((s) => s.trim()).filter(Boolean);
    if (filled.length < 2) return;
    calculate({ addresses: filled, leaveTime, intervalMinutes });
  }

  async function handleShare() {
    const url = buildShareUrl(stops, leaveTime, intervalMinutes);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isLoading = status === 'loading';
  const hasRoute = waypoints.length > 0;

  const formProps = {
    stops, setStops, leaveTime, setLeaveTime, intervalMinutes, setIntervalMinutes,
    onSubmit: handleSubmit, isLoading, hasRoute, error, onShare: handleShare, copied,
  };

  return (
    <APIProvider apiKey={API_KEY}>

      {/* ── Desktop layout (md+) ───────────────────────────────────── */}
      <div className="hidden md:flex h-screen overflow-hidden bg-gray-100">
        <aside className="flex w-80 flex-shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white">
          <header className="flex-shrink-0 border-b border-gray-200 px-4 py-3">
            <h1 className="text-base font-semibold text-gray-900">WeatherMapper</h1>
            <p className="text-xs text-gray-500">See the weather where you'll be, when you'll be there.</p>
          </header>

          <div className="flex-shrink-0 overflow-y-auto">
            <RouteForm {...formProps} />
          </div>

          {hasRoute && (
            <div className="flex-1 min-h-0 overflow-hidden border-t border-gray-200">
              <WaypointSidebar waypoints={waypoints} />
            </div>
          )}
        </aside>

        <main className="relative flex-1 overflow-hidden">
          {isLoading && <LoadingOverlay />}
          <RouteMap waypoints={waypoints} overviewPolyline={overviewPolyline} bounds={bounds} />
        </main>
      </div>

      {/* ── Mobile layout (<md) ────────────────────────────────────── */}
      <div className="flex md:hidden h-screen flex-col overflow-hidden bg-white">
        <header className="flex-shrink-0 border-b border-gray-200 px-4 py-3">
          <h1 className="text-base font-semibold text-gray-900">WeatherMapper</h1>
          <p className="text-xs text-gray-500">See the weather where you'll be, when you'll be there.</p>
        </header>

        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === 'form' && (
            <div className="h-full overflow-y-auto">
              <RouteForm {...formProps} />
            </div>
          )}

          {activeTab === 'map' && (
            <div className="relative h-full">
              {isLoading && <LoadingOverlay />}
              <RouteMap waypoints={waypoints} overviewPolyline={overviewPolyline} bounds={bounds} />
            </div>
          )}

          {activeTab === 'weather' && (
            <div className="h-full overflow-hidden">
              {hasRoute
                ? <WaypointSidebar waypoints={waypoints} />
                : <p className="p-6 text-sm text-gray-500 text-center">Calculate a route to see weather details.</p>
              }
            </div>
          )}
        </div>

        {/* Bottom tab bar */}
        <nav className="flex-shrink-0 border-t border-gray-200 bg-white safe-area-bottom">
          {[
            { id: 'form', label: 'Plan', emoji: '📍' },
            { id: 'map',  label: 'Map',  emoji: '🗺️' },
            { id: 'weather', label: 'Weather', emoji: '⛅' },
          ].map(({ id, label, emoji }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              disabled={id !== 'form' && !hasRoute && !isLoading}
              className={[
                'inline-flex w-1/3 flex-col items-center gap-0.5 py-3 text-xs transition-colors',
                activeTab === id ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700',
                'disabled:opacity-30',
              ].join(' ')}
            >
              <span className="text-lg leading-none">{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

    </APIProvider>
  );
}
