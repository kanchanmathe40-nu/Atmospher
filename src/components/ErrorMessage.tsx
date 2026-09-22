import { useState } from 'react';
import { WifiOff, Clock, AlertTriangle, ShieldAlert, RefreshCw, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { WeatherErrorState, LocationInfo } from '../types';
import { PRESET_LOCATIONS } from '../utils/weatherUtils';

interface ErrorMessageProps {
  error: WeatherErrorState;
  onRetry: () => void;
  onSelectPreset: (location: LocationInfo) => void;
  isRetrying?: boolean;
}

export function ErrorMessage({
  error,
  onRetry,
  onSelectPreset,
  isRetrying = false,
}: ErrorMessageProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getErrorIcon = () => {
    switch (error.type) {
      case 'offline':
        return <WifiOff className="w-8 h-8 text-rose-500" />;
      case 'timeout':
        return <Clock className="w-8 h-8 text-amber-500" />;
      case 'permission_denied':
        return <ShieldAlert className="w-8 h-8 text-orange-500" />;
      case 'http_error':
      case 'not_found':
      default:
        return <AlertTriangle className="w-8 h-8 text-rose-500" />;
    }
  };

  const getBadgeText = () => {
    switch (error.type) {
      case 'offline':
        return 'Network Disconnected';
      case 'timeout':
        return 'Request Timeout (>12s)';
      case 'permission_denied':
        return 'Permission Required';
      case 'not_found':
        return 'Location Not Found';
      case 'http_error':
        return `API Error ${error.status || '5xx'}`;
      default:
        return 'API Error';
    }
  };

  return (
    <div
      id="error-message-card"
      className="bg-white/95 border border-rose-200/90 rounded-2xl p-6 sm:p-8 shadow-sm max-w-2xl mx-auto my-6"
    >
      <div className="flex flex-col items-center text-center">
        <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl mb-4">
          {getErrorIcon()}
        </div>

        <span className="text-xs font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 mb-2">
          {getBadgeText()}
        </span>

        <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
          {error.message}
        </h3>

        {error.details && (
          <p className="text-sm text-slate-600 max-w-md leading-relaxed mb-6">
            {error.details}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            id="retry-request-button"
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-all shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying REST API...' : 'Retry Request'}
          </button>
        </div>

        {/* Quick Location Fallbacks */}
        <div className="mt-8 pt-6 border-t border-slate-100 w-full">
          <p className="text-xs font-medium text-slate-500 mb-3 flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Or try loading weather for a known location:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESET_LOCATIONS.slice(0, 5).map((loc) => (
              <button
                key={loc.name}
                id={`preset-error-fallback-${loc.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectPreset(loc)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                {loc.name}, {loc.country}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Technical Details Toggle */}
        <div className="mt-6 w-full text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto transition cursor-pointer"
          >
            <span>{showDetails ? 'Hide technical diagnostics' : 'Show technical diagnostics'}</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDetails && (
            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 break-all space-y-1">
              <div><strong>Error Type:</strong> {error.type}</div>
              {error.status && <div><strong>HTTP Status:</strong> {error.status}</div>}
              <div><strong>Client Time:</strong> {new Date().toISOString()}</div>
              <div><strong>Online Status:</strong> {navigator.onLine ? 'Connected' : 'Offline'}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
