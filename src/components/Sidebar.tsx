import React from 'react';
import {
  Shield,
  Database,
  FolderGit2,
  PlayCircle,
  LockKeyhole,
  CalendarClock,
  Globe,
  Fingerprint,
  Activity,
  Network,
  Clipboard,
  Terminal,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setTab }: SidebarProps) {
  const specItems = [
    { id: 'architecture', label: 'Architecture', icon: Shield, desc: 'Flow Diagram & Nodes' },
    { id: 'database', label: 'Database Schema', icon: Database, desc: 'Prisma Models & ERD' },
    { id: 'folders', label: 'Folder Explorer', icon: FolderGit2, desc: 'API Directory & Code' },
    { id: 'playground', label: 'API Playground', icon: PlayCircle, desc: 'Interactive Sandbox' },
    { id: 'security', label: 'Security Specs', icon: LockKeyhole, desc: 'OWASP & Codified Guides' },
    { id: 'roadmap', label: 'Dev Roadmap', icon: CalendarClock, desc: 'Phased Execution Plan' },
    { id: 'deployment', label: 'Production Deploy', icon: Globe, desc: 'Docker, VPC & Cluster' },
  ];

  const demoItems = [
    {
      id: 'auth-demo',
      label: 'Auth Gateway Portal',
      icon: Fingerprint,
      desc: 'Login, Register & MFA',
    },
    {
      id: 'admin-dashboard',
      label: 'SecOps Telemetry',
      icon: Activity,
      desc: 'Threat Flags & Gauges',
    },
    {
      id: 'session-manager',
      label: 'Session Revocation',
      icon: Network,
      desc: 'Evict Devices from Redis',
    },
    {
      id: 'key-manager',
      label: 'Scoped API Keys',
      icon: Clipboard,
      desc: 'Developer CRUD Workspace',
    },
    {
      id: 'audit-timeline',
      label: 'Immutable Auditing',
      icon: Terminal,
      desc: 'Compliance Event Feed',
    },
  ];

  return (
    <aside
      id="sidebar-nav"
      className="w-80 bg-[#020617] text-slate-200 flex flex-col border-r border-[#1e293b]"
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-[#1e293b] flex items-center space-x-3 bg-[#0f172a]">
        <div
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-sm"
        >
          F
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-white flex items-center">
            FortifyAuth
            <span className="text-[10px] text-slate-500 font-normal ml-2 font-mono">
              v1.4.2-stable
            </span>
          </h1>
          <p className="text-[10px] text-emerald-450 font-mono tracking-wide">
            SECURE IDENTITY PLATFORM
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-grow p-4 space-y-5 overflow-y-auto">
        {/* Tier 1: Specifications */}
        <div className="space-y-1.5">
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#64748b] font-mono px-3">
            Technical Blueprints
          </h3>
          <div className="space-y-1">
            {specItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-start space-x-3 p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1e293b] text-[#10b981] border-l-2 border-[#10b981] pl-2'
                      : 'text-slate-450 hover:bg-slate-900/40 hover:text-slate-200 border-l-2 border-transparent'
                  }`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${isActive ? 'text-[#10b981]' : 'text-slate-500'}`}
                  />
                  <div>
                    <div
                      className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5 font-sans leading-tight">
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier 2: Interactive Demos */}
        <div className="space-y-1.5 pt-2 border-t border-[#1e293b]/40">
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#64748b] font-mono px-3">
            Live Interactive Demos
          </h3>
          <div className="space-y-1">
            {demoItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-start space-x-3 p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1e293b] text-[#10b981] border-l-2 border-[#10b981] pl-2'
                      : 'text-slate-450 hover:bg-slate-900/40 hover:text-slate-200 border-l-2 border-transparent'
                  }`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${isActive ? 'text-[#10b981]' : 'text-slate-500'}`}
                  />
                  <div>
                    <div
                      className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5 font-sans leading-tight">
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Environment block as specified in Design HTML */}
        <div className="pt-4 border-t border-[#1e293b]/40">
          <div className="p-3 border border-dashed border-[#1e293b] rounded-lg bg-slate-950/45">
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#64748b] mb-1.5 font-mono">
              Environment
            </div>
            <div className="font-mono text-[9px] text-slate-400 leading-relaxed">
              NODE_ENV=production
              <br />
              JWT_ROTATION=enabled
              <br />
              RATE_LIMIT=100/min
            </div>
          </div>
        </div>
      </nav>

      {/* Footer Signature */}
      <div className="p-4 border-t border-[#1e293b] bg-[#0f172a] text-[10px] flex flex-col space-y-0.5 font-mono text-slate-500">
        <div className="flex justify-between">
          <span>SPECIFICATION v2.0.4</span>
        </div>
        <span className="text-[9px] text-slate-600 font-sans">CLIENT PREVIEW RUNTIME</span>
      </div>
    </aside>
  );
}
