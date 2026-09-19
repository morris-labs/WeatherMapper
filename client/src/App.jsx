import { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { StopList } from './components/StopList';
import { LeaveTimePicker } from './components/LeaveTimePicker';
import { IntervalSelector } from './components/IntervalSelector';
import { RouteMap } from './components/RouteMap';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
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

function RouteForm({ stops, setStops, leaveTime, setLeaveTime, intervalMinutes, setIntervalMinutes, onSubmit, isLoading, hasRoute, error, onShare, copied }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 p-4">
      <StopList stops={stops} onChange={setStops} />
      <LeaveTimePicker value={leaveTime} onChange={setLeaveTime} />
      <IntervalSelector value={intervalMinutes} onChange={setIntervalMinutes} />

      <button
        type="submit"
        disabled={isLoading || stops.filter(Boolean).length < 2}
        style={{ backgroundColor: 'var(--ml-accent-fg)', color: '#fff', fontFamily: "'DM Sans', system-ui, sans-serif" }}
        className="rounded py-2 text-sm font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition-opacity"
      >
        {isLoading ? 'Calculating...' : 'Calculate route'}
      </button>

      {hasRoute && (
        <button
          type="button"
          onClick={onShare}
          style={{ borderColor: 'var(--ml-border)', color: 'var(--ml-muted)', fontFamily: "'DM Sans', system-ui, sans-serif" }}
          className="rounded border py-2 text-sm hover:opacity-80 transition-opacity"
        >
          {copied ? '✓ Copied!' : 'Copy share link'}
        </button>
      )}

      {error && (
        <p className="rounded px-3 py-2 text-sm" style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}>{error}</p>
      )}
    </form>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.65)' }}>
      <div className="rounded-lg px-6 py-4 shadow-lg text-sm" style={{ backgroundColor: 'var(--ml-surface)', color: 'var(--ml-ink)' }}>
        Fetching route and weather…
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

  useEffect(() => {
    const { stops: s, leave: l, interval: i } = urlState;
    if (s && s.length >= 2) {
      calculate({ addresses: s, leaveTime: l ?? defaultLeaveTime(), intervalMinutes: i ?? 60 });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="flex flex-col" style={{ height: '100dvh', minHeight: '100dvh' }}>

        <Header currentApp="weathermapper" />

        {/* ── Desktop layout (md+) ───────────────────────────────────── */}
        <div className="hidden md:flex flex-1 min-h-0 overflow-hidden">
          <aside
            className="flex flex-col w-80 flex-shrink-0 overflow-hidden"
            style={{ borderRight: '1px solid var(--ml-border)', backgroundColor: 'var(--ml-surface)' }}
          >
            <div className="flex-1 min-h-0 overflow-y-auto">
              <RouteForm {...formProps} />
            </div>
            <Footer />
          </aside>

          <main className="relative flex-1 overflow-hidden">
            {isLoading && <LoadingOverlay />}
            <RouteMap waypoints={waypoints} overviewPolyline={overviewPolyline} bounds={bounds} />
          </main>
        </div>

        {/* ── Mobile layout (<md) ────────────────────────────────────── */}
        <div className="flex md:hidden flex-1 min-h-0 flex-col overflow-hidden">

          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTab === 'form' && (
              <div className="h-full overflow-y-auto flex flex-col" style={{ backgroundColor: 'var(--ml-surface)' }}>
                <div className="flex-1">
                  <RouteForm {...formProps} />
                </div>
                <Footer />
              </div>
            )}

            {activeTab === 'map' && (
              <div className="relative h-full">
                {isLoading && <LoadingOverlay />}
                <RouteMap waypoints={waypoints} overviewPolyline={overviewPolyline} bounds={bounds} />
              </div>
            )}
          </div>

          {/* Bottom tab bar */}
          <nav
            className="flex-shrink-0 safe-area-bottom"
            style={{ borderTop: '1px solid var(--ml-border)', backgroundColor: 'var(--ml-surface)' }}
          >
            {[
              { id: 'form', label: 'Plan', emoji: '📍' },
              { id: 'map',  label: 'Map',  emoji: '🗺️' },
            ].map(({ id, label, emoji }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                disabled={id !== 'form' && !hasRoute && !isLoading}
                className="inline-flex w-1/2 flex-col items-center gap-0.5 py-3 text-xs transition-colors disabled:opacity-30"
                style={{
                  color: activeTab === id ? 'var(--ml-accent-fg)' : 'var(--ml-muted)',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: activeTab === id ? 600 : 400,
                }}
              >
                <span className="text-lg leading-none">{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

      </div>
    </APIProvider>
  );
}
