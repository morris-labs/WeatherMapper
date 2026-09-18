import { useEffect, useRef } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import { getWeatherInfo } from '../utils/weatherCodes';
import { decodePolyline } from '../utils/polyline';

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

  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    waypoints.forEach((wp) => {
      const isEntered = wp.type === 'entered';
      const info = wp.weather ? getWeatherInfo(wp.weather.weatherCode) : null;
      const temp = wp.weather ? `${wp.weather.temperature}°` : '';
      const title = [
        wp.label || '',
        info ? `${info.label} · ${temp}` : '',
      ].filter(Boolean).join(' — ');

      const marker = new window.google.maps.Marker({
        position: { lat: wp.lat, lng: wp.lng },
        map,
        icon: makeMarkerIcon(wp.weather, isEntered),
        title,
        zIndex: isEntered ? 10 : 1,
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
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
