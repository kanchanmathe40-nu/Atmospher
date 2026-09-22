import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  RefreshCw,
  Navigation,
  X,
  Code2,
  CloudSun,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { LocationInfo, TemperatureUnit, FetchStatus } from '../types';
import { PRESET_LOCATIONS, formatRelativeTime } from '../utils/weatherUtils';
import { searchCities } from '../services/weatherApi';

interface HeaderProps {
  currentLocation: LocationInfo | null;
  selectedUnit: TemperatureUnit;
  onUnitChange: (unit: TemperatureUnit) => void;
  onSelectLocation: (loc: LocationInfo) => void;
  onRefresh: () => void;
  onGeolocate: () => void;
  fetchStatus: FetchStatus;
  lastUpdated: number | null;
  onToggleApiInspector: () => void;
  isApiInspectorOpen: boolean;
  isGeolocating: boolean;
  isOnline: boolean;
}

export function Header({
  currentLocation,
  selectedUnit,
  onUnitChange,
  onSelectLocation,
  onRefresh,
  onGeolocate,
  fetchStatus,
  lastUpdated,
  onToggleApiInspector,
  isApiInspectorOpen,
  isGeolocating,
  isOnline,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced asynchronous search against Geocoding REST API
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsOpenDropdown(false);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    const abortController = new AbortController();
    setIsSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const results = await searchCities(searchQuery, abortController.signal);
        setSuggestions(results);
        setIsOpenDropdown(true);
        setFocusedIndex(-1);
        if (results.length === 0) {
          setSearchError('No matching locations found');
        }
      } catch (err) {
        if (!(err instanceof Error && err.name === 'AbortError')) {
          setSearchError('Search failed. Please try again.');
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [searchQuery]);

  // Click outside listener for suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (loc: LocationInfo) => {
    onSelectLocation(loc);
    setSearchQuery('');
    setSuggestions([]);
    setIsOpenDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpenDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
        handleSelectLocation(suggestions[focusedIndex]);
      } else if (suggestions.length > 0) {
        handleSelectLocation(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpenDropdown(false);
    }
  };

  const updatedTimeLabel = lastUpdated
    ? formatRelativeTime(new Date(lastUpdated))
    : 'Not updated yet';

  const isRefreshing = fetchStatus === 'refreshing';
  const isLoading = fetchStatus === 'loading';

  return (
    <header id="app-header" className="mb-6 space-y-4">
      {/* Top Banner & Meta Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Atmosphere
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                REST API
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Live meteorological forecast via Open-Meteo
            </p>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {/* Online status indicator */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
              isOnline
                ? 'bg-slate-50 text-slate-600 border-slate-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
            title={isOnline ? 'Network connected' : 'Network offline'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Unit Switcher */}
          <div
            id="unit-toggle-group"
            className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold"
          >
            <button
              id="unit-toggle-celsius"
              onClick={() => onUnitChange('celsius')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedUnit === 'celsius'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              °C
            </button>
            <button
              id="unit-toggle-fahrenheit"
              onClick={() => onUnitChange('fahrenheit')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedUnit === 'fahrenheit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              °F
            </button>
          </div>

          {/* Manual Refresh Button */}
          <button
            id="header-refresh-button"
            onClick={onRefresh}
            disabled={isLoading || isRefreshing || !isOnline}
            title="Refresh current weather data"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing || isLoading ? 'animate-spin text-amber-600' : 'text-slate-500'}`}
            />
            <span className="hidden sm:inline">
              {isRefreshing ? 'Refreshing...' : updatedTimeLabel}
            </span>
          </button>

          {/* API Inspector Toggle */}
          <button
            id="api-inspector-toggle-button"
            onClick={onToggleApiInspector}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
              isApiInspectorOpen
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
            title="Inspect REST API Payload & Diagnostics"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">API Inspector</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Geolocation Row */}
      <div className="flex flex-col sm:flex-row gap-2 relative">
        <div ref={dropdownRef} className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              id="city-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setIsOpenDropdown(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search city or location (e.g. Kyoto, Vancouver, Madrid)..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200/90 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition shadow-2xs"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 absolute right-3 text-slate-400 animate-spin" />
            ) : searchQuery ? (
              <button
                id="clear-search-button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  setIsOpenDropdown(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpenDropdown && (
            <div
              id="search-suggestions-dropdown"
              className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden py-1 divide-y divide-slate-100 max-h-64 overflow-y-auto"
            >
              {suggestions.map((loc, idx) => (
                <button
                  key={`${loc.name}-${loc.latitude}-${loc.longitude}-${idx}`}
                  id={`suggestion-item-${idx}`}
                  onClick={() => handleSelectLocation(loc)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition cursor-pointer ${
                    focusedIndex === idx
                      ? 'bg-slate-100 text-slate-900'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800">{loc.name}</span>
                      {loc.admin1 && (
                        <span className="text-slate-500 text-xs ml-1.5">{loc.admin1},</span>
                      )}
                      <span className="text-slate-500 text-xs ml-1">{loc.country}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}

              {searchError && (
                <div className="px-4 py-3 text-xs text-slate-500 text-center">
                  {searchError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Location GPS Button */}
        <button
          id="geolocate-button"
          onClick={onGeolocate}
          disabled={isGeolocating || !isOnline}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 rounded-xl text-sm font-medium text-slate-700 transition shadow-2xs whitespace-nowrap disabled:opacity-50 cursor-pointer"
          title="Detect and use current device location"
        >
          {isGeolocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
          ) : (
            <Navigation className="w-4 h-4 text-slate-600" />
          )}
          <span>{isGeolocating ? 'Detecting GPS...' : 'My Location'}</span>
        </button>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-slate-400 font-medium text-[11px] whitespace-nowrap pr-1">
          Popular:
        </span>
        {PRESET_LOCATIONS.map((preset) => {
          const isSelected =
            currentLocation &&
            currentLocation.name.toLowerCase() === preset.name.toLowerCase();
          return (
            <button
              key={preset.name}
              id={`preset-city-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectLocation(preset)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/90 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </header>
  );
}
