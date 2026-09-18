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

### Map markers overlap at the start of a long route
**Symptom:** Departure marker and first auto waypoint sit on top of each other.
**Cause:** First auto waypoint is placed at `intervalMinutes` from departure, which may be physically close if the route starts slowly (city traffic).
**Status:** Acceptable — the interval is time-based, not distance-based.
