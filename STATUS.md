# WeatherMapper — session status

**Active plan:** plan-weathermapper.md
**Current state:** Shipped, clean, fully pushed to GitHub

## What exists

- **Live:** https://morrislabs.app/weathermapper/
- **GitHub:** https://github.com/morris-labs/WeatherMapper (gh CLI authenticated)
- **Working dir:** /home/prime/Bin/WeatherMapper
- **Git:** main branch, 23 commits, up to date with origin

## Infrastructure

- **EC2:** ec2-user@18.216.32.164
- **SSH key:** RouteMapper/morrislabs.app-certificates/routemapper-key.pem
- **Deploy:**
  ```
  SSH_KEY=/home/prime/Bin/WeatherMapper/RouteMapper/morrislabs.app-certificates/routemapper-key.pem \
  EC2_HOST=ec2-user@18.216.32.164 \
  bash deploy/deploy.sh
  ```
- **nginx:** WeatherMapper `location` blocks included inside RouteMapper's
  ssl server block at `/etc/nginx/conf.d/routemapper.conf` on EC2.
  The include line is already in place — deploys only rebuild assets and reload.

## Design system

SITE-DESIGN.md (repo root) is the spec for MorrisLabs brand tokens, fonts,
Header, and Footer. Header.jsx and Footer.jsx are implemented locally from it.

## Pending

- [ ] WaypointSidebar, WaypointCard, WeatherMarker, WeatherIcon are orphaned
      (sidebar removed in favour of map InfoWindow popups). Keep or delete TBD.
- [ ] SITE-DESIGN.md lives in this repo temporarily; it might belong in the
      morrislabs.app repo once that project is structured.

## Key docs

- docs/implementation.md — architecture, data flow, file structure
- docs/deployment.md     — server setup, deploy command, nginx config
- docs/troubleshooting.md — known issues and resolutions (detailed)
- README.md              — user-facing overview
