import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { getWeatherInfo } from '../utils/weatherCodes';

export function WeatherMarker({ waypoint }) {
  const { lat, lng, weather, type } = waypoint;
  const isEntered = type === 'entered';

  const info = weather ? getWeatherInfo(weather.weatherCode) : null;
  const temp = weather ? `${weather.temperature}°` : '?';

  const title = [
    waypoint.label || '',
    weather ? `${info.label} · ${temp}` : '',
  ].filter(Boolean).join(' — ');

  if (isEntered) {
    return (
      <AdvancedMarker position={{ lat, lng }}>
        <div
          title={title}
          style={{ whiteSpace: 'nowrap' }}
          className="flex items-center gap-0.5 rounded-full border-2 border-blue-600 bg-blue-600 px-2 py-0.5 text-xs font-bold text-white shadow-md"
        >
          {info && <span>{info.emoji}</span>}
          <span>{temp}</span>
        </div>
      </AdvancedMarker>
    );
  }

  // Auto waypoints: compact dot with tooltip only — keeps map readable at
  // short intervals without hiding the weather data.
  return (
    <AdvancedMarker position={{ lat, lng }}>
      <div
        title={title}
        style={{ whiteSpace: 'nowrap' }}
        className="flex items-center gap-0.5 rounded-full border border-gray-400 bg-white px-1.5 py-px text-xs font-medium text-gray-700 shadow"
      >
        {info && <span style={{ fontSize: '10px' }}>{info.emoji}</span>}
        <span style={{ fontSize: '10px' }}>{temp}</span>
      </div>
    </AdvancedMarker>
  );
}
