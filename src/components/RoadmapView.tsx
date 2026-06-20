import React, { useState } from 'react';
import { roadmapPhases } from '../data/roadmap';
import { Calendar, CheckCircle2, Circle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function RoadmapView() {
  const [expandedPhase, setExpandedPhase] = useState<number>(1);
  const [checkedTasksState, setCheckedTasksState] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    roadmapPhases.forEach((p) => {
      p.tasks.forEach((t) => {
        initialState[`${p.phase}-${t.title}`] = t.completedByDefault;
      });
    });
    return initialState;
  });

  const toggleTask = (phaseNum: number, taskTitle: string) => {
    const key = `${phaseNum}-${taskTitle}`;
    setCheckedTasksState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getPhaseCompletionStats = (phaseNum: number) => {
    const phase = roadmapPhases.find(p => p.phase === phaseNum);
    if (!phase) return { total: 0, completed: 0, percent: 0 };
    const tasks = phase.tasks;
    const completed = tasks.filter(t => checkedTasksState[`${phaseNum}-${t.title}`]).length;
    return {
      total: tasks.length,
      completed,
      percent: Math.round((completed / tasks.length) * 100)
    };
  };

  return (
    <div className="p-6 bg-[#020617] h-full overflow-y-auto space-y-6">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-white font-sans flex items-center space-x-2">
          <Calendar className="h-4.5 w-4.5 text-[#10b981]" />
          <span>Incremental Development Roadmap</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          A production-ready SaaS authentication service cannot be completed overnight. Follow this 6-phase development pipeline.
        </p>
      </div>

      {/* Main Roadmap Vertical Columns */}
      <div className="grid grid-cols-1 gap-4 max-w-4xl">
        {roadmapPhases.map((phase) => {
          const isExpanded = expandedPhase === phase.phase;
          const { completed, total, percent } = getPhaseCompletionStats(phase.phase);
          const isFinished = percent === 100;

          return (
            <div
              key={phase.phase}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'bg-[#0f172a] border-[#10b981]/50 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
                  : 'bg-[#0f172a]/60 border-[#1e293b] hover:border-[#10b981]/20 hover:shadow-sm'
              }`}
            >
              {/* Card Header clickable to expand */}
              <div
                onClick={() => setExpandedPhase(isExpanded ? 0 : phase.phase)}
                className="p-5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-start space-x-4 min-w-0">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                    isFinished
                      ? 'bg-[#10b981] text-slate-950'
                      : percent > 0
                      ? 'bg-emerald-950/40 border border-[#10b981]/30 text-emerald-400'
                      : 'bg-slate-955 border border-[#1e293b] text-slate-500'
                  }`}>
                    P{phase.phase}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2.5">
                      <h3 className="font-bold text-white text-sm font-sans leading-tight truncate">{phase.title}</h3>
                      <span className="text-[9px] font-mono shrink-0 text-emerald-400 bg-slate-950 border border-[#1e293b] px-2 py-0.5 rounded-full">
                        {phase.duration}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 leading-normal font-sans">{phase.description}</p>
                  </div>
                </div>

                {/* completion meters */}
                <div className="flex items-center space-x-4 ml-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-white">{percent}% Done</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{completed} of {total} items</div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </div>
              </div>

              {/* Collapsible expandable content */}
              {isExpanded && (
                <div className="px-5 pb-6 border-t border-[#1e293b]/60 pt-5 space-y-5 animate-fadeIn">
                  
                  {/* Phase Tasks list */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest font-mono">Milestone Checklist</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {phase.tasks.map((task, idx) => {
                        const isTaskDone = checkedTasksState[`${phase.phase}-${task.title}`];
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleTask(phase.phase, task.title)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                              isTaskDone
                                ? 'border-[#10b981]/20 bg-emerald-950/10 text-emerald-200'
                                : 'border-[#1e293b] bg-slate-950/40 text-slate-350 hover:bg-slate-900'
                            }`}
                          >
                            <button className="mt-0.5 shrink-0 cursor-pointer">
                              {isTaskDone ? (
                                <CheckCircle2 className="h-4.5 w-4.5 text-[#10b981] fill-emerald-950/30" />
                              ) : (
                                <Circle className="h-4.5 w-4.5 text-slate-500 hover:text-emerald-400" />
                              )}
                            </button>
                            <div className="min-w-0">
                              <div className="text-xs font-bold leading-normal font-sans">{task.title}</div>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-sans">{task.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Deliverable outputs */}
                  <div className="bg-slate-950 rounded-xl p-4 border border-[#1e293b] space-y-2.5">
                    <h4 className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest font-mono">Tangible Deliverables / Audit outputs</h4>
                    <div className="flex flex-wrap gap-2">
                      {phase.deliverables.map((del, i) => (
                        <span key={i} className="px-2.5 py-1 bg-[#0f172a] border border-[#1e293b] text-[9px] text-slate-300 font-mono rounded-lg">
                          📦 {del}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
