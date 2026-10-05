import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, ShieldAlert, KeyRound, Info, Loader2 } from 'lucide-react';
import { requestApi } from '../utils/apiClient';

interface AuditItem {
  id: string;
  userId?: string | null;
  action: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  description?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  payload?: any;
}

export default function AuditTimelineView() {
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    const res = await requestApi('/api/v1/admin/audit-logs');
    setLoading(false);

    if (res.status === 200 && Array.isArray(res.data.data)) {
      setLogs(res.data.data);
    } else {
      setError(
        res.data.message || 'Unable to fetch audit logs. Please ensure you are authenticated.',
      );
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Compute severity classification from action name or record if not explicitly provided
  const getSeverity = (action: string): 'INFO' | 'WARNING' | 'CRITICAL' => {
    if (
      action.includes('FAILED') ||
      action.includes('BREACH') ||
      action.includes('LOCKOUT') ||
      action.includes('REVOKED')
    ) {
      return 'CRITICAL';
    }
    if (action.includes('RESET') || action.includes('REVOCATION') || action.includes('EXPIRED')) {
      return 'WARNING';
    }
    return 'INFO';
  };

  // Filtering calculations
  const filteredLogs = logs.filter((log) => {
    const actionText = log.action || '';
    const descText = JSON.stringify(log.payload || '') + ' ' + (log.description || '');
    const ipText = log.ipAddress || '';

    const matchesSearch =
      actionText.toLowerCase().includes(search.toLowerCase()) ||
      descText.toLowerCase().includes(search.toLowerCase()) ||
      ipText.includes(search);

    const severity = log.severity || getSeverity(log.action);
    const matchesSeverity = filterSeverity === 'ALL' || severity === filterSeverity;
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
            operational event trails stored in PostgreSQL.
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

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl text-amber-300 text-xs flex items-start gap-2 max-w-5xl">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-400" />
          <p className="font-sans leading-normal">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-3 max-w-5xl">
          <Loader2 className="h-7 w-7 text-[#10b981] animate-spin" />
          <span className="text-xs font-mono">Loading audit logs from PostgreSQL...</span>
        </div>
      ) : (
        /* Logs timeline list container */
        <div className="space-y-4 max-w-5xl">
          {filteredLogs.map((log) => {
            const severity = log.severity || getSeverity(log.action);
            return (
              <div
                key={log.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start gap-4 transition-all bg-[#0f172a]/70 ${
                  severity === 'CRITICAL'
                    ? 'border-rose-900/40 hover:border-rose-900/60 shadow-[0_0_12px_rgba(244,63,94,0.02)]'
                    : severity === 'WARNING'
                      ? 'border-amber-900/35 hover:border-amber-900/50'
                      : 'border-[#1e293b] hover:border-[#1e293b]/85'
                }`}
              >
                {/* Status icon indicators columns */}
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    severity === 'CRITICAL'
                      ? 'bg-rose-950/40 border-rose-900/30 text-rose-450'
                      : severity === 'WARNING'
                        ? 'bg-amber-950/40 border-amber-900/30 text-amber-500'
                        : 'bg-emerald-950/40 border-emerald-950 text-[#10b981]'
                  }`}
                >
                  {severity === 'CRITICAL' ? (
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
                        severity === 'CRITICAL'
                          ? 'bg-rose-950/40 text-rose-400 border border-rose-900/40'
                          : severity === 'WARNING'
                            ? 'bg-amber-950/40 text-amber-500 border border-amber-900/40'
                            : 'bg-emerald-950/45 text-emerald-300 border border-emerald-900/20'
                      }`}
                    >
                      {severity}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono ml-auto shrink-0">
                      {typeof log.createdAt === 'string'
                        ? new Date(log.createdAt).toLocaleString()
                        : new Date(log.createdAt).toISOString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-350 leading-relaxed font-sans">
                    {log.description ||
                      (log.payload
                        ? JSON.stringify(log.payload)
                        : 'Action recorded in audit trail.')}
                  </p>

                  {/* Access origins block */}
                  <div className="pt-2 flex flex-wrap gap-4 text-[10px] text-slate-500 font-mono border-t border-[#1e293b]/40 mt-1.5">
                    <div>
                      IP: <span className="text-slate-350">{log.ipAddress || '127.0.0.1'}</span>
                    </div>
                    <div className="truncate max-w-xs md:max-w-md">
                      UA: <span className="text-slate-350">{log.userAgent || 'unknown'}</span>
                    </div>
                    {log.userId && (
                      <div>
                        User: <span className="text-slate-350">{log.userId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredLogs.length === 0 && !error && (
            <div className="p-12 border border-dashed border-[#1e293b] rounded-xl text-center space-y-2 text-slate-500 max-w-5xl select-none">
              <Info className="h-6 w-6 text-slate-500 mx-auto" />
              <h4 className="font-bold text-white text-xs">
                No Audit Logs Match Filter Coordinates
              </h4>
              <p className="text-[10px] text-slate-400 font-sans">
                Expand search parameters or perform actions in Auth Gateway to generate real audit
                logs.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
