
import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface ActivityLogProps {
  logs: LogEntry[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-full flex flex-col bg-white rounded-md border border-zinc-200 overflow-hidden font-['Saira']">
      <div className="px-4 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/30">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
          Telemetery Log
        </h2>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-pulse"></span>
          <span className="text-[9px] text-zinc-400 font-mono font-bold tracking-tighter uppercase">LINK_ESTABLISHED</span>
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-3 font-mono text-[10px] no-scrollbar bg-white"
      >
        {logs.length === 0 && (
          <div className="text-zinc-300 italic text-center py-24 font-['Saira'] text-[11px] font-bold uppercase tracking-widest">Syncing Fleet Data...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 group border-b border-zinc-50 pb-2 last:border-0 items-start">
            <span className="text-zinc-300 shrink-0 font-bold">[{log.timestamp}]</span>
            <div className="flex-1">
              <span className={`font-bold shrink-0 uppercase tracking-tighter mr-2 ${
                log.type === 'success' ? 'text-zinc-950' : 
                log.type === 'error' ? 'text-rose-500' : 
                log.type === 'ai' ? 'text-zinc-800 border-b border-zinc-200' : 
                'text-zinc-400'
              }`}>
                {log.source}:
              </span>
              <span className="text-zinc-500 group-hover:text-zinc-950 transition-colors leading-relaxed font-medium">
                {log.message}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
