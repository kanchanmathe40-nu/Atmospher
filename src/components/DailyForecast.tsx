import { CalendarDays, Droplets } from 'lucide-react';
import { DailyForecastItem, TemperatureUnit } from '../types';
import { getWeatherCondition, formatTemp, formatDayOfWeek } from '../utils/weatherUtils';

interface DailyForecastProps {
  daily: DailyForecastItem[];
  unit: TemperatureUnit;
}

export function DailyForecast({ daily, unit }: DailyForecastProps) {
  if (!daily || daily.length === 0) return null;

  // Calculate global min and max across all 7 days for proportional bar visualization
  const allMins = daily.map((d) => d.tempMin);
  const allMaxs = daily.map((d) => d.tempMax);
  const overallMin = Math.min(...allMins);
  const overallMax = Math.max(...allMaxs);
  const totalRange = Math.max(1, overallMax - overallMin);

  return (
    <div
      id="daily-forecast-card"
      className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between"
    >
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">
          7-Day Forecast
        </h3>
      </div>

      <div className="divide-y divide-slate-100 space-y-2">
        {daily.map((item, index) => {
          const isToday = index === 0;
          const { dayName, formattedDate } = formatDayOfWeek(item.date);
          const condition = getWeatherCondition(item.weatherCode);
          const Icon = condition.icon;

          // Bar math: left percentage and width percentage
          const leftPercent = ((item.tempMin - overallMin) / totalRange) * 100;
          const widthPercent = Math.max(8, ((item.tempMax - item.tempMin) / totalRange) * 100);

          return (
            <div
              key={item.date}
              id={`daily-forecast-row-${index}`}
              className="pt-2.5 pb-2 flex items-center justify-between gap-3 text-xs sm:text-sm"
            >
              {/* Day & Date */}
              <div className="w-20 sm:w-24 shrink-0">
                <div className={`font-semibold ${isToday ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                  {isToday ? 'Today' : dayName}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {formattedDate}
                </div>
              </div>

              {/* Condition Icon & Rain */}
              <div className="flex items-center gap-2 w-28 sm:w-36 shrink-0">
                <Icon className={`w-5 h-5 shrink-0 ${condition.colorClass}`} />
                <div className="truncate">
                  <span className="text-slate-700 font-medium truncate block">
                    {condition.label}
                  </span>
                  {item.precipitationProbabilityMax > 15 ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-sky-600">
                      <Droplets className="w-2.5 h-2.5" />
                      {item.precipitationProbabilityMax}%
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Min Temp */}
              <div className="w-10 text-right font-mono text-slate-500 font-medium text-xs sm:text-sm">
                {formatTemp(item.tempMin, unit)}
              </div>

              {/* Visual Temperature Range Bar */}
              <div className="flex-1 max-w-[140px] hidden sm:block h-2 bg-slate-100 rounded-full relative overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 bg-linear-to-r from-sky-400 via-amber-400 to-rose-400 rounded-full"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                />
              </div>

              {/* Max Temp */}
              <div className="w-10 text-right font-mono text-slate-900 font-bold text-xs sm:text-sm">
                {formatTemp(item.tempMax, unit)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
