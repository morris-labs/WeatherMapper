# WeatherMapper

**Live app:** https://morrislabs.app/weathermapper/

WeatherMapper plots a driving route and shows the weather forecast at each
point along the way — not at departure time, but at the estimated time
you'll actually be there. Enter your stops and leave time, and the app
offsets each waypoint's weather lookup by the cumulative drive time to
that point.

## Features

- Enter 2-25 stops with autocomplete powered by the RouteMapper API.
- Set a departure time and a waypoint interval (every 5, 15, 30, 60, 90,
  or 120 minutes).
- Auto-sampled waypoints follow the actual road geometry (decoded from the
  route's encoded polyline), not straight lines between endpoints.
- Weather data comes from [Open-Meteo](https://open-meteo.com/) — free,
  no API key required.
- Tap or hover any map marker to see a popup with temperature, feels-like,
  humidity, precipitation chance, and wind speed and direction.
- Copy a share link that encodes all stops, the leave time, and the
  interval in the URL. Anyone who opens the link gets the same route
  recalculated.
- Responsive layout: desktop shows a sidebar and map side by side; mobile
  uses a two-tab bottom nav (Plan and Map).

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18, Vite |
| Styling | Tailwind CSS, MorrisLabs design tokens |
| Maps | Google Maps JS API via `@vis.gl/react-google-maps` |
| Routing | [RouteMapper API](https://morrislabs.app/routemapper/) (CORS-open) |
| Weather | [Open-Meteo](https://open-meteo.com/) hourly forecast API |
| Hosting | nginx static site on EC2, served at `/weathermapper/` |

The app is client-only — no backend server or database.

## Local development

**Prerequisites:** Node.js 18+, a Google Maps browser API key.

1. Clone the repository:

   ```bash
   git clone https://github.com/morris-labs/WeatherMapper.git
   cd WeatherMapper
   ```

2. Install dependencies:

   ```bash
   cd client
   npm install
   ```

3. Create the `client/.env` file:

   ```bash
   cp .env.example .env
   ```

   Open `client/.env` and set `VITE_GOOGLE_MAPS_BROWSER_KEY` to your
   [Maps JavaScript API key](https://console.cloud.google.com/). Add
   `localhost:*/*` to the key's HTTP referrer allowlist.

4. Start the dev server:

   ```bash
   npm run dev
   ```

   The app is available at `http://localhost:5173`.

## Deployment

WeatherMapper runs as a static site on the same EC2 instance as
RouteMapper. For full setup and deploy instructions, see
[`docs/deployment.md`](docs/deployment.md).

To deploy a change after the one-time server setup is complete:

```bash
SSH_KEY=PATH_TO_KEY EC2_HOST=USER@HOST ./deploy/deploy.sh
```

Replace the following:

- `PATH_TO_KEY`: path to the EC2 key pair PEM file
- `USER@HOST`: EC2 username and hostname or Elastic IP

The script archives tracked source with `git archive`, ships it to the
instance, rebuilds the Vite bundle with the production base path, and
reloads nginx.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_GOOGLE_MAPS_BROWSER_KEY` | Yes | Maps JavaScript API key, HTTP-referrer restricted |

## Project structure

```
client/
  src/
    App.jsx                 — layout and URL state (shareable links)
    components/
      Header.jsx            — MorrisLabs sticky header with Apps dropdown
      Footer.jsx            — MorrisLabs copyright footer
      AddressInput.jsx      — autocomplete input with portaled dropdown
      StopList.jsx          — 2-25 stop inputs with add and remove
      LeaveTimePicker.jsx   — departure date and time input
      IntervalSelector.jsx  — waypoint interval selector
      RouteMap.jsx          — map, route polyline, marker pills, InfoWindow popups
    hooks/
      useWeatherRoute.js    — orchestrates route and weather fetches
    utils/
      polyline.js           — Google encoded polyline decoder
      waypointSampler.js    — road-accurate waypoint sampling
      openMeteo.js          — Open-Meteo fetch and closest-hour picker
      weatherCodes.js       — WMO weather code to emoji and label map
deploy/
  deploy.sh                 — EC2 deploy script
  nginx/weathermapper.conf  — nginx location blocks
docs/
  deployment.md             — server setup and deploy reference
  implementation.md         — architecture and data flow notes
  troubleshooting.md        — known issues and resolutions
```

## Related projects

- [RouteMapper](https://morrislabs.app/routemapper/) — the routing app
  whose API WeatherMapper uses for geocoding, autocomplete, and route legs.
- [morrislabs.app](https://morrislabs.app/) — home page for both apps.

## License

MIT
