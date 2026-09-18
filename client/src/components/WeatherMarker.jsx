import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { getWeatherInfo } from '../utils/weatherCodes';

export function WeatherMarker({ waypoint }) {
  const { lat, lng, weather, type } = waypoint;
  const isEntered = type === 'entered';

  const info = weather ? getWeatherInfo(weather.weatherCode) : null;
  const temp = weather ? `${weather.temperature}°` : '?';

  return (
    <AdvancedMarker position={{ lat, lng }}>
      <div
        title={weather ? `${info.label} · ${temp}F` : waypoint.label || ''}
        className={`flex items-center gap-0.5 rounded-full border-2 px-2 py-0.5 text-xs font-bold shadow-md ${
          isEntered
            ? 'border-blue-600 bg-blue-600 text-white'
            : 'border-gray-500 bg-white text-gray-800'
        }`}
        style={{ whiteSpace: 'nowrap' }}
      >
        {info && <span>{info.emoji}</span>}
        <span>{temp}</span>
      </div>
    </AdvancedMarker>
  );
}
