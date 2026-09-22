import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LocationInfo,
  WeatherPayload,
  TemperatureUnit,
  FetchStatus,
  WeatherErrorState,
  ApiDebugInfo
} from './types';
import { PRESET_LOCATIONS } from './utils/weatherUtils';
import {
  fetchWeatherData,
  parseWeatherError,
  reverseGeocodeLocation
} from './services/weatherApi';
import { Header } from './components/Header';
import { WeatherCurrent } from './components/WeatherCurrent';
import { WeatherMetrics } from './components/WeatherMetrics';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { WeatherSkeleton } from './components/WeatherSkeleton';
import { ErrorMessage } from './components/ErrorMessage';
import { ApiInspectorModal } from './components/ApiInspectorModal';
import { AlertCircle, RefreshCw } from 'lucide-react';

const STORAGE_KEYS = {
  UNIT: 'atmosphere_weather_unit',
  LOCATION: 'atmosphere_weather_location',
};

export default function App() {
  // Stored preferences with fallbacks
  const [selectedUnit, setSelectedUnit] = useState<TemperatureUnit>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UNIT);
      return saved === 'fahrenheit' ? 'fahrenheit' : 'celsius';
    } catch {
      return 'celsius';
    }
  });

  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOCATION);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return PRESET_LOCATIONS[0]; // Default to Tokyo
  });

  const [weatherData, setWeatherData] = useState<WeatherPayload | null>(null);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('loading');
  const [error, setError] = useState<WeatherErrorState | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<ApiDebugInfo | null>(null);

  // UI state
  const [isApiInspectorOpen, setIsApiInspectorOpen] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active request controller ref
  const abortControllerRef = useRef<AbortController | null>(null);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setToastMessage('Network connection restored');
      setTimeout(() => setToastMessage(null), 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setToastMessage('Internet connection lost. Displaying cached data.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist unit preference
  const handleUnitChange = (unit: TemperatureUnit) => {
    setSelectedUnit(unit);
    try {
      localStorage.setItem(STORAGE_KEYS.UNIT, unit);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  // Main weather fetch routine
  const loadWeatherData = useCallback(
    async (location: LocationInfo, isBackgroundRefresh = false) => {
      // Cancel any ongoing fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (isBackgroundRefresh) {
        setFetchStatus('refreshing');
      } else {
        setFetchStatus('loading');
        setError(null);
      }

      try {
        const { payload, debug } = await fetchWeatherData(location, controller.signal);
        setWeatherData(payload);
        setDebugInfo(debug);
        setLastUpdated(payload.rawTimestamp);
        setFetchStatus('success');
        setError(null);

        // Save last successful location to localStorage
        try {
          localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(location));
        } catch {
          // ignore
        }
      } catch (err) {
        // If aborted by a newer user search or click, ignore
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        const classifiedError = parseWeatherError(err);

        // If background refresh failed but we already have data, don't clear the screen
        if (isBackgroundRefresh && weatherData) {
          setFetchStatus('success');
          setToastMessage(`Refresh failed: ${classifiedError.message}`);
          setTimeout(() => setToastMessage(null), 4000);
        } else {
          setError(classifiedError);
          setFetchStatus('error');
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [weatherData]
  );

  // Initial load or location change
  useEffect(() => {
    loadWeatherData(currentLocation, false);
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Periodic auto-refresh every 10 minutes when online and window is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        loadWeatherData(currentLocation, true);
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentLocation, loadWeatherData]);

  // Handler: Location Selected from Search or Preset
  const handleSelectLocation = (loc: LocationInfo) => {
    setCurrentLocation(loc);
  };

  // Handler: Manual Refresh
  const handleManualRefresh = () => {
    loadWeatherData(currentLocation, true);
  };

  // Handler: Retry upon error
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await loadWeatherData(currentLocation, false);
    } finally {
      setIsRetrying(false);
    }
  };

  // Handler: Geolocation (GPS)
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError({
        type: 'permission_denied',
        message: 'Geolocation Not Supported',
        details: 'Your browser environment does not support device geolocation. Please search for your city above.',
      });
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const resolvedLoc = await reverseGeocodeLocation(lat, lon);
          setCurrentLocation(resolvedLoc);
        } catch {
          // Fallback with coordinates
          setCurrentLocation({
            name: 'Current Location',
            country: `${position.coords.latitude.toFixed(2)}°, ${position.coords.longitude.toFixed(2)}°`,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        } finally {
          setIsGeolocating(false);
        }
      },
      (geoError) => {
        setIsGeolocating(false);
        let detailMessage = 'Unable to determine your coordinates.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          detailMessage = 'Location access was declined in browser permissions. You can easily search for your city in the search bar above.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          detailMessage = 'Location information is currently unavailable.';
        } else if (geoError.code === geoError.TIMEOUT) {
          detailMessage = 'Geolocation request timed out.';
        }

        setError({
          type: 'permission_denied',
          message: 'Location Access Unavailable',
          details: detailMessage,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div
      id="weather-app-root"
      className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-amber-200 selection:text-slate-900 flex flex-col font-sans"
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          id="toast-notification-banner"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg flex items-center gap-2 transition-all animate-in fade-in slide-in-from-top-2"
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col">
        {/* Header & Controls */}
        <Header
          currentLocation={currentLocation}
          selectedUnit={selectedUnit}
          onUnitChange={handleUnitChange}
          onSelectLocation={handleSelectLocation}
          onRefresh={handleManualRefresh}
          onGeolocate={handleGeolocate}
          fetchStatus={fetchStatus}
          lastUpdated={lastUpdated}
          onToggleApiInspector={() => setIsApiInspectorOpen(!isApiInspectorOpen)}
          isApiInspectorOpen={isApiInspectorOpen}
          isGeolocating={isGeolocating}
          isOnline={isOnline}
        />

        {/* Content Area with Conditional Views */}
        <div id="weather-content-viewport" className="flex-1 space-y-6">
          {fetchStatus === 'loading' && <WeatherSkeleton />}

          {fetchStatus === 'error' && error && (
            <ErrorMessage
              error={error}
              onRetry={handleRetry}
              onSelectPreset={handleSelectLocation}
              isRetrying={isRetrying}
            />
          )}

          {(fetchStatus === 'success' || (fetchStatus === 'refreshing' && weatherData)) && weatherData && (
            <div id="weather-data-view" className="space-y-6">
              {/* Hero Current Weather */}
              <WeatherCurrent
                weather={weatherData}
                unit={selectedUnit}
                isRefreshing={fetchStatus === 'refreshing'}
              />

              {/* 24-Hour Forecast Strip */}
              <HourlyForecast
                hourly={weatherData.hourly}
                unit={selectedUnit}
              />

              {/* 2-Column Split: Detailed Metrics Grid + 7-Day Forecast */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                      Atmospheric Metrics
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      Real-time observation
                    </span>
                  </div>
                  <WeatherMetrics
                    weather={weatherData}
                    unit={selectedUnit}
                  />
                </div>

                <div className="lg:col-span-1">
                  <DailyForecast
                    daily={weatherData.daily}
                    unit={selectedUnit}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info & live API citation */}
        <footer className="mt-12 pt-6 border-t border-slate-200/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 hover:text-slate-900 font-medium underline underline-offset-2 transition"
            >
              Open-Meteo REST API
            </a>
            <span>• No API keys required</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApiInspectorOpen(true)}
              className="hover:text-slate-700 transition cursor-pointer"
            >
              REST API Telemetry
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              WMO Code Standard
            </span>
          </div>
        </footer>
      </main>

      {/* REST API Telemetry Inspector Modal */}
      <ApiInspectorModal
        isOpen={isApiInspectorOpen}
        onClose={() => setIsApiInspectorOpen(false)}
        debugInfo={debugInfo}
        weatherData={weatherData}
      />
    </div>
  );
}
