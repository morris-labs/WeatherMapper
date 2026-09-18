# WeatherMapper — implementation notes

## Architecture

Client-only Vite + React 18 + Tailwind CSS app. No backend server.

### External APIs (all browser-direct, all CORS-open or free-tier)

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
    → legs[]: { startLocation, endLocation, durationSeconds, startAddress, endAddress }
    → overviewPolyline (encoded)
    → bounds (for map fit)
  → buildEnteredStops()   — one waypoint per leg endpoint
  → sampleAutoWaypoints() — interpolated points at every N minutes along legs
  → merge + sort by elapsedMs
  → Promise.all(fetchWeatherAt()) — one Open-Meteo call per waypoint
  → render RouteMap + WaypointSidebar
```

### Waypoint sampling

Auto waypoints are interpolated **linearly between leg startLocation and endLocation**
proportional to elapsed time within the leg. This is an approximation — the actual
road may curve — but it is accurate enough for weather purposes since weather
does not change at sub-km resolution.

### Autocomplete dropdown

Portaled to `document.body` with `position: fixed`, anchored via
`getBoundingClientRect()` on the input element. This avoids clipping inside the
scrollable sidebar (`overflow-y-auto`). Session tokens rotate on each selection
to group keystrokes with the final pick for Google billing purposes.

### Weather time resolution

Open-Meteo returns hourly slots. The app picks the slot whose timestamp is
closest to the waypoint's computed arrival time. For drives within ±30 min of an
hour boundary this is accurate; for very long drives the weather forecast accuracy
itself is the larger uncertainty.

## File structure

```
client/src/
  App.jsx                    — layout: left panel (controls + waypoint list) + map
  components/
    AddressInput.jsx          — single autocomplete input with portaled dropdown
    StopList.jsx              — 2-25 stop inputs with add/remove
    LeaveTimePicker.jsx       — datetime-local input
    IntervalSelector.jsx      — 30/60/90/120 min dropdown
    RouteMap.jsx              — Google Map, polyline (imperative), weather markers
    WeatherMarker.jsx         — AdvancedMarker: emoji + temp pill
    WaypointCard.jsx          — full waypoint detail card
    WaypointSidebar.jsx       — scrollable list of WaypointCards
    WeatherIcon.jsx           — WMO code → emoji + label
  hooks/
    useWeatherRoute.js        — orchestrates all API calls, holds result state
  utils/
    polyline.js               — Google encoded polyline decoder (~30 lines)
    weatherCodes.js           — WMO code map + degreesToCompass()
    openMeteo.js              — Open-Meteo fetch + closest-hour picker
    waypointSampler.js        — buildEnteredStops(), sampleAutoWaypoints(), mergeWaypoints()
```

## Environment

```
VITE_GOOGLE_MAPS_BROWSER_KEY=   # HTTP-referrer restricted: localhost:5173/*, your prod domain
```

## Running locally

```bash
cd client
npm install
cp .env.example .env   # fill in VITE_GOOGLE_MAPS_BROWSER_KEY
npm run dev            # http://localhost:5173
```
