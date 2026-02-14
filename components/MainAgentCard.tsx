
import React from 'react';
import { GoalPriority } from '../types';

interface MainAgentCardProps {
  goal: string;
  priority: GoalPriority;
  isProcessing: boolean;
  hasFinishedTasks: boolean;
  children?: React.ReactNode;
}

export const MainAgentCard: React.FC<MainAgentCardProps> = ({ 
  goal, 
  priority, 
  isProcessing, 
  hasFinishedTasks,
  children 
}) => {
  // Auto-expand when processing, collapse when done or idle
  const isExpanded = isProcessing && !hasFinishedTasks;

  return (
    <div className="w-full bg-zinc-950 text-white rounded-md border border-zinc-800 shadow-2xl overflow-hidden transition-all duration-500 font-['Saira']">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 flex items-center justify-center border border-zinc-700 shadow-inner">
             <span className="text-xs font-bold text-zinc-400">CORE</span>
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Main Control Agent</h2>
            <p className="text-lg font-bold tracking-tight">{goal || 'Awaiting Mission Parameters...'}</p>
          </div>
        </div>
        
        {goal && (
          <div className="flex flex-col items-end gap-1">
             <span className={`px-3 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
               priority === GoalPriority.HIGH ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
               priority === GoalPriority.MEDIUM ? 'bg-zinc-700 text-zinc-300 border-zinc-600' : 
               'bg-zinc-800 text-zinc-500 border-zinc-700'
             }`}>
               {priority} PRIORITY
             </span>
             <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  {isProcessing ? 'Status: Orchestrating' : 'Status: Ready'}
                </span>
             </div>
          </div>
        )}
      </div>

      <div className={`transition-all duration-700 ease-in-out border-t border-zinc-800 bg-zinc-900/50 ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden border-transparent'}`}>
         <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
               <div className="h-px flex-1 bg-zinc-800"></div>
               <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Fleet Deployment Active</span>
               <div className="h-px flex-1 bg-zinc-800"></div>
            </div>
            {children}
         </div>
      </div>
    </div>
  );
};
