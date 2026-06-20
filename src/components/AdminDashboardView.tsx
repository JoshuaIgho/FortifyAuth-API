import React, { useState } from 'react';
import { Shovel as ShieldAlert, TrendingUp, Users, Terminal, RefreshCw, Activity, Sparkles, Ban } from 'lucide-react';

export default function AdminDashboardView() {
  const [refreshCount, setRefreshCount] = useState(0);

  // Dynamic values that bounce on refresh to simulate active telemetry
  const activeThrottles = 14 + (refreshCount % 5);
  const activeSessions = 1142 + (refreshCount * 7 % 15);
  const authRate = 99.987 + (refreshCount * 0.001 % 0.008);
  const suspiciousCount = 2 + (refreshCount * 2 % 7);

  const simulateRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  return (
    <div className="p-6 bg-[#020617] h-full overflow-y-auto space-y-6">
      
      {/* Metrics Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white flex items-center space-x-2">
            <Activity className="h-4.5 w-4.5 text-[#10b981]" />
            <span>Operational Admin and Threat Telemetry Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time status tracking of all user sign-in paths across geographical server clusters.</p>
        </div>

        <button
          onClick={simulateRefresh}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1e293b] hover:bg-slate-800 text-[#10b981] font-semibold border border-[#1e293b] rounded-md transition-all text-xs cursor-pointer focus:outline-none"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshCount ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Grid of 4 numeric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="p-5 bg-[#0f172a] border border-[#1e293b] rounded-xl flex items-start gap-4 shadow-xl">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-[#10b981]/15 text-[#10b981]">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">ACTIVE PROXY SESSIONS</span>
            <span className="text-xl font-mono font-extrabold text-white block mt-1">{activeSessions}</span>
            <span className="text-[9px] text-[#10b981] font-sans block mt-0.5">↑ 12% Since yesterday</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 bg-[#0f172a] border border-[#1e293b] rounded-xl flex items-start gap-4 shadow-xl">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-[#10b981]/15 text-[#10b981]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">AUTH PIPELINE UPTIME</span>
            <span className="text-xl font-mono font-extrabold text-white block mt-1">{authRate.toFixed(3)}%</span>
            <span className="text-[9px] text-slate-400 font-sans block mt-0.5">N+2 High-Availability Active</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 bg-[#0f172a] border border-[#1e293b] rounded-xl flex items-start gap-4 shadow-xl">
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/30 text-[#f43f5e]">
            <Ban className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">IP ADDR BLACKLISTS</span>
            <span className="text-xl font-mono font-extrabold text-white block mt-1">{activeThrottles}</span>
            <span className="text-[9px] text-rose-400 font-sans block mt-0.5">Blocked via Redis Rate-Limiter</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 bg-[#0f172a] border border-[#1e293b] rounded-xl flex items-start gap-4 shadow-xl">
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-900/30 text-amber-500">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">SUSPICIOUS ACTIVITIES</span>
            <span className="text-xl font-mono font-extrabold text-white block mt-1">{suspiciousCount}</span>
            <span className="text-[9px] text-amber-400 font-sans block mt-0.5">Requires audit compliance check</span>
          </div>
        </div>

      </div>

      {/* Visual Telemetry Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Threat Map / Throughput Simulation */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#1e293b]/60 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4.5 w-4.5 text-[#10b981]" />
              <h3 className="font-bold text-white text-[11px] uppercase tracking-wider font-mono">Real-Time Access Log Monitor</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-[#10b981] text-[9px] font-mono font-bold animate-pulse">
              ● SYNCED LIVE
            </span>
          </div>

          <div className="space-y-3 font-mono text-[10px] leading-relaxed">
            
            {/* Log item 1 */}
            <div className="p-3 rounded bg-slate-950 border border-[#1e293b]/40 flex flex-col md:flex-row md:items-center justify-between gap-2 text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="text-[#10b981] font-bold">[ACC-GRANTED]</span>
                <span className="text-slate-400">2026-06-20 03:22:10</span>
                <span>User: dev_carter_90a</span>
              </div>
              <div className="flex space-x-2 text-[9px] text-slate-500">
                <span>IP: 198.51.100.41</span>
                <span>Paris, FR</span>
              </div>
            </div>

            {/* Log item 2 */}
            <div className="p-3 rounded bg-slate-950 border border-[#1e293b]/40 flex flex-col md:flex-row md:items-center justify-between gap-2 text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="text-rose-400 font-bold">[RAT-BLOCKED]</span>
                <span className="text-slate-400">2026-06-20 03:21:44</span>
                <span className="text-rose-300">Auth attempts limit breached (failed dictionary)</span>
              </div>
              <div className="flex space-x-2 text-[9px] text-slate-500">
                <span>IP: 185.190.141.2</span>
                <span>Amsterdam, NL</span>
              </div>
            </div>

            {/* Log item 3 */}
            <div className="p-3 rounded bg-slate-950 border border-[#1e293b]/40 flex flex-col md:flex-row md:items-center justify-between gap-2 text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="text-amber-400 font-bold">[SES-ROTATED]</span>
                <span className="text-slate-400">2026-06-20 03:19:02</span>
                <span>Single-use rotation (RTR) executed cleanly</span>
              </div>
              <div className="flex space-x-2 text-[9px] text-slate-500">
                <span>User: admin_officer_41</span>
                <span>San Jose, US</span>
              </div>
            </div>

            {/* Log item 4 */}
            <div className="p-3 rounded bg-slate-950 border border-[#1e293b]/40 flex flex-col md:flex-row md:items-center justify-between gap-2 text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="text-[#10b981] font-bold">[MFA-PASSWD]</span>
                <span className="text-slate-400">2026-06-20 03:15:33</span>
                <span>MFA TOTP code validated on physical device</span>
              </div>
              <div className="flex space-x-2 text-[9px] text-slate-500">
                <span>IP: 203.0.113.82</span>
                <span>Sydney, AU</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right 1 Column: Compliance status visualization */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 space-y-4 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-[#1e293b]/60 pb-3 mb-4">
              <Sparkles className="h-4 w-4 text-[#10b981]" />
              <h3 className="font-bold text-white text-[11px] uppercase tracking-wider font-mono">Operational Metrics Gauges</h3>
            </div>

            <div className="space-y-4">
              
              {/* Gauge 1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-sans">
                  <span className="text-slate-400">Average Verification Latency</span>
                  <span className="font-mono text-[#10b981] font-bold">24.5 ms</span>
                </div>
                <div className="h-1.5 w-full bg-slate-955 rounded-full overflow-hidden border border-[#1e293b]">
                  <div className="h-full bg-[#10b981] rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              {/* Gauge 2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-sans">
                  <span className="text-slate-400">Redis Cache Hit Intensity</span>
                  <span className="font-mono text-[#10b981] font-bold">94.8%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-955 rounded-full overflow-hidden border border-[#1e293b]">
                  <div className="h-full bg-[#10b981] rounded-full" style={{ width: '94.8%' }} />
                </div>
              </div>

              {/* Gauge 3 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-sans">
                  <span className="text-slate-400">CPU Compute Load (3 Operational Nodes)</span>
                  <span className="font-mono text-[#10b981] font-bold">34.1%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-955 rounded-full overflow-hidden border border-[#1e293b]">
                  <div className="h-full bg-[#10b981] rounded-full" style={{ width: '34.1%' }} />
                </div>
              </div>

              {/* Gauge 4 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-sans">
                  <span className="text-slate-400">Database Connection Pool Depth</span>
                  <span className="font-mono text-[#10b981] font-bold">12 / 100</span>
                </div>
                <div className="h-1.5 w-full bg-slate-955 rounded-full overflow-hidden border border-[#1e293b]">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

            </div>
          </div>

          <div className="bg-slate-950 border border-[#1e293b] rounded-lg p-3.5 space-y-1.5 font-sans text-[10px] text-slate-450 mt-4">
            <span className="font-extrabold text-white uppercase block">High Availability cluster summary</span>
            <p className="leading-normal">
              Nodes are distributed horizontally across three primary AWS Availability Zones. Redis-Cluster replication retains transient structures, supporting fast disaster recovery with zero authentication state losses.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
