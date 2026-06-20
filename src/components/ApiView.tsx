import React, { useState } from 'react';
import { apiEndpointsList, simState } from '../data/apiEndpoints';
import { ApiEndpoint } from '../types';
import {
  Send,
  Terminal,
  Key,
  Database,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export default function ApiView() {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('register');
  const [requestBodyVal, setRequestBodyVal] = useState<string>('');
  const [lastResponse, setLastResponse] = useState<{ status: number; body: any } | null>(null);
  const [serverStateVers, setServerStateVers] = useState<number>(0); // Trigger re-render of state tracking on actions

  const currentEndpoint =
    apiEndpointsList.find((e) => e.id === selectedEndpointId) || apiEndpointsList[0];

  // Set default body values on tab select
  React.useEffect(() => {
    if (currentEndpoint.requestBody?.schema) {
      const defaultObj: Record<string, any> = {};
      Object.entries(currentEndpoint.requestBody.schema).forEach(([k, v]) => {
        defaultObj[k] = v.example;
      });
      setRequestBodyVal(JSON.stringify(defaultObj, null, 2));
    } else {
      setRequestBodyVal('');
    }
    setLastResponse(null);
  }, [selectedEndpointId, currentEndpoint]);

  const handleSendRequest = () => {
    try {
      let bodyData = {};
      if (requestBodyVal) {
        bodyData = JSON.parse(requestBodyVal);
      }

      // Call custom simulator
      const result = currentEndpoint.simulationHandler(bodyData);
      setLastResponse(result);

      // Update global server-mock state trackers
      setServerStateVers((prev) => prev + 1);
    } catch (err: any) {
      setLastResponse({
        status: 400,
        body: {
          error: 'Payload syntax error. Make sure your JSON body is correctly formatted.',
          message: err.message,
        },
      });
    }
  };

  const handleFillDemoCreds = (email: string, pass: string) => {
    const demoPayload = { email, password: pass };
    setRequestBodyVal(JSON.stringify(demoPayload, null, 2));
  };

  return (
    <div className="flex flex-col xl:flex-row h-full overflow-hidden bg-[#020617]">
      {/* List of endpoints left column */}
      <div className="w-full xl:w-96 bg-[#0f172a] border-b xl:border-b-0 xl:border-r border-[#1e293b] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#1e293b] bg-slate-950/20">
          <h3 className="font-semibold text-white text-xs font-sans flex items-center space-x-1.5 leading-none">
            <Terminal className="h-4 w-4 text-[#10b981]" />
            <span>Endpoint Catalogs (OpenAPI)</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-sans mt-2">
            Explore and run functional mock HTTP endpoints.
          </p>
        </div>

        {/* Group endpoints by tags */}
        <div className="flex-grow overflow-y-auto p-3 space-y-4">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 font-mono px-2 block mb-2">
              Authentication Suite
            </span>
            <div className="space-y-1">
              {apiEndpointsList
                .filter((e) => e.tags.includes('Authentication'))
                .map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEndpointId(e.id)}
                    className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-all text-xs font-mono font-semibold cursor-pointer ${
                      selectedEndpointId === e.id
                        ? 'bg-slate-950/90 border border-[#10b981]/25 text-[#10b981]'
                        : 'text-slate-400 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] text-white shrink-0 font-sans font-bold uppercase ${
                        e.method === 'POST' ? 'bg-[#10b981]/90 text-slate-950' : 'bg-blue-600'
                      }`}
                    >
                      {e.method}
                    </span>
                    <span className="truncate">{e.path}</span>
                  </button>
                ))}
            </div>
          </div>

          <div>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 font-mono px-2 block mb-2">
              Password Management
            </span>
            <div className="space-y-1">
              {apiEndpointsList
                .filter((e) => e.tags.includes('Password Recovery'))
                .map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEndpointId(e.id)}
                    className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-all text-xs font-mono font-semibold cursor-pointer ${
                      selectedEndpointId === e.id
                        ? 'bg-slate-950/90 border border-[#10b981]/25 text-[#10b981]'
                        : 'text-slate-400 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <span className="px-1.5 py-0.5 bg-[#10b981]/90 text-slate-950 rounded text-[8px] shrink-0 font-sans font-bold uppercase">
                      {e.method}
                    </span>
                    <span className="truncate">{e.path}</span>
                  </button>
                ))}
            </div>
          </div>

          <div>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 font-mono px-2 block mb-2">
              Protected Services
            </span>
            <div className="space-y-1">
              {apiEndpointsList
                .filter(
                  (e) =>
                    !e.tags.includes('Authentication') && !e.tags.includes('Password Recovery'),
                )
                .map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEndpointId(e.id)}
                    className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-all text-xs font-mono font-semibold cursor-pointer ${
                      selectedEndpointId === e.id
                        ? 'bg-slate-950/90 border border-[#10b981]/25 text-[#10b981]'
                        : 'text-slate-400 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] text-white shrink-0 font-sans font-bold uppercase ${
                        e.method === 'GET' ? 'bg-blue-600' : 'bg-[#10b981]/90 text-slate-950'
                      }`}
                    >
                      {e.method}
                    </span>
                    <span className="truncate">{e.path}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Quick filling tools for ease of play */}
        <div className="p-4 border-t border-[#1e293b] bg-slate-950/40 shrink-0">
          <h4 className="text-[9px] text-[#10b981] font-bold uppercase tracking-wider font-mono mb-2">
            Helpful Demo Accounts
          </h4>
          <div className="space-y-1.5 text-xs">
            <button
              onClick={() => handleFillDemoCreds('admin@fortify.com', 'Password123!')}
              className="w-full flex justify-between p-2 rounded border border-[#1e293b] bg-[#020617] hover:bg-slate-900 font-sans text-left text-slate-200 cursor-pointer"
            >
              <span className="text-xs">🔑 Admin Template</span>
              <span className="font-mono text-emerald-400 text-[10px]">ADMIN</span>
            </button>
            <button
              onClick={() => handleFillDemoCreds('user@fortify.com', 'Password123!')}
              className="w-full flex justify-between p-2 rounded border border-[#1e293b] bg-[#020617] hover:bg-slate-900 font-sans text-left text-slate-200 cursor-pointer"
            >
              <span className="text-xs">🔑 User Template</span>
              <span className="font-mono text-emerald-400 text-[10px]">USER</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workspace editor and response console center */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden bg-[#020617]">
        {/* API Details Panel */}
        <div className="flex-grow p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-[#1e293b] flex flex-col justify-between">
          <div className="space-y-6">
            {/* Endpoint Badge Metadata Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1e293b]/60 pb-4">
              <div className="flex items-center space-x-2 font-mono text-[11px] font-extrabold max-w-full text-slate-350">
                <span
                  className={`px-2 py-0.5 rounded text-[9px] text-white uppercase ${
                    currentEndpoint.method === 'POST'
                      ? 'bg-[#10b981]/95 text-slate-950'
                      : 'bg-blue-600'
                  }`}
                >
                  {currentEndpoint.method}
                </span>
                <span className="text-white break-all">{currentEndpoint.path}</span>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] border border-[#1e293b] text-slate-450 rounded-full font-sans uppercase font-medium self-start sm:self-auto bg-slate-950/40">
                {currentEndpoint.tags[0]}
              </span>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-white text-base font-sans leading-tight">
                {currentEndpoint.summary}
              </h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {currentEndpoint.description}
              </p>
            </div>

            {/* Request parameters layout */}
            {currentEndpoint.requestBody && (
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-[#1e293b]">
                  <span className="text-xs font-bold font-sans text-white">
                    Request Body Editor
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    {currentEndpoint.requestBody.contentType}
                  </span>
                </div>
                <div className="min-h-[160px] relative border border-[#1e293b] rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[#10b981]/20">
                  <textarea
                    value={requestBodyVal}
                    onChange={(e) => setRequestBodyVal(e.target.value)}
                    className="w-full h-40 p-3 font-mono text-xs text-slate-200 bg-slate-950 focus:outline-none resize-none leading-relaxed"
                    placeholder="{}"
                  />
                </div>
              </div>
            )}

            {/* If has headers */}
            {currentEndpoint.requestHeaders && (
              <div className="space-y-3">
                <h5 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                  Required Header Overrides
                </h5>
                <div className="space-y-2">
                  {currentEndpoint.requestHeaders.map((h, i) => (
                    <div
                      key={i}
                      className="flex flex-col p-2.5 bg-slate-950/40 rounded-lg border border-[#1e293b]"
                    >
                      <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
                        <span>{h.name}</span>
                        <span className="text-emerald-400 font-normal">({h.type})</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">{h.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-[#1e293b] flex items-center justify-between">
            <button
              onClick={handleSendRequest}
              className="px-5 py-2.5 bg-[#1e293b] hover:bg-slate-800 text-[#10b981] font-bold border border-[#1e293b]/80 rounded-lg shadow-sm transition-all flex items-center space-x-2 text-xs cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Send Request</span>
            </button>
            <span className="text-[10px] text-slate-500 font-mono">SIMULATION MODE ACTIVE</span>
          </div>
        </div>

        {/* Real-Time Responses Console and Simulated DB State */}
        <div className="w-full md:w-[480px] bg-[#0f172a] text-slate-300 overflow-y-auto flex flex-col justify-between p-6 shadow-2xl relative shrink-0 border-t md:border-t-0 md:border-l border-[#1e293b]">
          <div className="space-y-6">
            {/* Headers Console */}
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <span className="text-xs text-[#10b981] font-mono font-bold flex items-center space-x-1.5">
                <Terminal className="h-4 w-4" />
                <span>Console Response</span>
              </span>
              {lastResponse && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold border uppercase ${
                    lastResponse.status < 300
                      ? 'bg-emerald-950/40 border-[#10b981]/35 text-emerald-400'
                      : 'bg-rose-950/40 border-rose-905 text-red-400'
                  }`}
                >
                  HTTP {lastResponse.status}
                </span>
              )}
            </div>

            {/* Display JSON responses */}
            <div className="min-h-[180px] p-4 bg-slate-950 rounded-xl border border-[#1e293b] font-mono text-xs overflow-auto text-slate-350 select-text leading-relaxed">
              {lastResponse ? (
                <pre>{JSON.stringify(lastResponse.body, null, 2)}</pre>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-center text-slate-500 select-none space-y-2">
                  <PlayCircleIcon className="h-8 w-8 text-slate-700 animate-pulse" />
                  <p className="text-[11px] text-slate-400">
                    Console is passive. Push "Send Request" to trigger simulation codes.
                  </p>
                </div>
              )}
            </div>

            {/* Interactive State HUD (Live Server State Visualization) */}
            <div className="border-t border-[#1e293b] pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5 font-sans">
                  <Database className="h-4 w-4 text-emerald-400" />
                  <span>Interactive Server States</span>
                </span>
                <span className="text-[10px] bg-slate-950 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono border border-[#1e293b]">
                  {simState.registeredUsers.length} Users
                </span>
              </div>

              {/* Verified identities list */}
              <div className="space-y-2">
                <span className="text-[9px] text-[#64748b] font-mono font-bold block uppercase tracking-wider">
                  Stored Database Users:
                </span>
                <div className="grid grid-cols-1 gap-1.5 max-h-24 overflow-y-auto">
                  {simState.registeredUsers.map((u, i) => (
                    <div
                      key={i}
                      className="px-2.5 py-1.5 bg-slate-950 border border-[#1e293b] rounded flex items-center justify-between text-[11px] font-mono"
                    >
                      <span className="truncate max-w-[200px] text-slate-300">{u.email}</span>
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`px-1 py-0.2 text-[8px] font-sans font-bold uppercase rounded ${
                            u.role === 'ADMIN'
                              ? 'bg-emerald-950/60 text-[#10b981] border border-[#10b981]/30'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {u.role}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 text-[8px] font-sans font-bold uppercase rounded ${
                            u.isVerified
                              ? 'bg-emerald-955/75 text-[#10b981]'
                              : 'bg-amber-955/75 text-amber-500'
                          }`}
                        >
                          {u.isVerified ? 'verified' : 'pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sessions status */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-[#1e293b] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-sans text-slate-200 font-semibold">
                      Active Session Identity
                    </div>
                    <div className="text-[10px] text-slate-450 mt-0.5">
                      {simState.currentUser
                        ? simState.currentUser.email
                        : 'No Active Session (Guest)'}
                    </div>
                  </div>
                </div>
                {simState.currentUser && (
                  <span className="px-1.5 py-0.5 bg-emerald-950/60 text-[#10b981] rounded text-[8px] font-mono font-bold uppercase tracking-wider border border-[#10b981]/20">
                    LOGGED IN
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[#1e293b] pt-4 flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>DATABASE FLUID SYNCS</span>
            <span>REST API METRICS VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon fallbacks inside JSX
function PlayCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}
