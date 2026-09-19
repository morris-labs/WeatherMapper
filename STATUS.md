# WeatherMapper — session status

**Active plan:** plan-weathermapper.md
**Current state:** Deployed and working

## Done

- Vite + React 18 + Tailwind CSS client scaffold
- RouteMapper API integration (route, autocomplete)
- Open-Meteo weather fetch (temp, feels-like, precip, wind, humidity)
- Waypoint sampling: entered stops + auto waypoints at configurable intervals
  (5/15/30/60/90/120 min) along the actual road polyline (not straight-line)
- Google Maps with route polyline (imperative Polyline API)
- Weather marker pills on map (emoji + temp); hover/tap opens styled InfoWindow
  popup with all weather fields including humidity and compass wind direction
- MorrisLabs design system: --ml-* tokens, Syne/DM Sans/Space Mono fonts,
  shared Header (with Apps dropdown) and Footer components
- Mobile layout: two-tab bottom nav (Plan / Map), auto-switches to Map on
  successful calculation; desktop: fixed sidebar + map
- Shareable link: "Copy share link" encodes stops/leave/interval in query
  string; page auto-populates and recalculates on load
- EC2 deploy: static build served by nginx at morrislabs.app/weathermapper/
- GitHub: pending push (need remote URL)

## Pending

- [ ] Push to GitHub (no remote set yet — need repo URL)
- [ ] WaypointSidebar, WaypointCard, WeatherMarker, WeatherIcon components are
      orphaned (sidebar removed in favour of map popups). Keep or delete TBD.

## No active blockers
