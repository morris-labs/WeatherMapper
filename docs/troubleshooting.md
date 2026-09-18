# WeatherMapper — troubleshooting log

## Known issues and resolutions

*(Entries added as issues are found and fixed during development.)*

---

## Code-review catches (pre-browser-test)

### Loading overlay escaped the map pane
**Symptom (theoretical):** The "Fetching route and weather..." overlay covered the whole screen including the sidebar.
**Cause:** `position: absolute; inset: 0` needs a `position: relative` ancestor. `<main>` was missing `relative`.
**Fix:** Added `relative` to `<main>` in `App.jsx`. Committed in `bacb5bb`.

### Weather date off by one near UTC midnight
**Symptom (theoretical):** Waypoints arriving late at night (in timezones behind UTC) returned wrong weather because the UTC date had already rolled to the next day while local date hadn't.
**Fix:** Fetch a two-day window (`start_date` = UTC arrival date, `end_date` = UTC arrival date + 1 day). The closest-hour picker still selects the right slot. Committed in `bacb5bb`.

---

### nginx include outside server block (first deploy)
**Symptom:** `nginx -t` failed with `"location" directive is not allowed here`.
**Cause:** WeatherMapper's `weathermapper.conf` contains bare `location` blocks. Dropping it in `/etc/nginx/conf.d/` as a standalone file makes nginx parse it at the http context level, where `location` is invalid. All locations for `morrislabs.app` must live inside the single ssl server block in `routemapper.conf`.
**Fix:** Wrote `routemapper.conf` directly with the WeatherMapper `include` inside the server block. Future deploys via `deploy.sh` only rebuild static assets and reload nginx -- the include line is already in place.

---

## Patterns to watch for

### Autocomplete dropdown clipped
**Symptom:** Dropdown suggestions are cut off at the sidebar edge.
**Cause:** `position: absolute` inside an `overflow-y: auto` ancestor.
**Fix:** Portal the `<ul>` to `document.body` with `position: fixed`, anchored via `getBoundingClientRect()`. Already applied in `AddressInput.jsx`.

### Open-Meteo returns null precipitation_probability
**Symptom:** Precip shows as `null%` on some waypoints.
**Cause:** Open-Meteo omits `precipitation_probability` values before model initialization time on the current day.
**Fix:** Null-coalesce to `0` in `openMeteo.js` (`?? 0`). Already applied.

### Weather missing on a waypoint card
**Symptom:** Card shows "Weather unavailable".
**Cause:** Open-Meteo fetch failed for that coordinate (rate limit, bad lat/lng, or network).
**Behavior:** Each waypoint's weather fetch is wrapped in a try/catch; failure degrades gracefully to `weather: null`. The route and other waypoints are unaffected.

### Map didn't zoom/pan to fit the route (first browser test)
**Symptom:** Markers showed in a rough horizontal line at the default US center zoom because the map never fitted to the route bounds.
**Cause:** `FitBounds` used `useMap()` + `useEffect([map, bounds])`, which has a subtle timing race — `map` resolves from context asynchronously and the effect sometimes fired before the instance was ready.
**Fix:** Removed `FitBounds` entirely. The `Map` component is now keyed on `overviewPolyline` so a new route forces a remount, and `defaultBounds` is passed so the fresh map loads already fitted to the route.

### Left panel controls unresponsive after route load (first browser test)
**Symptom:** Clicking form controls (add stop, change inputs, recalculate) had no effect after the waypoint list appeared.
**Cause:** The form had no `flex-shrink-0`, so the waypoint list's `flex-1` consumed all available height, collapsing the form to zero height and making its controls unclickable. The waypoint list itself also lacked a height anchor for its `overflow-y-auto` to work against.
**Fix:** Added `flex-shrink-0` to the form, `min-h-0` to the waypoint container, and `h-full` to `WaypointSidebar`'s root div.

### AdvancedMarker renders as floating DOM elements instead of map pins
**Symptom:** All weather markers appeared in a horizontal line at the top of the map container, not on the route.
**Cause:** `AdvancedMarkerElement` (and `@vis.gl/react-google-maps`'s `AdvancedMarker` wrapper) requires a map ID registered in Google Cloud Console. Without one, the marker DOM elements are appended to the map container but are not positioned on the map — they render in normal document flow, creating a row at the top.
**Fix:** Replaced `AdvancedMarker` entirely with imperative `google.maps.Marker` (classic API) created inside a `RouteMarkers` component that uses `useMap()` + `useEffect`, the same pattern used for the polyline. Classic `Marker` has no mapId requirement. SVG data-URI icons preserve the pill styling. Removed `mapId` from the `Map` component since it is no longer needed.

### Map markers overlap at the start of a long route
**Symptom:** Departure marker and first auto waypoint sit on top of each other.
**Cause:** First auto waypoint is placed at `intervalMinutes` from departure, which may be physically close if the route starts slowly (city traffic).
**Status:** Acceptable — the interval is time-based, not distance-based.
