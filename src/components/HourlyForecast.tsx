import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Droplets, Clock } from 'lucide-react';
import { HourlyForecastItem, TemperatureUnit } from '../types';
import { getWeatherCondition, formatTemp, formatHourlyTime } from '../utils/weatherUtils';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  unit: TemperatureUnit;
}

export function HourlyForecast({ hourly, unit }: HourlyForecastProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!hourly || hourly.length === 0) return null;

  return (
    <div
      id="hourly-forecast-card"
      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs"
    >
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">
            24-Hour Forecast
          </h3>
          <span className="text-xs text-slate-400 font-medium">Hourly progression</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="hourly-scroll-left"
            onClick={() => scroll('left')}
            className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            id="hourly-scroll-right"
            onClick={() => scroll('right')}
            className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        id="hourly-items-scroll-track"
        className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
      >
        {hourly.map((item, index) => {
          const condition = getWeatherCondition(item.weatherCode);
          const Icon = condition.icon;
          const isNow = index === 0;

          return (
            <div
              key={item.time}
              id={`hourly-item-${index}`}
              className={`shrink-0 w-24 rounded-xl p-3 flex flex-col items-center justify-between gap-2 border transition ${
                isNow
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-200/60 text-slate-700'
              }`}
            >
              <span
                className={`text-[11px] font-semibold tracking-wide ${
                  isNow ? 'text-amber-400' : 'text-slate-500'
                }`}
              >
                {isNow ? 'NOW' : formatHourlyTime(item.time)}
              </span>

              <div className="my-1">
                <Icon
                  className={`w-6 h-6 ${isNow ? 'text-white' : condition.colorClass}`}
                />
              </div>

              <div className="text-center">
                <div
                  className={`text-sm font-bold font-mono ${
                    isNow ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {formatTemp(item.temperature, unit)}
                </div>

                {item.precipitationProbability > 0 ? (
                  <div
                    className={`flex items-center justify-center gap-0.5 text-[10px] font-semibold mt-1 ${
                      isNow ? 'text-sky-300' : 'text-sky-600'
                    }`}
                  >
                    <Droplets className="w-3 h-3" />
                    <span>{item.precipitationProbability}%</span>
                  </div>
                ) : (
                  <div className="text-[10px] opacity-0 mt-1 select-none">0%</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
