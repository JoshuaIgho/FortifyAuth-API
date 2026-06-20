import React, { useState } from 'react';
import { securityItemsList } from '../data/securityBestPractices';
import {
  Copy,
  Check,
  ShieldAlert,
  CheckCircle2,
  LockKeyhole,
  ArrowRight,
  Eye,
  Code,
} from 'lucide-react';

export default function SecurityView() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([
    'sec-argon2',
    'sec-cookie',
    'sec-dbhash',
  ]);
  const [selectedItemId, setSelectedItemId] = useState<string>('sec-argon2');
  const [copied, setCopied] = useState<boolean>(false);

  const currentItem =
    securityItemsList.find((i) => i.id === selectedItemId) || securityItemsList[0];

  const toggleCheckItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid switching focus on checkbox check
    if (completedLessons.includes(id)) {
      setCompletedLessons(completedLessons.filter((i) => i !== id));
    } else {
      setCompletedLessons([...completedLessons, id]);
    }
  };

  const scorePercentage = Math.round((completedLessons.length / securityItemsList.length) * 100);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-[#020617]">
      {/* List of security checks left column */}
      <div className="flex-grow p-6 overflow-y-auto flex flex-col space-y-6">
        {/* Progress header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 shadow-2xl">
          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-white font-sans flex items-center space-x-1.5">
              <LockKeyhole className="h-4 w-4 text-[#10b981] font-bold" />
              <span>OWASP / Security Architecture Checklist</span>
            </h2>
            <p className="text-xs text-slate-400 leading-normal font-sans">
              Evaluate and audit the codebase design compliance against enterprise cryptographic
              constraints. Check items as completed to calculate metrics.
            </p>
          </div>

          {/* Meter circle chart */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="relative h-14 w-14 flex items-center justify-center bg-slate-950 border border-[#1e293b] rounded-full shadow-inner">
              <span className="text-xs font-mono font-bold text-[#10b981]">{scorePercentage}%</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Compliance Score</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {completedLessons.length} of {securityItemsList.length} audited
              </div>
            </div>
          </div>
        </div>

        {/* Categories checklist columns */}
        <div className="space-y-3">
          {securityItemsList.map((item) => {
            const isCompleted = completedLessons.includes(item.id);
            const isFocused = selectedItemId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isFocused
                    ? 'border-[#10b981] bg-emerald-950/5 ring-1 ring-[#10b981]/20 shadow-sm'
                    : 'border-[#1e293b] bg-[#0f172a]/60 hover:bg-slate-900'
                }`}
              >
                {/* Check trigger */}
                <button
                  onClick={(e) => toggleCheckItem(item.id, e)}
                  className="mt-0.5 pointer-events-auto shrink-0 cursor-pointer"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-[#10b981] fill-emerald-950/30" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-[#1e293b] bg-slate-950 hover:border-[#10b981]" />
                  )}
                </button>

                <div className="flex-grow min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white font-sans">{item.title}</span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-950 border border-[#1e293b] text-slate-400">
                      {item.category}
                    </span>
                    <span
                      className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded font-mono ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-950/40 text-[#f43f5e] border border-rose-900/30'
                          : item.severity === 'HIGH'
                            ? 'bg-amber-950/40 text-amber-500 border border-amber-900/30'
                            : 'bg-slate-950 text-slate-400 border border-[#1e293b]'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 lines-clamp-1 font-sans">
                    {item.bestPractice}
                  </p>
                </div>

                <div className="flex items-center space-x-1 shrink-0 text-slate-500">
                  <span className="text-[9px] font-sans">View Code</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#10b981]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code / Vulnerability Review Panel on Right */}
      <div className="w-full lg:w-[480px] bg-[#0f172a] border-t lg:border-t-0 lg:border-l border-[#1e293b] overflow-y-auto flex flex-col shadow-2xl shrink-0">
        {/* Vulnerability details section */}
        <div className="p-6 border-b border-[#1e293b] bg-slate-950/20">
          <div className="flex items-center space-x-2 text-emerald-400 mb-3">
            <ShieldAlert className="h-4.5 w-4.5" />
            <h3 className="font-bold text-[#64748b] text-[10px] uppercase tracking-wider leading-none font-mono">
              Vulnerability Profile
            </h3>
          </div>
          <h4 className="text-base font-extrabold text-white leading-snug">{currentItem.title}</h4>

          <div className="mt-4 p-4 bg-rose-950/20 border border-rose-900/35 rounded-xl">
            <h5 className="text-[9px] font-bold text-rose-300 uppercase tracking-widest font-mono mb-1.5">
              The Risk Vector
            </h5>
            <p className="text-xs text-rose-250 font-sans leading-relaxed">
              {currentItem.vulnerability}
            </p>
          </div>

          <div className="mt-4 p-4 bg-emerald-950/20 border border-[#10b981]/15 rounded-xl">
            <h5 className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest font-mono mb-1.5">
              Enterprise Countermeasure
            </h5>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {currentItem.bestPractice}
            </p>
          </div>
        </div>

        {/* Code Snippet block */}
        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b border-[#1e293b] flex items-center justify-between bg-[#0f172a] shrink-0">
            <span className="text-[11px] font-mono font-semibold text-slate-300 flex items-center space-x-1.5">
              <Code className="h-4 w-4 text-[#10b981] font-bold" />
              <span>Reference Security Code</span>
            </span>
            <button
              onClick={() => handleCopy(currentItem.codeSnippet)}
              className="px-3 py-1.5 bg-[#1e293b] hover:bg-slate-800 text-[#10b981] font-semibold border border-[#1e293b] rounded-md transition-all text-[11px] cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy Snippet'}
            </button>
          </div>

          <div className="flex-grow overflow-y-auto bg-slate-950 text-slate-350 p-6 font-mono text-xs select-text leading-relaxed">
            <pre>{currentItem.codeSnippet}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
