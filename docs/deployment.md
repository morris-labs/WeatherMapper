# WeatherMapper — deployment

WeatherMapper runs as a **static site** on the same EC2 instance as
RouteMapper, served by nginx at `morrislabs.app/weathermapper/`. There is no
backend process or systemd service — nginx serves the Vite build output
directly.

## Architecture

```
Browser
  | HTTPS (morrislabs.app)
  v
nginx (TLS termination, existing cert from RouteMapper setup)
  |-- /weathermapper/   static files from /opt/weathermapper/client/dist
  |-- /routemapper/     RouteMapper (existing)
```

## One-time server setup

SSH to the EC2 instance, then run:

```bash
# Create the app directory and set ownership.
sudo mkdir -p /opt/weathermapper
sudo chown ec2-user:ec2-user /opt/weathermapper

# Do the first deploy manually (or run deploy.sh once SSH_KEY and EC2_HOST
# are set up).
git archive --format=tar HEAD | gzip | \
  ssh -i "$SSH_KEY" ec2-user@"$EC2_HOST" \
  "cat | tar -xzf - -C /opt/weathermapper"

# Install dependencies and build for the first time.
cd /opt/weathermapper/client
npm install
cp .env.example .env
# Edit .env: set VITE_GOOGLE_MAPS_BROWSER_KEY to the browser API key.
VITE_BASE_PATH=/weathermapper/ npm run build
```

### Add the nginx include

All locations for `morrislabs.app` live in one server block inside
`/etc/nginx/conf.d/routemapper.conf`. Add the WeatherMapper include
**inside** the `server { listen 443 ssl; ... }` block, after the last
RouteMapper location:

```nginx
    # WeatherMapper — static site, no backend process.
    include /opt/weathermapper/deploy/nginx/weathermapper.conf;
}
```

Then test and reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Deploying a change

```bash
SSH_KEY=~/.ssh/morrislabs.pem EC2_HOST=<ip> ./deploy/deploy.sh
```

The script packages tracked source with `git archive` (skips `node_modules`,
`.env`, `dist`), ships it, extracts it, rebuilds, and reloads nginx. The
`.env` on the instance is already in place and untouched by deploys.

## Google Maps API key referrer allowlist

The browser key must allow requests from `morrislabs.app/*`. This entry is
already in place from the RouteMapper setup. No additional entry is needed for
WeatherMapper because it lives under the same apex domain.

For local dev on any port, `localhost:*/*` covers all ports (added when
setting up WeatherMapper dev).

## Known issues from RouteMapper deployment (already handled here)

- **Trailing-slash redirect** — `location = /weathermapper { return 301
  /weathermapper/; }` is included in `weathermapper.conf` to prevent
  asset-path resolution failures.
- **Referrer wildcard vs. apex domain** — `morrislabs.app/*` (not just
  `*.morrislabs.app/*`) is required in the Google Cloud referrer allowlist.
  Already present from RouteMapper.
- **SSH username** — Amazon Linux 2023 uses `ec2-user`, not `ubuntu`.
