const CODES = {
  0:  { label: 'Clear sky',              emoji: '☀️' },
  1:  { label: 'Mainly clear',           emoji: '🌤️' },
  2:  { label: 'Partly cloudy',          emoji: '⛅' },
  3:  { label: 'Overcast',              emoji: '☁️' },
  45: { label: 'Foggy',                 emoji: '🌫️' },
  48: { label: 'Icy fog',               emoji: '🌫️' },
  51: { label: 'Light drizzle',         emoji: '🌦️' },
  53: { label: 'Drizzle',              emoji: '🌦️' },
  55: { label: 'Heavy drizzle',         emoji: '🌧️' },
  61: { label: 'Light rain',            emoji: '🌦️' },
  63: { label: 'Rain',                  emoji: '🌧️' },
  65: { label: 'Heavy rain',            emoji: '🌧️' },
  71: { label: 'Light snow',            emoji: '🌨️' },
  73: { label: 'Snow',                  emoji: '❄️' },
  75: { label: 'Heavy snow',            emoji: '❄️' },
  77: { label: 'Snow grains',           emoji: '🌨️' },
  80: { label: 'Rain showers',          emoji: '🌦️' },
  81: { label: 'Moderate showers',      emoji: '🌧️' },
  82: { label: 'Violent showers',       emoji: '⛈️' },
  85: { label: 'Snow showers',          emoji: '🌨️' },
  86: { label: 'Heavy snow showers',    emoji: '❄️' },
  95: { label: 'Thunderstorm',          emoji: '⛈️' },
  96: { label: 'Thunderstorm + hail',   emoji: '⛈️' },
  99: { label: 'Thunderstorm + hail',   emoji: '⛈️' },
};

const FALLBACK = { label: 'Unknown', emoji: '🌡️' };

export function getWeatherInfo(code) {
  return CODES[code] ?? FALLBACK;
}

export function degreesToCompass(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}
