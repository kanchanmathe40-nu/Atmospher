import { MapPin, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { WeatherPayload, TemperatureUnit } from '../types';
import { getWeatherCondition, formatTemp } from '../utils/weatherUtils';

interface WeatherCurrentProps {
  weather: WeatherPayload;
  unit: TemperatureUnit;
  isRefreshing?: boolean;
}

export function WeatherCurrent({
  weather,
  unit,
  isRefreshing = false,
}: WeatherCurrentProps) {
  const { location, current, daily } = weather;
  const condition = getWeatherCondition(current.weatherCode, current.isDay);
  const IconComponent = condition.icon;

  const todayForecast = daily[0];
  const maxTemp = todayForecast ? formatTemp(todayForecast.tempMax, unit) : '--';
  const minTemp = todayForecast ? formatTemp(todayForecast.tempMin, unit) : '--';

  // Format observation date / local time
  const observationDate = new Date();
  const dateFormatted = observationDate.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      id="current-weather-hero"
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-br ${condition.bgGradient} p-6 sm:p-8 shadow-xs transition-all`}
    >
      {/* Background ambient decorative orb */}
      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/40 blur-3xl pointer-events-none" />

      {/* Top row: Location & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-slate-700 shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {location.name}
          </h2>
          {location.admin1 && (
            <span className="text-sm font-medium text-slate-600 hidden md:inline">
              {location.admin1},
            </span>
          )}
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/80 border border-slate-200/60 text-slate-700 shadow-2xs">
            {location.country}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{dateFormatted}</span>
          {isRefreshing && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full animate-pulse">
              Syncing...
            </span>
          )}
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-baseline gap-4 sm:gap-6 flex-wrap">
          <div className="text-6xl sm:text-7xl font-extrabold tracking-tighter text-slate-950 font-mono">
            {formatTemp(current.temperature, unit)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-slate-800">
                {condition.label}
              </span>
            </div>
            <div className="text-sm text-slate-600 font-medium">
              Feels like <span className="font-semibold text-slate-800">{formatTemp(current.apparentTemperature, unit)}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 pt-1">
              <span className="flex items-center gap-0.5 text-rose-600">
                <ArrowUp className="w-3.5 h-3.5" />
                {maxTemp}
              </span>
              <span className="flex items-center gap-0.5 text-sky-600">
                <ArrowDown className="w-3.5 h-3.5" />
                {minTemp}
              </span>
            </div>
          </div>
        </div>

        {/* Condition Icon badge */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white/70 backdrop-blur-xs border border-white/60 shadow-xs self-center sm:self-auto min-w-[120px]">
          <IconComponent className={`w-14 h-14 sm:w-16 sm:h-16 ${condition.colorClass}`} />
          <span className="text-xs font-medium text-slate-500 mt-2 text-center max-w-[130px]">
            {condition.description}
          </span>
        </div>
      </div>
    </div>
  );
}
