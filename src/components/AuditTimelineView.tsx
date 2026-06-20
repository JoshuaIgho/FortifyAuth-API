import React, { useState } from 'react';
import {
  Shovel as LogActivity,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Info,
} from 'lucide-react';

interface AuditItem {
  id: string;
  userId: string;
  action: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export default function AuditTimelineView() {
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const logs: AuditItem[] = [
    {
      id: 'log_01',
      userId: 'usr_4480e_fba02',
      action: 'USER_LOGIN_MFA_SUCCESS',
      severity: 'INFO',
      description: 'Two-factor step-up authentication successful via TOTP hardware token.',
      ipAddress: '198.51.100.42',
      userAgent: 'Chrome v122 on macOS Sonoma',
      createdAt: '2026-06-20 03:22:10',
    },
    {
      id: 'log_02',
      userId: 'usr_unknown',
      action: 'BRUTE_FORCE_LOCKOUT_TRIGGERED',
      severity: 'CRITICAL',
      description:
        'IP rate limit breached after 5 consecutive password mismatches. Account set to force-locked status.',
      ipAddress: '185.190.141.2',
      userAgent: 'Python-requests/2.31',
      createdAt: '2026-06-20 03:21:44',
    },
    {
      id: 'log_03',
      userId: 'usr_admin_41',
      action: 'API_KEY_CREATED',
      severity: 'INFO',
      description:
        'Spawned API live credential with scope list: ["read:users", "write:deployments"].',
      ipAddress: '203.0.113.82',
      userAgent: 'PostmanRuntime/7.36',
      createdAt: '2026-06-20 03:15:20',
    },
    {
      id: 'log_04',
      userId: 'usr_carter_90a',
      action: 'PASSWORD_RESET_REQUESTED',
      severity: 'WARNING',
      description:
        'Enqueued password reset token inside background worker (BullMQ SMTP resend processor).',
      ipAddress: '198.51.100.42',
      userAgent: 'Firefox v123 on macOS Sonoma',
      createdAt: '2026-06-20 02:44:02',
    },
    {
      id: 'log_05',
      userId: 'usr_4480e_fba02',
      action: 'SESSION_REVOCATION_API',
      severity: 'WARNING',
      description: 'Evicted session "fa_ses_02" and blacklisted token JTIs within the Redis cache.',
      ipAddress: '198.51.100.42',
      userAgent: 'Chrome v122 on macOS Sonoma',
      createdAt: '2026-06-19 23:10:05',
    },
  ];

  // Filtering calculations
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.includes(search);
    const matchesSeverity = filterSeverity === 'ALL' || log.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="p-6 bg-[#020617] h-full overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white flex items-center space-x-2">
            <KeyRound className="h-4.5 w-4.5 text-[#10b981]" />
            <span>Immutable Compliance Audit Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time log stream showing administrative actions, security transitions, and
            operational event trails.
          </p>
        </div>
      </div>

      {/* Grid: Search and filters bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0f172a] border border-[#1e293b] p-3 rounded-lg max-w-5xl">
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or log descriptions..."
            className="w-full bg-slate-950 border border-[#1e293b] rounded-lg p-2 pl-9 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-[#10b981]"
          />
        </div>

        {/* Severity filter selector */}
        <div className="flex items-center space-x-2 shrink-0">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
            Severity:
          </span>
          <div className="flex border border-[#1e293b] bg-slate-950 p-1 rounded-md text-[10px] font-semibold text-slate-400">
            {['ALL', 'INFO', 'WARNING', 'CRITICAL'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-[#1e293b] text-[#10b981] font-bold'
                    : 'hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs timeline list container */}
      <div className="space-y-4 max-w-5xl">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start gap-4 transition-all bg-[#0f172a]/70 ${
              log.severity === 'CRITICAL'
                ? 'border-rose-900/40 hover:border-rose-900/60 shadow-[0_0_12px_rgba(244,63,94,0.02)]'
                : log.severity === 'WARNING'
                  ? 'border-amber-900/35 hover:border-amber-900/50'
                  : 'border-[#1e293b] hover:border-[#1e293b]/85'
            }`}
          >
            {/* Status icon indicators columns */}
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
                log.severity === 'CRITICAL'
                  ? 'bg-rose-950/40 border-rose-900/30 text-rose-450'
                  : log.severity === 'WARNING'
                    ? 'bg-amber-950/40 border-amber-900/30 text-amber-500'
                    : 'bg-emerald-950/40 border-emerald-950 text-[#10b981]'
              }`}
            >
              {log.severity === 'CRITICAL' ? (
                <ShieldAlert className="h-5 w-5" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>

            {/* Log specifics text layout */}
            <div className="flex-grow space-y-1 min-w-0 font-sans">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-white break-all">
                  {log.action}
                </span>
                <span
                  className={`text-[8px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.2 rounded ${
                    log.severity === 'CRITICAL'
                      ? 'bg-rose-950/40 text-rose-400 border border-rose-900/40'
                      : log.severity === 'WARNING'
                        ? 'bg-amber-950/40 text-amber-500 border border-amber-900/40'
                        : 'bg-emerald-950/45 text-emerald-300 border border-emerald-900/20'
                  }`}
                >
                  {log.severity}
                </span>
                <span className="text-[10px] text-slate-500 font-mono ml-auto shrink-0">
                  {log.createdAt}
                </span>
              </div>

              <p className="text-xs text-slate-350 leading-relaxed font-sans">{log.description}</p>

              {/* Access origins block */}
              <div className="pt-2 flex flex-wrap gap-4 text-[10px] text-slate-500 font-mono border-t border-[#1e293b]/40 mt-1.5">
                <div>
                  IP: <span className="text-slate-350">{log.ipAddress}</span>
                </div>
                <div className="truncate max-w-xs md:max-w-md">
                  UA: <span className="text-slate-350">{log.userAgent}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="p-12 border border-dashed border-[#1e293b] rounded-xl text-center space-y-2 text-slate-500 max-w-5xl select-none">
            <Info className="h-6 w-6 text-slate-500 mx-auto" />
            <h4 className="font-bold text-white text-xs">No Audit Logs Match Filter Coordinates</h4>
            <p className="text-[10px] text-slate-400 font-sans">
              Expand metrics scopes, cancel search key characters or reset filter tabs to view logs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
