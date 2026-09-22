import { useState } from 'react';
import { X, Copy, Check, ExternalLink, Globe, Cpu, Clock, Terminal } from 'lucide-react';
import { ApiDebugInfo, WeatherPayload } from '../types';

interface ApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  debugInfo: ApiDebugInfo | null;
  weatherData: WeatherPayload | null;
}

export function ApiInspectorModal({
  isOpen,
  onClose,
  debugInfo,
  weatherData,
}: ApiInspectorModalProps) {
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<'overview' | 'raw_json'>('overview');

  if (!isOpen) return null;

  const handleCopyJson = () => {
    if (!weatherData) return;
    navigator.clipboard.writeText(JSON.stringify(weatherData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="api-inspector-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="api-inspector-dialog"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Public REST API Inspector
              </h3>
              <p className="text-xs text-slate-400">
                Live asynchronous response telemetry from Open-Meteo REST service
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-api-response-button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
            <button
              id="close-api-inspector-button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 px-6 border-b border-slate-800 bg-slate-950/50 text-xs font-medium">
          <button
            onClick={() => setViewTab('overview')}
            className={`py-2.5 border-b-2 transition cursor-pointer ${
              viewTab === 'overview'
                ? 'border-amber-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            HTTP Request Summary
          </button>
          <button
            onClick={() => setViewTab('raw_json')}
            className={`py-2.5 border-b-2 transition cursor-pointer ${
              viewTab === 'raw_json'
                ? 'border-amber-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Parsed JSON Payload
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 font-sans">
          {viewTab === 'overview' ? (
            <div className="space-y-4">
              {/* Endpoint Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    Target REST Endpoint
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
                    HTTP GET • 200 OK
                  </span>
                </div>
                <div className="font-mono text-xs text-sky-300 break-all bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  {debugInfo?.endpoint || 'https://api.open-meteo.com/v1/forecast?...'}
                </div>
                {debugInfo?.endpoint && (
                  <a
                    href={debugInfo.endpoint}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 pt-1"
                  >
                    <span>Open raw endpoint in new browser tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Response Latency</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {debugInfo?.latencyMs ? `${debugInfo.latencyMs} ms` : '--'}
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Status Code</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {debugInfo?.status ? `${debugInfo.status} ${debugInfo.statusText}` : '200 OK'}
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span>Observed Time</span>
                  </div>
                  <div className="text-sm font-semibold font-mono text-white mt-1">
                    {debugInfo?.timestamp || '--'}
                  </div>
                </div>
              </div>

              {/* Key Features verified */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Client-side REST Architecture Highlights
                </h4>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>Direct asynchronous <code className="text-amber-300">fetch()</code> with native Promise resolution</li>
                  <li>Request cancellation via <code className="text-amber-300">AbortController</code> on navigation and debounced city search</li>
                  <li>Automated 12-second network timeout guard with timeout fallback</li>
                  <li>Live <code className="text-amber-300">navigator.onLine</code> event handling for offline detection</li>
                  <li>Zero API secret leak risk — uses the open public Open-Meteo REST API</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="relative">
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[500px]">
                {JSON.stringify(weatherData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
