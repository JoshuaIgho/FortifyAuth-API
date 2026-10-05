import React, { useState, useEffect } from 'react';
import {
  Plus,
  Check,
  Trash2,
  Calendar,
  Clipboard,
  CheckCircle2,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { requestApi } from '../utils/apiClient';

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  secretReveal?: string;
  scopes: string[];
  isActive: boolean;
  createdAt: string;
}

export default function KeyManagerView() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read:users']);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [createdNotification, setCreatedNotification] = useState<string | null>(null);

  const availableScopes = [
    { id: 'read:users', desc: 'Read tenant profile indexes' },
    { id: 'write:users', desc: 'Modify tenant profiles' },
    { id: 'write:deployments', desc: 'Trigger horizontal cluster deployments' },
    { id: 'write:billing', desc: 'Alter client ledger payments' },
  ];

  const fetchKeys = async () => {
    setLoading(true);
    setError(null);
    const res = await requestApi('/api/v1/api-keys');
    setLoading(false);

    if (res.status === 200 && Array.isArray(res.data.data)) {
      setKeys(res.data.data);
    } else {
      setError(
        res.data.message ||
          'Authentication required to manage API keys. Please log in via Auth Gateway.',
      );
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleToggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId],
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreating(true);
    const res = await requestApi('/api/v1/api-keys', {
      method: 'POST',
      body: {
        name: newKeyName,
        scopes: selectedScopes,
      },
    });
    setCreating(false);

    if (res.status === 201 && res.data.data) {
      const { apiKey, secretReveal } = res.data.data;
      const createdItem: ApiKeyItem = {
        ...apiKey,
        secretReveal,
      };

      setKeys((prev) => [createdItem, ...prev]);
      setNewKeyName('');
      setSelectedScopes(['read:users']);
      setCreatedNotification(
        `Successfully provisioned API Key! Record token carefully (only revealed once): ${secretReveal}`,
      );
    } else {
      setCreatedNotification(`Failed to create API key: ${res.data.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const res = await requestApi(`/api/v1/api-keys/${id}`, { method: 'DELETE' });
    if (res.status === 200) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
      setCreatedNotification(
        `Permanently revoked and purged API credential "${name}" from PostgreSQL database.`,
      );
    } else {
      setCreatedNotification(`Failed to revoke key: ${res.data.message || 'Unknown error'}`);
    }
  };

  const handleCopy = (id: string, code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="p-6 bg-[#020617] h-full overflow-y-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold tracking-tight text-white flex items-center space-x-2">
          <Clipboard className="h-4.5 w-4.5 text-[#10b981]" />
          <span>SaaS API Keys & Scopes Manager</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Spawn, authenticate, and manage prefix-hashed developer keys with role-based fine granular
          access scopes.
        </p>
      </div>

      {/* Error state if unauthenticated */}
      {error && (
        <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl text-amber-300 text-xs flex items-start gap-2">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-400" />
          <p className="font-sans leading-normal">{error}</p>
        </div>
      )}

      {/* Dynamic Action Notification */}
      {createdNotification && (
        <div className="p-4 bg-emerald-950/25 border border-[#10b981]/15 rounded-xl text-emerald-300 text-xs flex items-start justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5 text-[#10b981]" />
            <p className="font-mono leading-normal break-all select-all">{createdNotification}</p>
          </div>
          <button
            onClick={() => setCreatedNotification(null)}
            className="text-[10px] uppercase font-mono text-slate-500 hover:text-slate-300 font-bold shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: Creation form on left, Active Keys list on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Create Key Form */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono border-b border-[#1e293b]/60 pb-3 flex items-center space-x-2">
            <Plus className="h-4 w-4 text-[#10b981]" />
            <span>Generate Scoped Token</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-4 font-sans text-xs">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Credential Name
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Analytics Downstream Link"
                className="w-full bg-slate-950 border border-[#1e293b] rounded-lg p-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-[#10b981]"
              />
            </div>

            {/* Scopes Multiselect */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Access Scopes
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {availableScopes.map((scope) => {
                  const isChecked = selectedScopes.includes(scope.id);
                  return (
                    <div
                      key={scope.id}
                      onClick={() => handleToggleScope(scope.id)}
                      className={`p-2.5 rounded-lg border text-[11px] font-sans transition-all cursor-pointer flex items-start space-x-2.5 ${
                        isChecked
                          ? 'border-[#10b981]/30 bg-emerald-950/10 text-emerald-300'
                          : 'border-[#1e293b] bg-slate-950/50 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <button type="button" className="mt-0.5 shrink-0 cursor-pointer">
                        {isChecked ? (
                          <Check className="h-4 w-4 text-[#10b981] font-bold" />
                        ) : (
                          <div className="h-4 w-4 rounded border border-[#1e293b] bg-slate-950" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-white block text-[10px]">
                          {scope.id}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5 leading-normal">
                          {scope.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 bg-[#10b981] hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs leading-none transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>SPAWN NEW CREDENTIAL</span>
            </button>
          </form>
        </div>

        {/* Right Side: Keys List Table */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono border-b border-[#1e293b]/60 pb-3">
            Active Workspace API Keys ({keys.length})
          </h3>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="h-7 w-7 text-[#10b981] animate-spin" />
              <span className="text-xs font-mono">Loading API keys from backend...</span>
            </div>
          ) : (
            <div className="space-y-4 font-sans text-xs">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="p-4 bg-slate-950 border border-[#1e293b] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Details info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center space-x-2.5">
                      <h4 className="font-bold text-white text-sm truncate">{key.name}</h4>
                      <span className="px-1.5 py-0.2 rounded bg-[#1e293b] border border-[#1e293b] text-[8px] font-mono text-[#10b981] font-bold uppercase tracking-wider">
                        ACTIVE
                      </span>
                    </div>

                    {/* Masked code */}
                    <div className="flex items-center space-x-2 font-mono text-[10px]">
                      <span className="text-slate-500">PREFIX:</span>
                      <span className="text-emerald-450 bg-slate-900/60 px-1.5 py-0.5 rounded border border-[#1e293b]/40">
                        {key.prefix}
                      </span>
                      {key.secretReveal && (
                        <button
                          onClick={() => handleCopy(key.id, key.secretReveal)}
                          className="text-slate-500 hover:text-white transition-all cursor-pointer flex items-center space-x-1"
                          title="Copy raw token key copy"
                        >
                          <Clipboard className="h-3.5 w-3.5" />
                          <span>{copiedKeyId === key.id ? 'Copied!' : 'Copy Secret'}</span>
                        </button>
                      )}
                    </div>

                    {/* Map Scopes */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {key.scopes.map((sc, index) => (
                        <span
                          key={index}
                          className="px-1.5 py-0.2 bg-slate-950 border border-[#1e293b] text-[8px] font-mono text-slate-400 rounded-md"
                        >
                          {sc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Date and Delete actions column */}
                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-[#1e293b] pt-3 sm:pt-0 shrink-0">
                    <div className="flex items-center space-x-1 font-mono text-[9px] text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Created:{' '}
                        {typeof key.createdAt === 'string'
                          ? key.createdAt.split('T')[0]
                          : new Date(key.createdAt).toISOString().split('T')[0]}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(key.id, key.name)}
                      className="px-2 py-1 text-rose-500 hover:text-white hover:bg-rose-950/40 rounded transition-all cursor-pointer border border-transparent hover:border-rose-900/30 font-mono text-[10px]"
                    >
                      <Trash2 className="h-3.5 w-3.5 inline mr-1" />
                      Revoke
                    </button>
                  </div>
                </div>
              ))}

              {keys.length === 0 && !error && (
                <div className="p-8 border border-dashed border-[#1e293b] rounded-xl text-center space-y-2.5 text-slate-550 select-none">
                  <ShieldAlert className="h-7 w-7 text-slate-600 mx-auto" />
                  <h4 className="text-xs font-bold text-white">No API Credentials Configured</h4>
                  <p className="text-[10px] text-slate-400 font-sans max-w-sm mx-auto">
                    Use the form on the left to spawn new scoped API credentials in PostgreSQL.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
