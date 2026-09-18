import { useEffect, useRef } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import { WeatherMarker } from './WeatherMarker';
import { decodePolyline } from '../utils/polyline';

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

export function RouteMap({ waypoints, overviewPolyline, bounds }) {
  // Convert bounds to the LatLngBoundsLiteral shape Map expects.
  const defaultBounds = bounds
    ? {
        north: bounds.northeast.lat,
        south: bounds.southwest.lat,
        east: bounds.northeast.lng,
        west: bounds.southwest.lng,
      }
    : undefined;

  return (
    // Keyed on overviewPolyline so a new route remounts the Map and applies
    // the new defaultBounds, avoiding useMap() timing races for fitBounds.
    <Map
      key={overviewPolyline || 'empty'}
      mapId="weathermapper-map"
      defaultBounds={defaultBounds}
      defaultCenter={{ lat: 39.5, lng: -98.35 }}
      defaultZoom={4}
      gestureHandling="greedy"
      disableDefaultUI={false}
      style={{ height: '100%', width: '100%' }}
    >
      {overviewPolyline && <RoutePolyline encoded={overviewPolyline} />}
      {waypoints.map((wp) => (
        <WeatherMarker key={wp.id} waypoint={wp} />
      ))}
    </Map>
  );
}
