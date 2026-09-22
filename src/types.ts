export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface LocationInfo {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  weatherCode: number;
  cloudCover: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  humidity: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
}

export interface DailyForecastItem {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  sunrise: string;
  sunset: string;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  uvIndexMax: number;
  windSpeedMax: number;
}

export interface WeatherPayload {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  rawTimestamp: number;
}

export interface ApiDebugInfo {
  endpoint: string;
  status: number;
  statusText: string;
  latencyMs: number;
  timestamp: string;
  cached?: boolean;
}

export type FetchStatus = 'idle' | 'loading' | 'refreshing' | 'success' | 'error';

export interface WeatherErrorState {
  type: 'offline' | 'timeout' | 'not_found' | 'http_error' | 'permission_denied' | 'generic';
  message: string;
  details?: string;
  status?: number;
}
