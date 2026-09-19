# WeatherMapper — implementation notes

## Architecture

Client-only Vite + React 18 + Tailwind CSS app. No backend server.
All API calls go browser-direct.

### External APIs

| API | Purpose | Auth |
|---|---|---|
| `https://morrislabs.app/routemapper/api/route` | Route legs, durations, polyline | None |
| `https://morrislabs.app/routemapper/api/autocomplete` | Address autocomplete | None (session token for billing grouping) |
| `https://api.open-meteo.com/v1/forecast` | Hourly weather forecasts | None |
| Google Maps JS API | Map tiles | `VITE_GOOGLE_MAPS_BROWSER_KEY` |

### Data flow

```
User input (stops + leave time + interval)
  → POST /routemapper/api/route
    → legs[]: { startLocation, endLocation, durationSeconds, steps[], ... }
    → overviewPolyline (encoded)
    → bounds (for map viewport fit)
  → buildEnteredStops()    — one waypoint per leg endpoint, timed by cumulative leg durations
  → sampleAutoWaypoints()  — road-accurate positions at every N minutes (see below)
  → mergeWaypoints()       — sort entered + auto by elapsedMs
  → Promise.all(fetchWeatherAt()) — one Open-Meteo call per waypoint, concurrent
  → render RouteMap (polyline + marker pills + InfoWindow popups)
```

### Waypoint sampling (`utils/waypointSampler.js`)

Auto waypoints follow the actual road geometry rather than straight lines
between leg endpoints. The algorithm:

1. Decode `overviewPolyline` to an array of lat/lng points.
2. For each leg, find the polyline point closest to `leg.endLocation`,
   searching forward from the previous leg's boundary to stay in route order.
3. Slice the polyline into per-leg segments.
4. Within each segment, compute cumulative chord distances.
5. At each time-interval mark, map elapsed-time fraction → chord-distance
   fraction and interpolate between the two surrounding polyline points.

This handles curved mountain routes correctly. Straight-line interpolation
between a leg's start/end produces a near-horizontal arc when start and end
share similar latitudes (as in southwest Virginia), placing markers off-road.

### Map markers and popups

Classic imperative `google.maps.Marker` (not `AdvancedMarker`, which requires
a registered Cloud Map ID). Each marker's icon is an SVG pill rendered as a
`data:image/svg+xml` URI.

A single shared `google.maps.InfoWindow` is reused across all markers. On
`mouseover` or `click`, the InfoWindow content is replaced with the hovered
waypoint's full weather detail and the window is opened anchored to that
marker. The native InfoWindow X button closes it.

### Shareable links

`buildShareUrl()` encodes stops, leave time, and interval minutes into query
params (`?stops=A|B|C&leave=...&interval=...`). On load, `parseUrlParams()`
reads these and a `useEffect` auto-triggers `calculate()` if at least two
stops are present.

### Autocomplete dropdown

Portaled to `document.body` with `position: fixed`, anchored via
`getBoundingClientRect()` on the input element, to avoid clipping inside
the scrollable sidebar. Session tokens rotate on each selection to group
keystrokes with the final pick for Google billing purposes.

### Weather time resolution

Open-Meteo returns hourly slots. The app fetches a two-day window (UTC
arrival date + next day) to handle routes that cross a UTC midnight, then
picks the slot whose timestamp is closest to the waypoint's arrival time.

### Open-Meteo fields fetched

`temperature_2m`, `apparent_temperature`, `precipitation_probability`,
`weathercode`, `windspeed_10m`, `winddirection_10m`, `relativehumidity_2m`

## Design system

MorrisLabs brand tokens (`--ml-*`) are defined in `index.css` with
`@media (prefers-color-scheme: dark)` and `[data-theme]` overrides.
The `Header` and `Footer` components are implemented locally from the
spec in `SITE-DESIGN.md`. Fonts: Syne (wordmark), DM Sans (body),
Space Mono (form labels).

## File structure

```
client/
  index.html                   — Google Fonts link, viewport-fit=cover
  .env.example                 — VITE_GOOGLE_MAPS_BROWSER_KEY placeholder
  src/
    App.jsx                    — layout: desktop sidebar+map / mobile 2-tab
    index.css                  — Tailwind + MorrisLabs tokens + ml-input/ml-label
    components/
      Header.jsx               — MorrisLabs sticky header with Apps dropdown
      Footer.jsx               — MorrisLabs copyright footer
      AddressInput.jsx         — single autocomplete input, portaled dropdown
      StopList.jsx             — 2-25 stop inputs with add/remove
      LeaveTimePicker.jsx      — datetime-local input
      IntervalSelector.jsx     — interval options (5/15/30/60/90/120 min)
      RouteMap.jsx             — Google Map, polyline, marker pills, InfoWindow popups
      WeatherMarker.jsx        — [unused] AdvancedMarker pill (sidebar era)
      WaypointCard.jsx         — [unused] full waypoint detail card (sidebar era)
      WaypointSidebar.jsx      — [unused] scrollable card list (sidebar era)
      WeatherIcon.jsx          — [unused] WMO code → emoji + label (sidebar era)
    hooks/
      useWeatherRoute.js       — orchestrates API calls, holds route+waypoint state
    utils/
      polyline.js              — Google encoded polyline decoder
      weatherCodes.js          — WMO code map: { emoji, label }
      openMeteo.js             — Open-Meteo fetch + closest-hour picker
      waypointSampler.js       — buildEnteredStops, sampleAutoWaypoints, mergeWaypoints
```

## Environment variables

```
VITE_GOOGLE_MAPS_BROWSER_KEY=   # HTTP-referrer restricted to localhost:*/* and morrislabs.app/*
```

## Running locally

```bash
cd client
npm install
cp .env.example .env   # fill in VITE_GOOGLE_MAPS_BROWSER_KEY
npm run dev            # http://localhost:5173
```
