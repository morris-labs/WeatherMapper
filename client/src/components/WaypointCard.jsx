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
          ? 'border-[--ml-accent-fg] bg-[--ml-accent-bg]'
          : 'border-[--ml-border] bg-[--ml-surface]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`flex-shrink-0 text-xs font-semibold tabular-nums ${isEntered ? 'text-[--ml-accent-fg]' : 'text-[--ml-muted]'}`}>
              {timeStr}
            </span>
            {elapsedMs > 0 && (
              <span className="text-xs text-[--ml-muted]">{elapsedStr}</span>
            )}
          </div>
          <p className={`mt-0.5 truncate text-sm font-medium ${isEntered ? 'text-[--ml-ink]' : 'text-[--ml-ink]'}`}>
            {displayLabel}
          </p>
        </div>
        {isEntered && (
          <span className="flex-shrink-0 rounded bg-[--ml-accent-fg] px-1.5 py-0.5 text-xs font-medium text-white">
            Stop {index + 1}
          </span>
        )}
      </div>

      {weather ? (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="flex items-center gap-1 font-semibold text-[--ml-ink]">
            <WeatherIcon code={weather.weatherCode} />
            {weather.temperature}°F
          </span>
          <span className="text-[--ml-muted]">{getWeatherInfo(weather.weatherCode).label}</span>
          <span className="text-[--ml-muted]">💧 {weather.precipChance}%</span>
          <span className="text-[--ml-muted]">
            💨 {weather.windSpeed} mph {degreesToCompass(weather.windDir)}
          </span>
        </div>
      ) : (
        <p className="mt-1 text-xs text-[--ml-muted]">Weather unavailable</p>
      )}
    </div>
  );
}
