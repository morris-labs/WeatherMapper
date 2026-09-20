# Resume — WeatherMapper

Start here to pick up where the previous session left off.

## First things to read

1. **`STATUS.md`** — current state, infrastructure, pending decisions.
2. **`README.md`** — user-facing project overview and local dev setup.
3. **`docs/implementation.md`** — architecture, data flow, and component inventory.
4. **`docs/deployment.md`** — server setup, deploy command, nginx config.
5. **`SITE-DESIGN.md`** (repo root) — MorrisLabs brand tokens and component specs.

## Orientation

- **Live app:** https://morrislabs.app/weathermapper/
- **GitHub:** https://github.com/morris-labs/WeatherMapper
- **Working dir:** `/home/prime/Bin/WeatherMapper`
- **EC2:** `ec2-user@18.216.32.164`
- **SSH key:** `RouteMapper/morrislabs.app-certificates/routemapper-key.pem`
  (gitignored; lives on disk at the path above)

## Credentials

- **GitHub:** `gh` CLI v2.101.0 is installed and authenticated as `morris-labs`
  via credential helper. Plain `git push` works.
- **GitHub token:** stored in `/home/prime/Bin/WeatherMapper/github.env`
  (gitignored via `*.env`).
- **Google Maps key:** in `client/.env` (gitignored). The `.env.example` file
  shows the required variable name.

## Deploy

```
SSH_KEY=/home/prime/Bin/WeatherMapper/RouteMapper/morrislabs.app-certificates/routemapper-key.pem \
EC2_HOST=ec2-user@18.216.32.164 \
bash deploy/deploy.sh
```

The script archives local source, ships it to EC2, rebuilds the Vite bundle,
and reloads nginx.

## Pending items (from STATUS.md)

- `WaypointSidebar.jsx`, `WaypointCard.jsx`, `WeatherMarker.jsx`,
  `WeatherIcon.jsx` are orphaned — the sidebar was replaced by map InfoWindow
  popups in `RouteMap.jsx`. Delete or repurpose TBD.
- `SITE-DESIGN.md` lives in this repo temporarily. It may belong in the
  `morrislabs.app` repo long-term.

## Key design decisions already made

- Classic `google.maps.Marker` (not `AdvancedMarker`) — AdvancedMarker requires
  a registered Cloud Map ID; without one markers render in document flow.
- A single shared `google.maps.InfoWindow` instance is reused across all
  markers. InfoWindow content is raw HTML with inline styles only — CSS custom
  properties (`--ml-*`) don't reach the Maps DOM.
- Auto waypoints follow road geometry via `overviewPolyline` decoding
  (`utils/waypointSampler.js`). Straight-line interpolation produced off-road
  markers on routes where start and end share a similar latitude.
- URL state (`?stops=A|B&leave=...&interval=N`) powers shareable links.
  `parseUrlParams()` / `buildShareUrl()` live in `App.jsx`.
- Mobile layout: two tabs (Plan, Map) with a bottom nav. Desktop: sidebar
  plus map side by side.
