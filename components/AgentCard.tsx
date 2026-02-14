
import React from 'react';
import { Agent, AgentStatus } from '../types';

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const isWorking = agent.status === AgentStatus.WORKING;
  
  return (
    <div className={`p-4 rounded-md border transition-all duration-200 bg-white font-['Saira'] ${isWorking ? 'border-zinc-950 ring-[0.5px] ring-zinc-950' : 'border-zinc-200'}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-2 h-8 rounded-sm ${agent.color.replace('bg-', 'bg-')} bg-opacity-80 border border-zinc-50 shadow-inner`}></div>
        <div>
          <h3 className="text-[12px] font-bold text-zinc-950 tracking-tight uppercase">{agent.name}</h3>
          <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">{agent.role}</p>
        </div>
      </div>
      <p className="text-[11px] text-zinc-500 font-medium line-clamp-2 mb-3 leading-snug">
        {agent.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-1 h-1 rounded-full ${isWorking ? 'bg-zinc-950 animate-pulse' : 'bg-zinc-200'}`}></div>
          <span className={`text-[9px] font-bold uppercase tracking-widest ${isWorking ? 'text-zinc-950' : 'text-zinc-300'}`}>
            {agent.status}
          </span>
        </div>
      </div>
    </div>
  );
};
