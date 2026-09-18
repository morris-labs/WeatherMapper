import { WeatherIcon } from './WeatherIcon';
import { getWeatherInfo, degreesToCompass } from '../utils/weatherCodes';
import { formatElapsed } from '../utils/waypointSampler';

function formatTime(ms) {
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function WaypointCard({ waypoint, index }) {
  const { type, label, arrivalTimeMs, elapsedMs, weather } = waypoint;
  const isEntered = type === 'entered';

  const timeStr = formatTime(arrivalTimeMs);
  const elapsedStr = elapsedMs === 0 ? 'Departure' : formatElapsed(elapsedMs);
  const displayLabel = label || elapsedStr;

  return (
    <div
      className={`rounded-lg border p-3 ${
        isEntered
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`flex-shrink-0 text-xs font-semibold tabular-nums ${isEntered ? 'text-blue-700' : 'text-gray-500'}`}>
              {timeStr}
            </span>
            {elapsedMs > 0 && (
              <span className="text-xs text-gray-400">{elapsedStr}</span>
            )}
          </div>
          <p className={`mt-0.5 truncate text-sm font-medium ${isEntered ? 'text-blue-900' : 'text-gray-700'}`}>
            {displayLabel}
          </p>
        </div>
        {isEntered && (
          <span className="flex-shrink-0 rounded bg-blue-600 px-1.5 py-0.5 text-xs font-medium text-white">
            Stop {index + 1}
          </span>
        )}
      </div>

      {weather ? (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="flex items-center gap-1 font-semibold text-gray-800">
            <WeatherIcon code={weather.weatherCode} />
            {weather.temperature}°F
          </span>
          <span className="text-gray-500">{getWeatherInfo(weather.weatherCode).label}</span>
          <span className="text-gray-500">💧 {weather.precipChance}%</span>
          <span className="text-gray-500">
            💨 {weather.windSpeed} mph {degreesToCompass(weather.windDir)}
          </span>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400">Weather unavailable</p>
      )}
    </div>
  );
}
