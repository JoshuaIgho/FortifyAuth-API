import React, { useState } from 'react';
import { dbModels, prismaSchemaCode } from '../data/databaseSchema';
import { Database, Copy, Check, Info, ListFilter, Cpu } from 'lucide-react';

export default function DatabaseView() {
  const [activeTab, setActiveTab] = useState<'erd' | 'schema'>('erd');
  const [selectedModelName, setSelectedModelName] = useState<string>('User');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedModel = dbModels.find(m => m.name === selectedModelName) || dbModels[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(prismaSchemaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden">
      {/* Tab Switcher Bar */}
      <div className="bg-[#0f172a] border-b border-[#1e293b] px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white">Database Models & Entity Relations (ERD)</h2>
          <p className="text-xs text-slate-400 mt-0.5">Explore PostgreSQL database relational modeling configured in Prisma.</p>
        </div>
        <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-[#1e293b]">
          <button
            onClick={() => setActiveTab('erd')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'erd'
                ? 'bg-[#1e293b] text-[#10b981]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ERD Interactive Visualizer
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-[#1e293b] text-[#10b981]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            prisma.schema Code
          </button>
        </div>
      </div>

      {activeTab === 'erd' ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Models listing and visual diagram column */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbModels.map((model) => (
                <button
                  key={model.name}
                  onClick={() => setSelectedModelName(model.name)}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    selectedModelName === model.name
                      ? 'border-[#10b981] bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.06)] ring-1 ring-[#10b981]/30'
                      : 'border-[#1e293b] bg-[#0f172a]/60 hover:bg-slate-900 text-slate-350'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className={`h-4.5 w-4.5 ${selectedModelName === model.name ? 'text-[#10b981]' : 'text-slate-500'}`} />
                      <span className="font-bold text-white text-xs font-sans">{model.name}</span>
                    </div>
                    <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-[#1e293b] text-slate-400 font-mono">
                      {model.fields.length} columns
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed font-sans">{model.description}</p>
                  
                  {/* Visual ERD Connections Indicator */}
                  <div className="mt-3 pt-2.5 border-t border-[#1e293b]/60 flex flex-wrap gap-1.55">
                    {model.fields.filter(f => f.relationTo).map((f) => (
                      <span key={f.name} className="px-1.5 py-0.5 bg-emerald-950/40 text-emerald-400 border border-[#10b981]/25 text-[9px] rounded font-mono">
                        → {f.relationTo}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Visual ERD Flow Mapping representation */}
            <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 shadow-2xl">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-4">Relational Cascade Strategy Overview</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-900/40">
                  <div className="font-bold text-rose-250 text-xs font-sans">User (Delete)</div>
                  <div className="text-[10px] text-[#f43f5e] font-mono mt-1">CASCADE DELETE ↴</div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-sans">Sessions, RefreshTokens, PasswordResetTokens, and EmailVerifications are deleted automatically to protect privacy.</p>
                </div>
                <div className="p-3 bg-amber-950/10 rounded-xl border border-amber-900/30">
                  <div className="font-bold text-amber-300 text-xs font-sans">User (Delete)</div>
                  <div className="text-[10px] text-amber-500 font-mono mt-1">SET NULL ↴</div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-sans">AuditLog rows retain user-agent and IP histories, but clear target identities to keep log history secure and uncompromised.</p>
                </div>
                <div className="p-3 bg-emerald-950/15 rounded-xl border border-emerald-900/30">
                  <div className="font-bold text-emerald-200 text-xs font-sans">Refresh Rotation</div>
                  <div className="text-[10px] text-[#10b981] font-mono mt-1">UNIQUE INDEX ↴</div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-sans">Searching tokenHash hashes targets is highly optimized, allowing rapid validations inside critical login endpoints.</p>
                </div>
                <div className="p-3 bg-blue-950/20 rounded-xl border border-blue-900/30">
                  <div className="font-bold text-blue-200 text-xs font-sans">Secure OTPs</div>
                  <div className="text-[10px] text-[#3b82f6] font-mono mt-1">TTL EXPIRY ↴</div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-sans">All verification structures enforce short-lived deadlines (e.g. 1 hour for forgot-password inputs) before being purged.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table Model Inspector on Right */}
          <div className="w-full lg:w-[420px] bg-[#0f172a] border-t lg:border-t-0 lg:border-l border-[#1e293b] overflow-y-auto flex flex-col shadow-2xl shrink-0">
            <div className="p-6 border-b border-[#1e293b] bg-slate-950/20">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Database className="h-4.5 w-4.5" />
                <h3 className="font-bold text-white text-xs font-sans">Model Inspector</h3>
              </div>
              <h4 className="text-base font-extrabold text-white font-sans mt-3">{selectedModel.name}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-normal font-sans">{selectedModel.description}</p>
            </div>

            {/* Model Columns Table */}
            <div className="flex-grow p-6 space-y-5 overflow-y-auto">
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest font-mono">Columns & Datatypes</h5>
                <div className="space-y-2.5">
                  {selectedModel.fields.map((field) => (
                    <div key={field.name} className="p-3 bg-slate-950/40 rounded-lg border border-[#1e293b] flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">{field.name}</span>
                        <span className="text-[9px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-900/30">
                          {field.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans leading-normal mt-1">{field.description}</p>
                      
                      {/* Column Modifiers */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {field.isPrimary && (
                          <span className="px-1.5 py-0.5 bg-rose-950/50 text-[#f43f5e] border border-rose-900/30 text-[8px] font-bold font-mono rounded">PK / PRIMARY KEY</span>
                        )}
                        {field.isUnique && (
                          <span className="px-1.5 py-0.5 bg-amber-950/50 text-amber-500 border border-amber-900/30 text-[8px] font-bold font-mono rounded">UNIQUE</span>
                        )}
                        {field.isNullable && (
                          <span className="px-1.5 py-0.5 bg-slate-950 text-slate-400 border border-[#1e293b] text-[8px] font-bold font-mono rounded">NULLABLE</span>
                        )}
                        {field.relationTo && (
                          <span className="px-1.5 py-0.5 bg-blue-950/50 text-blue-400 border border-blue-950/10 text-[8px] font-bold font-mono rounded">RELATION TO {field.relationTo}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Indexing */}
              {selectedModel.indexes.length > 0 && (
                <div className="space-y-2 border-t border-[#1e293b] pt-4">
                  <h5 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest font-mono flex items-center space-x-1.5">
                    <Cpu className="h-3.5 w-3.5 text-blue-400" />
                    <span>Indexes & Speed Optimization</span>
                  </h5>
                  <div className="space-y-2">
                    {selectedModel.indexes.map((idx, index) => (
                      <div key={index} className="text-[10px] text-slate-350 font-mono bg-[#020617] p-2.5 rounded border border-[#1e293b] leading-normal">
                        {idx}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Full Prisma Code View Panel */
        <div className="flex-1 p-6 overflow-y-auto bg-[#020617] text-slate-200 font-mono text-xs flex flex-col relative select-text">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-4 bg-[#020617] sticky top-0 z-10">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Database className="h-4 w-4" />
              <span>schema.prisma</span>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-[#1e293b] hover:bg-slate-800 text-[#10b981] font-semibold rounded-md border border-[#1e293b] transition-all flex items-center space-x-1.5 text-[11px] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Schema</span>
                </>
              )}
            </button>
          </div>
          <pre className="flex-grow p-4 bg-slate-950 rounded-xl border border-[#1e293b] text-xs overflow-auto leading-relaxed text-slate-350">
            {prismaSchemaCode}
          </pre>
        </div>
      )}
    </div>
  );
}
