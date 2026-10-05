import React, { useState, useEffect } from 'react';
import {
  Network,
  Smartphone,
  Laptop,
  Trash2,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { requestApi } from '../utils/apiClient';

interface SessionItem {
  id: string;
  deviceModel: string;
  type: 'laptop' | 'smartphone';
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function SessionManagerView() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    const res = await requestApi('/api/v1/sessions');
    setLoading(false);

    if (res.status === 200 && Array.isArray(res.data.data)) {
      setSessions(res.data.data);
    } else {
      setError(
        res.data.message ||
          'Authentication required to manage active sessions. Please log in via Auth Gateway.',
      );
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id: string, model: string) => {
    const res = await requestApi(`/api/v1/sessions/${id}`, { method: 'DELETE' });
    if (res.status === 200) {
      setSessions((prev) => prev.filter((sess) => sess.id !== id));
      setToast(`Cryptographically revoked session "${model}" in database.`);
    } else {
      setToast(`Failed to revoke session: ${res.data.message || 'Unknown error'}`);
    }

    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <div className="p-6 bg-[#020617] h-full overflow-y-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white flex items-center space-x-2">
            <Network className="h-4.5 w-4.5 text-[#10b981]" />
            <span>Active Cryptographic Session Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit active logins, view connection origins, and revoke compromised device sessions
            from backend storage.
          </p>
        </div>
      </div>

      {/* Revocation Alert Toast */}
      {toast && (
        <div className="p-4 bg-emerald-950/20 border border-[#10b981]/15 rounded-xl text-emerald-300 text-xs flex items-start gap-2 animate-fadeIn transition-all">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <p className="font-sans leading-normal">{toast}</p>
        </div>
      )}

      {/* Error state if unauthenticated */}
      {error && (
        <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl text-amber-300 text-xs flex items-start gap-2">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-400" />
          <p className="font-sans leading-normal">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="h-7 w-7 text-[#10b981] animate-spin" />
          <span className="text-xs font-mono">Loading active sessions from backend...</span>
        </div>
      ) : (
        /* Main sessions rendering */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all relative ${
                sess.isCurrent
                  ? 'border-[#10b981]/50 bg-[#0f172a] shadow-[0_0_20px_rgba(16,185,129,0.03)]'
                  : 'border-[#1e293b] bg-[#0f172a]/40 hover:bg-slate-900/40'
              }`}
            >
              {/* Top Indicator */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div
                    className={`h-11 w-11 rounded-lg flex items-center justify-center border shrink-0 ${
                      sess.isCurrent
                        ? 'bg-emerald-950/40 border-[#10b981]/20 text-[#10b981]'
                        : 'bg-slate-950 border-[#1e293b] text-slate-450'
                    }`}
                  >
                    {sess.type === 'laptop' ? (
                      <Laptop className="h-5 w-5" />
                    ) : (
                      <Smartphone className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-white text-xs font-sans truncate">
                        {sess.deviceModel}
                      </h3>
                      {sess.isCurrent && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-[#10b981]/30 text-[8px] font-mono text-[#10b981] font-bold">
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1.5 leading-normal">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      <span>
                        {sess.location} &bull; {sess.ipAddress}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom details and revoke button */}
              <div className="mt-5 pt-4 border-t border-[#1e293b]/60 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-slate-500 font-sans block">Last Synchronization</span>
                  <span className="font-mono font-bold text-slate-300 mt-0.5 block">
                    {typeof sess.lastActive === 'string'
                      ? new Date(sess.lastActive).toLocaleString()
                      : 'Active Now'}
                  </span>
                </div>

                {!sess.isCurrent && (
                  <button
                    onClick={() => handleRevoke(sess.id, sess.deviceModel)}
                    className="px-3 py-1.5 bg-rose-950/20 hover:bg-rose-900/20 text-[#f43f5e] font-bold border border-rose-900/35 rounded-lg text-[10px] cursor-pointer transition-all flex items-center space-x-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Revoke Access</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {sessions.length === 0 && !error && (
            <div className="p-8 border border-dashed border-[#1e293b] rounded-xl text-center md:col-span-2 space-y-2.5">
              <ShieldAlert className="h-6 w-6 text-amber-500 mx-auto" />
              <h4 className="text-xs font-bold text-white">No Active Sessions Found</h4>
              <p className="text-[10px] font-sans text-slate-500 max-w-sm mx-auto">
                Log in using the Auth Gateway to create an active device session in the database.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
