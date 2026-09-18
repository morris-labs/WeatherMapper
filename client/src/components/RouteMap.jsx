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

function FitBounds({ bounds }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !bounds) return;
    const gmBounds = new window.google.maps.LatLngBounds(
      { lat: bounds.southwest.lat, lng: bounds.southwest.lng },
      { lat: bounds.northeast.lat, lng: bounds.northeast.lng }
    );
    map.fitBounds(gmBounds, 60);
  }, [map, bounds]);

  return null;
}

export function RouteMap({ waypoints, overviewPolyline, bounds }) {
  return (
    <Map
      mapId="weathermapper-map"
      defaultCenter={{ lat: 39.5, lng: -98.35 }}
      defaultZoom={4}
      gestureHandling="greedy"
      disableDefaultUI={false}
      style={{ height: '100%', width: '100%' }}
    >
      {overviewPolyline && <RoutePolyline encoded={overviewPolyline} />}
      {bounds && <FitBounds bounds={bounds} />}
      {waypoints.map((wp) => (
        <WeatherMarker key={wp.id} waypoint={wp} />
      ))}
    </Map>
  );
}
