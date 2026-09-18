const BASE = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeatherAt(lat, lng, arrivalTimeMs) {
  // Fetch a two-day window (UTC date and the next day) so timezone offsets
  // never push the arrival hour outside the returned range.
  const date = new Date(arrivalTimeMs);
  const startDate = date.toISOString().slice(0, 10);
  const nextDay = new Date(date.getTime() + 86400000);
  const endDate = nextDay.toISOString().slice(0, 10);

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lng,
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'weathercode',
      'windspeed_10m',
      'winddirection_10m',
    ].join(','),
    temperature_unit: 'fahrenheit',
    windspeed_unit: 'mph',
    timezone: 'auto',
    start_date: startDate,
    end_date: endDate,
  });

  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data = await res.json();

  const times = data.hourly.time;
  let closestIdx = 0;
  let closestDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(new Date(times[i]).getTime() - arrivalTimeMs);
    if (diff < closestDiff) { closestDiff = diff; closestIdx = i; }
  }

  const h = data.hourly;
  return {
    temperature:  Math.round(h.temperature_2m[closestIdx]),
    feelsLike:    Math.round(h.apparent_temperature[closestIdx]),
    precipChance: h.precipitation_probability[closestIdx] ?? 0,
    weatherCode:  h.weathercode[closestIdx],
    windSpeed:    Math.round(h.windspeed_10m[closestIdx]),
    windDir:      h.winddirection_10m[closestIdx],
  };
}
