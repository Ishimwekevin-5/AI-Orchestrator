
import React from 'react';

export const ToolIcon: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-2 py-1 rounded-md shadow-sm">
      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">{name}</span>
    </div>
  );
};
