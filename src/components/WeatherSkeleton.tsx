export function WeatherSkeleton() {
  return (
    <div id="weather-skeleton-container" className="space-y-6 animate-pulse">
      {/* Hero Current Weather Skeleton */}
      <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 w-full md:w-1/2">
            <div className="h-6 w-36 bg-slate-200 rounded-md"></div>
            <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-48 bg-slate-100 rounded-md"></div>
            <div className="pt-2 flex items-center gap-4">
              <div className="h-16 w-32 bg-slate-200 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                <div className="h-4 w-28 bg-slate-100 rounded"></div>
              </div>
            </div>
          </div>
          <div className="w-28 h-28 md:w-36 md:h-36 bg-slate-100 rounded-2xl self-center"></div>
        </div>
      </div>

      {/* Hourly Strip Skeleton */}
      <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="h-5 w-40 bg-slate-200 rounded mb-4"></div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-1 min-w-[80px] h-32 bg-slate-100 rounded-xl flex flex-col items-center justify-between p-3"
            >
              <div className="h-3 w-10 bg-slate-200 rounded"></div>
              <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
              <div className="h-4 w-12 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Grid: Metrics & 7-Day Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metrics Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 h-36 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-slate-200 rounded"></div>
                <div className="w-6 h-6 bg-slate-200 rounded-md"></div>
              </div>
              <div className="h-7 w-24 bg-slate-200 rounded"></div>
              <div className="h-3 w-32 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>

        {/* 7-Day Forecast Skeleton */}
        <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="h-5 w-32 bg-slate-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="h-4 w-14 bg-slate-200 rounded"></div>
                <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
                <div className="h-3 w-28 bg-slate-200 rounded-full"></div>
                <div className="h-4 w-12 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
