import React, { useState } from 'react';
import { Shovel as KeyCode, Plus, Check, Trash2, Calendar, Clipboard, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  secretReveal: string; // Exposed only once upon creation
  scopes: string[];
  isActive: boolean;
  createdAt: string;
}

export default function KeyManagerView() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([
    {
      id: 'fa_key_01',
      name: 'GitHub Deployment CI Gateway',
      prefix: 'fa_live_b48f9...',
      secretReveal: 'fa_live_b48f9aee210a56e208b04fdcc9',
      scopes: ['read:users', 'write:deployments'],
      isActive: true,
      createdAt: '2026-06-18',
    },
    {
      id: 'fa_key_02',
      name: 'Stripe Payment Ingress Webhook',
      prefix: 'fa_live_fa530...',
      secretReveal: 'fa_live_fa53099ea6e210fafc03efd208',
      scopes: ['write:billing'],
      isActive: true,
      createdAt: '2026-06-19',
    }
  ]);

  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read:users']);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [createdNotification, setCreatedNotification] = useState<string | null>(null);

  const availableScopes = [
    { id: 'read:users', desc: 'Read tenant profile indexes' },
    { id: 'write:users', desc: 'Modify tenant profiles' },
    { id: 'write:deployments', desc: 'Trigger horizontal cluster deployments' },
    { id: 'write:billing', desc: 'Alter client ledger payments' }
  ];

  const handleToggleScope = (scopeId: string) => {
    setSelectedScopes(prev => 
      prev.includes(scopeId) ? prev.filter(s => s !== scopeId) : [...prev, scopeId]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    // Simulate high entropy key generation
    const chars = 'abcdef1234567890';
    let suffix = '';
    for (let i = 0; i < 20; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const rawKey = `fa_live_${suffix}`;
    const truncatedPrefix = `${rawKey.substring(0, 12)}...`;

    const newKey: ApiKeyItem = {
      id: `fa_key_${Date.now()}`,
      name: newKeyName,
      prefix: truncatedPrefix,
      secretReveal: rawKey,
      scopes: [...selectedScopes],
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setKeys(prev => [newKey, ...prev]);
    setNewKeyName('');
    setSelectedScopes(['read:users']);
    setCreatedNotification(`Successfully provisioned API Key! Record token carefully (only revealed once): ${rawKey}`);
  };

  const handleDelete = (id: string, name: string) => {
    setKeys(prev => prev.filter(k => k.id !== id));
    setCreatedNotification(`Permanently revoked and purged API credential "${name}" from PostgreSQL indexes.`);
  };

  const handleCopy = (id: string, code: string) => {
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
        <p className="text-xs text-slate-400 mt-1">Spawn, authenticate, and manage prefix-hashed developer keys with role-based fine granular access scopes.</p>
      </div>

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
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Credential Name</label>
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
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Access Scopes</label>
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
                        <span className="font-mono font-bold text-white block text-[10px]">{scope.id}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5 leading-normal">{scope.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#10b981] hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs leading-none transition-all cursor-pointer"
            >
              SPAWN NEW CREDENTIAL
            </button>
          </form>
        </div>

        {/* Right Side: Keys List Table */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono border-b border-[#1e293b]/60 pb-3">
            Active Workspace API Keys ({keys.length})
          </h3>

          <div className="space-y-4 font-sans text-xs">
            {keys.map((key) => (
              <div key={key.id} className="p-4 bg-slate-950 border border-[#1e293b] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
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
                    <span className="text-emerald-450 bg-slate-900/60 px-1.5 py-0.5 rounded border border-[#1e293b]/40">{key.prefix}</span>
                    <button
                      onClick={() => handleCopy(key.id, key.secretReveal)}
                      className="text-slate-500 hover:text-white transition-all cursor-pointer"
                      title="Copy raw token key copy"
                    >
                      {copiedKeyId === key.id ? 'Copied!' : < Clipboard className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Map Scopes */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {key.scopes.map((sc, index) => (
                      <span key={index} className="px-1.5 py-0.2 bg-slate-950 border border-[#1e293b] text-[8px] font-mono text-slate-400 rounded-md">
                        {sc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Date and Delete actions column */}
                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-[#1e293b] pt-3 sm:pt-0 shrink-0">
                  <div className="flex items-center space-x-1 font-mono text-[9px] text-slate-500">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {key.createdAt}</span>
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

            {keys.length === 0 && (
              <div className="p-8 border border-dashed border-[#1e293b] rounded-xl text-center space-y-2.5 text-slate-550 select-none">
                <ShieldAlert className="h-7 w-7 text-slate-600 mx-auto" />
                <h4 className="text-xs font-bold text-white">No API Credentials Configured</h4>
                <p className="text-[10px] text-slate-400 font-sans max-w-sm mx-auto">Click build token option values on left to spawn secure developer tokens instantly with customized access rights.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
