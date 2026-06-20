import React, { useState } from 'react';
import {
  Network,
  Smartphone,
  Laptop,
  Trash2,
  MapPin,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

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
  const [sessions, setSessions] = useState<SessionItem[]>([
    {
      id: 'fa_ses_01',
      deviceModel: 'MacBook Pro 16" (macOS Ventura)',
      type: 'laptop',
      ipAddress: '198.51.100.42',
      location: 'Paris, France',
      lastActive: 'Active Now',
      isCurrent: true,
    },
    {
      id: 'fa_ses_02',
      deviceModel: 'iPhone 15 Pro (iOS 17.2)',
      type: 'smartphone',
      ipAddress: '198.51.100.201',
      location: 'Marseille, France',
      lastActive: '12 minutes ago',
      isCurrent: false,
    },
    {
      id: 'fa_ses_03',
      deviceModel: 'ThinkPad T14 (Ubuntu 22.04 LTS)',
      type: 'laptop',
      ipAddress: '203.0.113.119',
      location: 'Lyon, France',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
    {
      id: 'fa_ses_04',
      deviceModel: 'iPad Air (iPadOS 17.0)',
      type: 'smartphone',
      ipAddress: '203.0.113.44',
      location: 'Bordeaux, France',
      lastActive: 'Yesterday',
      isCurrent: false,
    },
  ]);

  const [toast, setToast] = useState<string | null>(null);

  const handleRevoke = (id: string, model: string) => {
    // Filter out the session
    setSessions((prev) => prev.filter((sess) => sess.id !== id));
    setToast(`Cryptographically revoked and blacklisted JTI session for "${model}" inside Redis.`);

    // Auto-clear toast
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
            Audit active logins, view geographic connection roots, and instantly evict compromised
            entities from the Redis cache.
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

      {/* Main sessions rendering */}
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
                  {sess.lastActive}
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

        {sessions.length === 1 && (
          <div className="p-8 border border-dashed border-[#1e293b] rounded-xl text-center md:col-span-2 space-y-2.5">
            <ShieldAlert className="h-6 w-6 text-amber-500 mx-auto" />
            <h4 className="text-xs font-bold text-white">No Secondary Active Sessions Detected</h4>
            <p className="text-[10px] font-sans text-slate-500 max-w-sm mx-auto">
              All other connected physical devices have been successfully evicted and their token
              footprints blacklisted in your Redis session layers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
