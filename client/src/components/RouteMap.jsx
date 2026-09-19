import { useEffect, useRef } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import { getWeatherInfo } from '../utils/weatherCodes';
import { decodePolyline } from '../utils/polyline';
import { formatElapsed } from '../utils/waypointSampler';

const COMPASS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
function toCompass(deg) { return COMPASS[Math.round(deg / 22.5) % 16]; }

function formatArrival(ms) {
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function makeMarkerIcon(weather, isEntered) {
  const info = weather ? getWeatherInfo(weather.weatherCode) : null;
  const emoji = info ? info.emoji : '';
  const temp = weather ? `${weather.temperature}°` : '?';
  const label = emoji ? `${emoji} ${temp}` : temp;

  const w = isEntered ? 56 : 44;
  const h = isEntered ? 22 : 18;
  const fill = isEntered ? '#2563eb' : '#ffffff';
  const textColor = isEntered ? '#ffffff' : '#374151';
  const stroke = isEntered ? '#1d4ed8' : '#9ca3af';
  const sw = isEntered ? 1.5 : 1;
  const fs = isEntered ? 11 : 9;
  const fw = isEntered ? 700 : 400;
  const ty = h - 5;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${(h - 2) / 2}" ` +
    `fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>` +
    `<text x="${w / 2}" y="${ty}" font-size="${fs}" ` +
    `font-family="system-ui,-apple-system,sans-serif" font-weight="${fw}" ` +
    `fill="${textColor}" text-anchor="middle">${label}</text>` +
    `</svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(w, h),
    anchor: new window.google.maps.Point(w / 2, h / 2),
  };
}

function makePopupContent(wp) {
  const info = wp.weather ? getWeatherInfo(wp.weather.weatherCode) : null;
  const w = wp.weather;

  const row = (icon, label, value) =>
    `<tr>
       <td style="padding:3px 10px 3px 0;color:#6b7280;white-space:nowrap;">${icon} ${label}</td>
       <td style="padding:3px 0;font-weight:500;color:#111827;">${value}</td>
     </tr>`;

  const rows = w ? [
    row('🌡️', 'Temp', `${w.temperature}°F (feels ${w.feelsLike}°F)`),
    row('💧', 'Humidity', w.humidity != null ? `${w.humidity}%` : '—'),
    row('🌧️', 'Precip chance', `${w.precipChance}%`),
    row('💨', 'Wind', `${w.windSpeed} mph ${w.windDir != null ? toCompass(w.windDir) : ''}`),
  ].join('') : '<tr><td colspan="2" style="color:#9ca3af;">Weather unavailable</td></tr>';

  const header = wp.label
    ? `<div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#111827;">${wp.label}</div>`
    : '';

  const condition = info
    ? `<div style="font-size:20px;margin-bottom:8px;">${info.emoji} <span style="font-size:13px;font-weight:600;color:#374151;vertical-align:middle;">${info.label}</span></div>`
    : '';

  const timeStr = [
    `<span style="font-weight:500;">${formatArrival(wp.arrivalTimeMs)}</span>`,
    `<span style="color:#9ca3af;margin-left:6px;">${formatElapsed(wp.elapsedMs)} from start</span>`,
  ].join('');

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;min-width:210px;padding:2px 0;">
      ${header}
      ${condition}
      <table style="border-collapse:collapse;font-size:12px;width:100%;">${rows}</table>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;font-size:11px;">${timeStr}</div>
    </div>`;
}

function RoutePolyline({ encoded }) {
  const map = useMap();
  const polyRef = useRef(null);

  useEffect(() => {
    if (!map || !encoded) return;

    const path = decodePolyline(encoded);
    if (polyRef.current) polyRef.current.setMap(null);

    polyRef.current = new window.google.maps.Polyline({
      path,
      map,
      strokeColor: '#2563eb',
      strokeWeight: 4,
      strokeOpacity: 0.8,
    });

    return () => {
      if (polyRef.current) polyRef.current.setMap(null);
    };
  }, [map, encoded]);

  return null;
}

function RouteMarkers({ waypoints }) {
  const map = useMap();
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    infoWindowRef.current ??= new window.google.maps.InfoWindow({ pixelOffset: new window.google.maps.Size(0, -4) });

    waypoints.forEach((wp) => {
      const isEntered = wp.type === 'entered';
      const marker = new window.google.maps.Marker({
        position: { lat: wp.lat, lng: wp.lng },
        map,
        icon: makeMarkerIcon(wp.weather, isEntered),
        title: wp.label || '',
        zIndex: isEntered ? 10 : 1,
      });

      function openPopup() {
        infoWindowRef.current.setContent(makePopupContent(wp));
        infoWindowRef.current.open({ map, anchor: marker });
      }

      marker.addListener('mouseover', openPopup);
      marker.addListener('click', openPopup);
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      infoWindowRef.current?.close();
    };
  }, [map, waypoints]);

  return null;
}

export function RouteMap({ waypoints, overviewPolyline, bounds }) {
  const defaultBounds = bounds
    ? {
        north: bounds.northeast.lat,
        south: bounds.southwest.lat,
        east: bounds.northeast.lng,
        west: bounds.southwest.lng,
      }
    : undefined;

  return (
    <Map
      key={overviewPolyline || 'empty'}
      defaultBounds={defaultBounds}
      defaultCenter={{ lat: 39.5, lng: -98.35 }}
      defaultZoom={4}
      gestureHandling="greedy"
      disableDefaultUI={false}
      style={{ height: '100%', width: '100%' }}
    >
      {overviewPolyline && <RoutePolyline encoded={overviewPolyline} />}
      <RouteMarkers waypoints={waypoints} />
    </Map>
  );
}
