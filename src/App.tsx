import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ArchitectureView from './components/ArchitectureView';
import DatabaseView from './components/DatabaseView';
import FolderView from './components/FolderView';
import ApiView from './components/ApiView';
import SecurityView from './components/SecurityView';
import RoadmapView from './components/RoadmapView';
import DeployView from './components/DeployView';
import AuthDemoView from './components/AuthDemoView';
import AdminDashboardView from './components/AdminDashboardView';
import SessionManagerView from './components/SessionManagerView';
import KeyManagerView from './components/KeyManagerView';
import AuditTimelineView from './components/AuditTimelineView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('architecture');

  const renderActiveTabContent = () => {
    switch (currentTab) {
      case 'architecture':
        return <ArchitectureView />;
      case 'database':
        return <DatabaseView />;
      case 'folders':
        return <FolderView />;
      case 'playground':
        return <ApiView />;
      case 'security':
        return <SecurityView />;
      case 'roadmap':
        return <RoadmapView />;
      case 'deployment':
        return <DeployView />;
      case 'auth-demo':
        return <AuthDemoView />;
      case 'admin-dashboard':
        return <AdminDashboardView />;
      case 'session-manager':
        return <SessionManagerView />;
      case 'key-manager':
        return <KeyManagerView />;
      case 'audit-timeline':
        return <AuditTimelineView />;
      default:
        return <ArchitectureView />;
    }
  };

  return (
    <div
      id="app-root-container"
      className="flex h-screen w-screen overflow-hidden bg-[#020617] text-slate-100 font-sans antialiased"
    >
      {/* Navigation list */}
      <Sidebar currentTab={currentTab} setTab={setCurrentTab} />

      {/* Main interactive viewport workspace */}
      <main
        id="main-content-area"
        className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#020617]"
      >
        {/* Dynamic header */}
        <header
          id="app-workspace-header"
          className="h-[64px] border-b border-[#1e293b] bg-[#0f172a] px-6 flex items-center justify-between shrink-0"
        >
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 bg-[#10b981] rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            <h2 className="text-xs font-bold font-mono tracking-widest text-[#94a3b8] uppercase">
              SPECIFICATION: {currentTab.toUpperCase()}
            </h2>
          </div>
          <div className="flex items-center space-x-6 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 bg-[#10b981] rounded-full" />
              <span className="text-[#94a3b8]">PostgreSQL: ACTIVE</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 bg-[#10b981] rounded-full" />
              <span className="text-[#94a3b8]">Redis: SYNCED</span>
            </div>
          </div>
        </header>

        {/* Dynamic Section rendering */}
        <div id="app-workspace-content" className="flex-1 overflow-hidden bg-[#020617]">
          {renderActiveTabContent()}
        </div>

        {/* High availability stats footer */}
        <footer className="h-8 bg-[#0f172a] border-t border-[#1e293b] flex items-center px-6 text-[10px] text-slate-500 justify-between shrink-0">
          <div>FortifyAuth Security Engine &bull; Built for High Availability</div>
          <div className="font-mono">Uptime: 99.998% | LATENCY: 24ms</div>
        </footer>
      </main>
    </div>
  );
}
