import { getWeatherInfo } from '../utils/weatherCodes';

export function WeatherIcon({ code, className = '' }) {
  const { emoji, label } = getWeatherInfo(code);
  return (
    <span className={className} role="img" aria-label={label} title={label}>
      {emoji}
    </span>
  );
}
