import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  LucideIcon
} from 'lucide-react';
import { LocationInfo, TemperatureUnit } from '../types';

export interface WeatherCondition {
  label: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  bgGradient: string;
}

export const PRESET_LOCATIONS: LocationInfo[] = [
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'San Francisco', country: 'United States', admin1: 'California', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles' },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'Reykjavik', country: 'Iceland', latitude: 64.1466, longitude: -21.9426, timezone: 'Atlantic/Reykjavik' },
];

/**
 * Maps WMO code to human-readable description and Lucide icon
 */
export function getWeatherCondition(wmoCode: number, isDay = true): WeatherCondition {
  switch (wmoCode) {
    case 0:
      return {
        label: isDay ? 'Clear Sky' : 'Clear Night',
        description: 'Sunny and completely clear',
        icon: Sun,
        colorClass: isDay ? 'text-amber-500' : 'text-indigo-400',
        bgGradient: isDay ? 'from-amber-50/70 to-orange-50/40' : 'from-indigo-950/20 to-slate-900/10',
      };
    case 1:
      return {
        label: 'Mainly Clear',
        description: 'Mostly clear with minimal clouds',
        icon: CloudSun,
        colorClass: 'text-amber-500',
        bgGradient: 'from-amber-50/50 to-sky-50/40',
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        description: 'Scattered clouds throughout the sky',
        icon: CloudSun,
        colorClass: 'text-sky-500',
        bgGradient: 'from-sky-50/60 to-slate-50/40',
      };
    case 3:
      return {
        label: 'Overcast',
        description: 'Dense cloud cover',
        icon: Cloud,
        colorClass: 'text-slate-500',
        bgGradient: 'from-slate-100/70 to-zinc-50/40',
      };
    case 45:
    case 48:
      return {
        label: 'Foggy',
        description: 'Reduced visibility with depositing rime fog',
        icon: CloudFog,
        colorClass: 'text-teal-600',
        bgGradient: 'from-teal-50/60 to-slate-50/40',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: 'Drizzle',
        description: 'Light continuous mist and fine drizzle',
        icon: CloudDrizzle,
        colorClass: 'text-blue-500',
        bgGradient: 'from-blue-50/60 to-cyan-50/40',
      };
    case 56:
    case 57:
      return {
        label: 'Freezing Drizzle',
        description: 'Freezing light precipitation',
        icon: CloudDrizzle,
        colorClass: 'text-cyan-600',
        bgGradient: 'from-cyan-50/60 to-slate-50/40',
      };
    case 61:
    case 63:
    case 65:
      return {
        label: wmoCode === 65 ? 'Heavy Rain' : 'Rain',
        description: wmoCode === 65 ? 'Heavy continuous rainfall' : 'Moderate rainfall',
        icon: CloudRain,
        colorClass: 'text-blue-600',
        bgGradient: 'from-blue-100/60 to-sky-50/50',
      };
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        description: 'Sub-zero freezing rainfall',
        icon: CloudRain,
        colorClass: 'text-indigo-600',
        bgGradient: 'from-indigo-50/70 to-slate-50/40',
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        label: 'Snowfall',
        description: 'Flurries and snow accumulation',
        icon: CloudSnow,
        colorClass: 'text-sky-400',
        bgGradient: 'from-sky-50/80 to-blue-50/50',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'Showers',
        description: 'Passing rain showers',
        icon: CloudRain,
        colorClass: 'text-blue-600',
        bgGradient: 'from-blue-50/70 to-indigo-50/40',
      };
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        description: 'Intermittent snow shower squalls',
        icon: CloudSnow,
        colorClass: 'text-sky-500',
        bgGradient: 'from-sky-100/60 to-slate-50/40',
      };
    case 95:
    case 96:
    case 99:
      return {
        label: 'Thunderstorm',
        description: 'Electrical storm with lightning & gusty winds',
        icon: CloudLightning,
        colorClass: 'text-amber-600',
        bgGradient: 'from-amber-100/60 to-purple-50/50',
      };
    default:
      return {
        label: 'Fair',
        description: 'Typical atmospheric conditions',
        icon: Sun,
        colorClass: 'text-amber-500',
        bgGradient: 'from-amber-50/40 to-slate-50/30',
      };
  }
}

export function formatTemp(celsius: number, unit: TemperatureUnit): string {
  if (unit === 'fahrenheit') {
    const f = (celsius * 9) / 5 + 32;
    return `${Math.round(f)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatTempNumber(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatWindSpeed(kmh: number, unit: TemperatureUnit): string {
  if (unit === 'fahrenheit') {
    const mph = kmh * 0.621371;
    return `${Math.round(mph)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function formatRelativeTime(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return '1 min ago';
  if (diffMin < 60) return `${diffMin} mins ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

export function formatHourlyTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
  } catch {
    return isoString;
  }
}

export function formatDayOfWeek(isoDateString: string): { dayName: string; formattedDate: string } {
  try {
    const date = new Date(isoDateString + 'T00:00:00');
    const dayName = date.toLocaleDateString([], { weekday: 'short' });
    const formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return { dayName, formattedDate };
  } catch {
    return { dayName: isoDateString, formattedDate: '' };
  }
}

export function getUVIndexLevel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: 'Low', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (uv <= 5) return { label: 'Moderate', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  if (uv <= 7) return { label: 'High', color: 'text-orange-700 bg-orange-50 border-orange-200' };
  if (uv <= 10) return { label: 'Very High', color: 'text-red-700 bg-red-50 border-red-200' };
  return { label: 'Extreme', color: 'text-purple-700 bg-purple-50 border-purple-200' };
}
