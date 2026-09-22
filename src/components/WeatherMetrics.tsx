import {
  Wind,
  Droplets,
  SunMedium,
  Gauge,
  CloudRain,
  Sunrise,
  Sunset,
  Navigation
} from 'lucide-react';
import { WeatherPayload, TemperatureUnit } from '../types';
import { formatWindSpeed, getUVIndexLevel } from '../utils/weatherUtils';

interface WeatherMetricsProps {
  weather: WeatherPayload;
  unit: TemperatureUnit;
}

export function WeatherMetrics({ weather, unit }: WeatherMetricsProps) {
  const { current, daily } = weather;
  const today = daily[0];

  const uvLevel = getUVIndexLevel(today?.uvIndexMax ?? 0);

  // Format sunrise / sunset
  const formatTimeStr = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '--:--';
    }
  };

  const getHumidityStatus = (hum: number) => {
    if (hum < 30) return { label: 'Dry', color: 'text-amber-600 bg-amber-50' };
    if (hum <= 60) return { label: 'Comfortable', color: 'text-emerald-600 bg-emerald-50' };
    return { label: 'Humid', color: 'text-blue-600 bg-blue-50' };
  };

  const humidityStatus = getHumidityStatus(current.humidity);

  return (
    <div id="weather-metrics-grid" className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
      {/* 1. Wind & Direction */}
      <div
        id="metric-card-wind"
        className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Wind</span>
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
            <Wind className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
            {formatWindSpeed(current.windSpeed, unit)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Navigation
              className="w-3.5 h-3.5 text-slate-600 inline-block transition-transform duration-500"
              style={{ transform: `rotate(${current.windDirection}deg)` }}
            />
            <span>{current.windDirection}° Gusts {formatWindSpeed(current.windGusts, unit)}</span>
          </div>
        </div>
      </div>

      {/* 2. Relative Humidity */}
      <div
        id="metric-card-humidity"
        className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Humidity</span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Droplets className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
            {current.humidity}%
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className={`px-2 py-0.5 rounded font-medium ${humidityStatus.color}`}>
              {humidityStatus.label}
            </span>
          </div>
        </div>
      </div>

      {/* 3. UV Index */}
      <div
        id="metric-card-uv"
        className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">UV Index</span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <SunMedium className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
            {today ? Math.round(today.uvIndexMax) : '--'}
          </div>
          <div>
            <span
              className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border ${uvLevel.color}`}
            >
              {uvLevel.label}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Atmospheric Pressure */}
      <div
        id="metric-card-pressure"
        className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Pressure</span>
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <Gauge className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
            {Math.round(current.pressure)}{' '}
            <span className="text-xs font-sans font-medium text-slate-500">hPa</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Sea level corrected</p>
        </div>
      </div>

      {/* 5. Precipitation */}
      <div
        id="metric-card-precipitation"
        className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Precipitation</span>
          <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
            <CloudRain className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
            {today?.precipitationSum ?? 0}{' '}
            <span className="text-xs font-sans font-medium text-slate-500">mm</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Chance: {today?.precipitationProbabilityMax ?? 0}%
          </p>
        </div>
      </div>

      {/* 6. Sunrise & Sunset */}
      <div
        id="metric-card-sun"
        className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Sun Cycle</span>
          <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
            <Sunrise className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <Sunrise className="w-3.5 h-3.5" /> Rise
            </span>
            <span className="font-mono font-bold">{formatTimeStr(today?.sunrise)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700 pt-0.5">
            <span className="flex items-center gap-1 text-indigo-600 font-medium">
              <Sunset className="w-3.5 h-3.5" /> Set
            </span>
            <span className="font-mono font-bold">{formatTimeStr(today?.sunset)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
