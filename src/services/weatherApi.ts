import {
  LocationInfo,
  WeatherPayload,
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  ApiDebugInfo,
  WeatherErrorState
} from '../types';

interface OpenMeteoCurrentResponse {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  rain: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
}

interface OpenMeteoHourlyResponse {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  weather_code: number[];
  wind_speed_10m: number[];
}

interface OpenMeteoDailyResponse {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  uv_index_max: number[];
  wind_speed_10m_max: number[];
}

interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: OpenMeteoCurrentResponse;
  hourly: OpenMeteoHourlyResponse;
  daily: OpenMeteoDailyResponse;
}

interface OpenMeteoGeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  country_code?: string;
  timezone?: string;
}

interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[];
}

/**
 * Combines an optional user AbortSignal with a timeout signal
 */
function createTimeoutSignal(timeoutMs = 12000, externalSignal?: AbortSignal): AbortSignal {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new Error('Network request timed out'));
  }, timeoutMs);

  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timer);
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener('abort', () => {
        clearTimeout(timer);
        controller.abort(externalSignal.reason);
      });
    }
  }

  return controller.signal;
}

/**
 * Classifies an unknown error into a structured WeatherErrorState
 */
export function parseWeatherError(err: unknown): WeatherErrorState {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      type: 'offline',
      message: 'You are currently offline',
      details: 'Please verify your internet connection. Cached or previously loaded data may be unavailable.',
    };
  }

  if (err instanceof Error) {
    if (err.name === 'AbortError' || err.message.toLowerCase().includes('timed out')) {
      return {
        type: 'timeout',
        message: 'Request timed out',
        details: 'The weather REST API took too long to respond. Please check your network and try again.',
      };
    }

    if (err.message.startsWith('HTTP_')) {
      const statusCode = parseInt(err.message.replace('HTTP_', ''), 10);
      if (statusCode === 404) {
        return {
          type: 'not_found',
          message: 'Location data not found',
          details: 'The weather service could not find forecast coordinates for this place.',
          status: 404,
        };
      }
      if (statusCode >= 500) {
        return {
          type: 'http_error',
          message: 'Weather Service Unavailable',
          details: `The upstream REST API returned server error status ${statusCode}. Please try again shortly.`,
          status: statusCode,
        };
      }
      return {
        type: 'http_error',
        message: 'Weather API request failed',
        details: `The server responded with status code ${statusCode}.`,
        status: statusCode,
      };
    }

    return {
      type: 'generic',
      message: err.message || 'Unable to retrieve weather data',
      details: 'An unexpected error occurred while communicating with the REST API.',
    };
  }

  return {
    type: 'generic',
    message: 'Unable to retrieve weather data',
    details: 'An unknown error occurred during API fetch.',
  };
}

/**
 * Asynchronously fetches real-time forecast from Open-Meteo REST API
 */
export async function fetchWeatherData(
  location: LocationInfo,
  externalSignal?: AbortSignal
): Promise<{ payload: WeatherPayload; debug: ApiDebugInfo }> {
  const signal = createTimeoutSignal(12000, externalSignal);

  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation_probability',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'precipitation_sum',
      'precipitation_probability_max',
      'uv_index_max',
      'wind_speed_10m_max',
    ].join(','),
    timezone: 'auto',
  });

  const endpoint = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const startTime = performance.now();

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!res.ok) {
      throw new Error(`HTTP_${res.status}`);
    }

    const data: OpenMeteoForecastResponse = await res.json();

    // Map current
    const current: CurrentWeather = {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      isDay: data.current.is_day === 1,
      precipitation: data.current.precipitation,
      rain: data.current.rain,
      weatherCode: data.current.weather_code,
      cloudCover: data.current.cloud_cover,
      pressure: data.current.pressure_msl,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      windGusts: data.current.wind_gusts_10m,
    };

    // Filter next 24 hourly points starting from now
    const nowIso = new Date().toISOString().slice(0, 13);
    const hourlyStartIndex = Math.max(
      0,
      data.hourly.time.findIndex((t) => t.slice(0, 13) >= nowIso)
    );

    const hourly: HourlyForecastItem[] = [];
    const hourlySliceEnd = Math.min(hourlyStartIndex + 24, data.hourly.time.length);

    for (let i = hourlyStartIndex; i < hourlySliceEnd; i++) {
      hourly.push({
        time: data.hourly.time[i],
        temperature: data.hourly.temperature_2m[i],
        humidity: data.hourly.relative_humidity_2m[i],
        precipitationProbability: data.hourly.precipitation_probability[i] ?? 0,
        weatherCode: data.hourly.weather_code[i],
        windSpeed: data.hourly.wind_speed_10m[i],
      });
    }

    // Map daily (7 days)
    const daily: DailyForecastItem[] = [];
    const dailyCount = Math.min(7, data.daily.time.length);
    for (let i = 0; i < dailyCount; i++) {
      daily.push({
        date: data.daily.time[i],
        weatherCode: data.daily.weather_code[i],
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        apparentTempMax: data.daily.apparent_temperature_max[i],
        apparentTempMin: data.daily.apparent_temperature_min[i],
        sunrise: data.daily.sunrise[i],
        sunset: data.daily.sunset[i],
        precipitationSum: data.daily.precipitation_sum[i],
        precipitationProbabilityMax: data.daily.precipitation_probability_max[i] ?? 0,
        uvIndexMax: data.daily.uv_index_max[i] ?? 0,
        windSpeedMax: data.daily.wind_speed_10m_max[i],
      });
    }

    const debug: ApiDebugInfo = {
      endpoint,
      status: res.status,
      statusText: res.statusText || 'OK',
      latencyMs,
      timestamp: new Date().toLocaleTimeString(),
    };

    return {
      payload: {
        location,
        current,
        hourly,
        daily,
        rawTimestamp: Date.now(),
      },
      debug,
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Searches locations using Open-Meteo Geocoding REST API
 */
export async function searchCities(
  query: string,
  externalSignal?: AbortSignal
): Promise<LocationInfo[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const signal = createTimeoutSignal(8000, externalSignal);
  const endpoint = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    trimmed
  )}&count=5&language=en&format=json`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP_${res.status}`);
    }

    const data: OpenMeteoGeocodingResponse = await res.json();
    if (!data.results || data.results.length === 0) {
      return [];
    }

    return data.results.map((item) => ({
      name: item.name,
      country: item.country || '',
      admin1: item.admin1,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone,
    }));
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return [];
    }
    throw err;
  }
}

/**
 * Reverse geocodes coordinates to a city name
 */
export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number,
  externalSignal?: AbortSignal
): Promise<LocationInfo> {
  const signal = createTimeoutSignal(6000, externalSignal);
  const endpoint = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

  try {
    const res = await fetch(endpoint, { signal });
    if (res.ok) {
      const data = await res.json();
      const name = data.city || data.locality || data.principalSubdivision || 'Your Location';
      const country = data.countryName || '';
      const admin1 = data.principalSubdivision;
      return {
        name,
        country,
        admin1,
        latitude,
        longitude,
      };
    }
  } catch {
    // Graceful fallback if reverse geocoding service is unavailable
  }

  return {
    name: 'Current Location',
    country: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
    latitude,
    longitude,
  };
}
