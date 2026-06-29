import React, { useState } from 'react';
import { archNodes } from '../data/architecture';
import { Shield, ArrowRight, BookOpen, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function ArchitectureView() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('express_app');

  const selectedNode = archNodes.find((n) => n.id === selectedNodeId) || archNodes[2];

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-[#020617]">
      {/* Sidebar Layout Visual Area */}
      <div className="flex-grow p-6 overflow-y-auto flex flex-col space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">
            High-Level Architecture Blueprint
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            FortifyAuth is designed as a secure, high-integrity, stateless-first credential
            validator. Select system nodes below to inspect their structural responsibilities.
          </p>
        </div>

        {/* Beautiful Layout Architectural Diagram Rendered in Rich SVG/HTML Blocks */}
        <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 shadow-2xl relative min-h-[420px] flex flex-col justify-between overflow-x-auto">
          {/* Node Diagram Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Column 1: Entry Gateways */}
            <div className="flex flex-col justify-center space-y-8 relative z-10">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center md:text-left mb-2 font-mono">
                Ingress & Entry
              </div>

              {/* Client node */}
              <button
                onClick={() => setSelectedNodeId('client')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNodeId === 'client'
                    ? 'border-[#10b981] bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] ring-1 ring-[#10b981]/30'
                    : 'border-[#1e293b] bg-slate-950/60 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div
                  className={`flex items-center space-x-2 font-bold text-xs ${selectedNodeId === 'client' ? 'text-[#10b981]' : 'text-slate-400'}`}
                >
                  <span>📱 client</span>
                </div>
                <div className="font-semibold text-slate-100 text-xs mt-1">Client Applications</div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  SPA memory tokens & HttpOnly Cookies.
                </p>
              </button>

              {/* Gateway Node */}
              <button
                onClick={() => setSelectedNodeId('gateway')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNodeId === 'gateway'
                    ? 'border-[#3b82f6] bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] ring-1 ring-[#3b82f6]/30'
                    : 'border-[#1e293b] bg-slate-950/60 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div
                  className={`flex items-center space-x-2 font-bold text-xs ${selectedNodeId === 'gateway' ? 'text-[#3b82f6]' : 'text-slate-400'}`}
                >
                  <span>🛡️ gateway</span>
                </div>
                <div className="font-semibold text-slate-100 text-xs mt-1">Reverse Proxy & WAF</div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  Nginx SSL Termination & IP rate boundaries.
                </p>
              </button>
            </div>

            {/* Column 2: Authentication Core */}
            <div className="flex flex-col justify-center relative z-10">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center mb-6 font-mono">
                Security Engine
              </div>

              {/* Core application logic */}
              <button
                onClick={() => setSelectedNodeId('express_app')}
                className={`p-5 rounded-xl border text-left transition-all min-h-[140px] flex flex-col justify-between ${
                  selectedNodeId === 'express_app'
                    ? 'border-[#10b981] bg-emerald-950/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-2 ring-[#10b981]/40'
                    : 'border-[#1e293b] bg-slate-950/60 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-950/80 rounded border border-[#10b981]/20 font-mono">
                      CORE ENGINE
                    </span>
                    <span className="text-xs">🚀 server</span>
                  </div>
                  <h4 className="font-bold text-white text-xs mt-3">FortifyAuth Server</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    TypeScript Express API, Argon2id passwords, and JWT / state generation.
                  </p>
                </div>
                <div className="font-mono text-[9px] text-[#10b981] font-semibold bg-slate-950/95 px-2 py-0.5 rounded border border-[#1e293b] self-start mt-2">
                  PORT 3000
                </div>
              </button>
            </div>

            {/* Column 3: Data & Ext Service Subsystems */}
            <div className="flex flex-col justify-center space-y-6 relative z-10">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center md:text-left mb-2 font-mono">
                Backing Services
              </div>


              {/* Postgres DB */}
              <button
                onClick={() => setSelectedNodeId('postgres_db')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNodeId === 'postgres_db'
                    ? 'border-[#3b82f6] bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] ring-1 ring-[#3b82f6]/30'
                    : 'border-[#1e293b] bg-slate-950/60 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div
                  className={`flex items-center space-x-2 font-bold text-xs ${selectedNodeId === 'postgres_db' ? 'text-[#3b82f6]' : 'text-slate-400'}`}
                >
                  <span>🐘 postgresql</span>
                </div>
                <div className="font-semibold text-slate-100 text-xs mt-1">
                  Prisma Relational Database
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  User stores, login histories, audit trails.
                </p>
              </button>

              {/* Email Gateway */}
              <button
                onClick={() => setSelectedNodeId('smtp_server')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNodeId === 'smtp_server'
                    ? 'border-[#10b981] bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] ring-1 ring-[#10b981]/30'
                    : 'border-[#1e293b] bg-slate-950/60 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div
                  className={`flex items-center space-x-2 font-bold text-xs ${selectedNodeId === 'smtp_server' ? 'text-[#10b981]' : 'text-slate-400'}`}
                >
                  <span>✉️ smtp mail</span>
                </div>
                <div className="font-semibold text-slate-100 text-xs mt-1">
                  Transactional Dispatcher
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  Nodemailer / Resend OTP & Verification dispatch.
                </p>
              </button>
            </div>
          </div>

          {/* Visual flow markers connecting components */}
          <div className="hidden md:block absolute inset-0 pointer-events-none opacity-20">
            {/* Draw beautiful paths if needed, or simply let the layout structure represent flow */}
            <div className="absolute left-1/3 top-[32%] w-[15%] h-[1px] border-t-2 border-dashed border-emerald-500"></div>
            <div className="absolute left-1/3 top-[68%] w-[15%] h-[1px] border-t-2 border-dashed border-blue-500"></div>
            <div className="absolute right-1/3 top-[35%] w-[15%] h-[1px] border-t-2 border-dashed border-[#1e293b]"></div>
            <div className="absolute right-1/3 top-[65%] w-[15%] h-[1px] border-t-2 border-dashed border-blue-500"></div>
          </div>

          {/* Key Indicators Footnotes */}
          <div className="mt-8 border-t border-[#1e293b]/60 pt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>● SECURE VPC LAN CHANNELS</span>
            <span>✦ STATELESS REST API PRIVACY</span>
            <span>🛡️ PROD-READY TOPOLOGY</span>
          </div>
        </div>
      </div>

      {/* Inspector Panel on Right */}
      <div className="w-full lg:w-[420px] bg-[#0f172a] border-t lg:border-t-0 lg:border-l border-[#1e293b] p-6 overflow-y-auto flex flex-col justify-between shadow-lg relative shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
            <div className="flex items-center space-x-2">
              <Settings2 className="h-4.5 w-4.5 text-[#10b981]" />
              <h3 className="font-semibold text-white text-sm">Node Inspector</h3>
            </div>
            <span className="px-2 py-0.5 text-[9px] bg-slate-950 border border-[#1e293b] text-[#10b981] font-mono rounded uppercase">
              {selectedNode.type}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white font-sans">{selectedNode.label}</h4>
            <div className="text-xs text-slate-400 mt-2 leading-relaxed whitespace-pre-line">
              {selectedNode.description}
            </div>
          </div>

          {/* Key specifications */}
          <div className="bg-slate-950/40 rounded-xl p-4 border border-[#1e293b]">
            <h5 className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider font-mono mb-2">
              Technology Integration
            </h5>
            <div className="text-xs font-mono font-medium text-[#cbd5e1] bg-slate-950/80 p-2.5 rounded border border-[#1e293b]/60 leading-normal">
              {selectedNode.techUsed}
            </div>
          </div>

          {/* Responsibilities */}
          <div className="space-y-2">
            <h5 className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider font-mono mb-1">
              Assigned Operational Duties
            </h5>
            <ul className="space-y-2.5">
              {selectedNode.responsibility.map((resp, idx) => (
                <li key={idx} className="flex items-start text-xs text-slate-300 font-sans">
                  <span className="h-4 w-4 bg-emerald-950/60 border border-[#10b981]/30 rounded-full flex items-center justify-center text-[9px] text-[#10b981] font-semibold shrink-0 mr-2 mt-0.5 font-mono">
                    {idx + 1}
                  </span>
                  <span className="leading-normal">{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Security / Configuration Tip */}
        <div className="mt-8 border-t border-[#1e293b] pt-6">
          <div className="bg-[#020617] text-slate-350 rounded-xl p-4 border border-[#1e293b] shadow-sm">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-[10px] uppercase tracking-wider font-mono">
              <BookOpen className="h-3.5 w-3.5 text-[#10b981]" />
              <span>Security Architect Note</span>
            </div>
            <p className="text-[11px] mt-2 text-slate-400 leading-relaxed font-sans">
              {selectedNode.configTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
