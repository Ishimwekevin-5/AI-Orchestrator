
import React, { useState, useEffect } from 'react';
import { 
  Agent, 
  AgentStatus, 
  Task, 
  TaskStatus, 
  LogEntry, 
  UserMemory, 
  ExecutionState,
  GoalPriority 
} from './types';
import { 
  INITIAL_AGENTS, 
  MARKETPLACE_AGENTS, 
  INITIAL_MEMORY 
} from './constants';
import { 
  decomposeGoal, 
  executeSubTask, 
  aggregateResults 
} from './services/geminiService';
import { AgentCard } from './components/AgentCard';
import { ActivityLog } from './components/ActivityLog';
import { MainAgentCard } from './components/MainAgentCard';
import { ToolIcon } from './components/ToolIcons';

const App: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [memory, setMemory] = useState<UserMemory>(INITIAL_MEMORY);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState<GoalPriority>(GoalPriority.MEDIUM);
  const [execution, setExecution] = useState<ExecutionState>({
    isProcessing: false,
    currentGoal: '',
    priority: GoalPriority.MEDIUM,
    tasks: [],
  });

  const addLog = (source: string, message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source,
      message,
      type
    }]);
  };

  const handleDecomposition = async (goal: string, targetPriority: GoalPriority) => {
    try {
      addLog('Orchestrator', `Analyzing mission intent [Priority: ${targetPriority}]: "${goal}"`, 'ai');
      const { tasks, newAgentsNeeded } = await decomposeGoal(goal, memory, agents, targetPriority);
      
      addLog('Orchestrator', `Strategy architecture mapped. ${tasks.length} sub-units initialized.`, 'success');

      if (newAgentsNeeded && newAgentsNeeded.length > 0) {
        addLog('Marketplace', `Capability gap detected. Provisioning units: ${newAgentsNeeded.join(', ')}`, 'warning');
        
        const newAgents: Agent[] = [];
        newAgentsNeeded.forEach((roleName: string) => {
          const template = MARKETPLACE_AGENTS.find(a => a.role === roleName);
          if (template) {
            const recruit: Agent = {
              id: `recruited-${Math.random().toString(36).substr(2, 5)}`,
              name: template.name!,
              role: template.role!,
              description: template.description!,
              color: template.color!,
              status: AgentStatus.IDLE
            };
            newAgents.push(recruit);
            addLog('Marketplace', `Unit Active: ${recruit.name} [${recruit.role}]`, 'success');
          }
        });
        
        if (newAgents.length > 0) {
          setAgents(prev => [...prev, ...newAgents]);
        }
      }

      const initializedTasks: Task[] = tasks.map((t: any) => ({
        ...t,
        id: Math.random().toString(36).substr(2, 9),
        status: TaskStatus.PENDING,
        progress: 0,
        toolCalls: []
      }));

      setExecution(prev => ({
        ...prev,
        tasks: initializedTasks
      }));

      return initializedTasks;
    } catch (error) {
      addLog('System', `Critical decomposition error: ${error}`, 'error');
      return [];
    }
  };

  const executeTasks = async (tasks: Task[], targetPriority: GoalPriority) => {
    addLog('Orchestrator', `Orchestrating concurrent unit execution...`, 'info');

    const taskPromises = tasks.map(async (task) => {
      // 1. Mark Agent Working
      setAgents(prev => prev.map(a => a.role === task.assigneeRole ? { ...a, status: AgentStatus.WORKING } : a));
      
      setExecution(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === task.id ? { ...t, status: TaskStatus.RUNNING } : t)
      }));

      addLog(task.assigneeRole, `Processing Thread: ${task.title}`, 'info');

      // 2. Simulate Progress & Tools
      const simulateProgress = async () => {
        const potentialTools = ['Gmail', 'Google Maps', 'Google Calendar', 'Google Search', 'Finance Feed', 'Weather API'];
        const assignedTools = potentialTools.sort(() => 0.5 - Math.random()).slice(0, 2);
        
        for (let p = 0; p <= 100; p += Math.floor(Math.random() * 20) + 10) {
          const clampedP = Math.min(p, 100);
          setExecution(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === task.id ? { 
                ...t, 
                progress: clampedP,
                toolCalls: clampedP > 30 ? (clampedP > 70 ? assignedTools : [assignedTools[0]]) : []
            } : t)
          }));
          await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
        }
      };

      try {
        const [result] = await Promise.all([
          executeSubTask(task, task.assigneeRole, memory, targetPriority),
          simulateProgress()
        ]);
        
        addLog(task.assigneeRole, `Operation successful. Output delivered.`, 'success');
        
        setExecution(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === task.id ? { 
            ...t, 
            status: TaskStatus.COMPLETED, 
            progress: 100,
            result: result.result, 
            reasoning: result.reasoning 
          } : t)
        }));

        return { ...task, ...result };
      } catch (error) {
        addLog(task.assigneeRole, `Execution fault: ${error}`, 'error');
        setExecution(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === task.id ? { ...t, status: TaskStatus.FAILED } : t)
        }));
        return null;
      } finally {
        setAgents(prev => prev.map(a => a.role === task.assigneeRole ? { ...a, status: AgentStatus.IDLE } : a));
      }
    });

    const results = await Promise.all(taskPromises);
    return results.filter(r => r !== null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || execution.isProcessing) return;

    const goal = inputValue;
    const targetPriority = priority;
    setInputValue('');
    setExecution({
      isProcessing: true,
      currentGoal: goal,
      priority: targetPriority,
      tasks: [],
    });
    setLogs([]);

    const tasks = await handleDecomposition(goal, targetPriority);
    
    if (tasks.length > 0) {
      const results = await executeTasks(tasks, targetPriority);
      addLog('Orchestrator', `Synchronizing threads for report synthesis...`, 'ai');
      const finalReport = await aggregateResults(goal, results, memory, targetPriority);
      
      setExecution(prev => ({
        ...prev,
        isProcessing: false,
        finalReport
      }));
      addLog('Orchestrator', `Deployment report finalized. Main Agent auto-collapsing.`, 'success');
    } else {
      setExecution(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const allTasksFinished = execution.tasks.length > 0 && execution.tasks.every(t => t.status === TaskStatus.COMPLETED);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-950 selection:bg-zinc-200 font-['Saira']">
      <header className="px-10 py-5 bg-white border-b border-zinc-200 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-md bg-zinc-950 flex items-center justify-center text-white">
            <span className="font-bold text-sm tracking-tighter uppercase">AO</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight uppercase">AI Orchestrator</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Agent Orchestrator</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Fleet Integrity</span>
            <span className="text-xs font-mono font-bold text-emerald-600 tracking-tighter uppercase">OPTIMAL</span>
          </div>
          <div className="w-px h-6 bg-zinc-200"></div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Available Units</span>
            <span className="text-xs font-mono font-bold text-zinc-900 tracking-tighter">{agents.length} Units</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex p-10 gap-10 max-w-[1600px] mx-auto w-full overflow-hidden">
        <aside className="hidden lg:flex flex-col w-72 gap-10">
          <section className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-2">Contextual DNA</h2>
            <div className="space-y-6">
              <ul className="space-y-2">
                {memory.preferences.map((p, i) => (
                  <li key={i} className="text-[11px] text-zinc-600 flex items-start gap-2 leading-relaxed font-medium">
                    <span className="text-zinc-300 font-bold mt-0.5">•</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="flex-1 flex flex-col min-h-0 space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-2">Fleet Registry</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
              {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </section>
        </aside>

        <div className="flex-1 flex flex-col gap-10">
          <div className="flex-1 bg-white rounded-md border border-zinc-200 overflow-y-auto no-scrollbar relative p-10 shadow-sm">
            
            {/* Main Agent Control Card */}
            <MainAgentCard 
              goal={execution.currentGoal} 
              priority={execution.priority} 
              isProcessing={execution.isProcessing}
              hasFinishedTasks={allTasksFinished}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {execution.tasks.map(task => (
                  <div key={task.id} className={`p-6 bg-zinc-800 rounded-md border border-zinc-700 shadow-xl transition-all duration-300`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-tighter">TASK_{task.id.slice(0, 4)}</span>
                      <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">@{task.assigneeRole}</span>
                    </div>
                    
                    <h4 className="font-bold text-sm text-white mb-2 tracking-tight uppercase">{task.title}</h4>
                    
                    <div className="space-y-3">
                       <div className="flex items-center gap-3">
                          <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-emerald-500 transition-all duration-300" 
                               style={{ width: `${task.progress}%` }}
                             ></div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 w-8">{task.progress}%</span>
                       </div>

                       {/* Tool Popdown Effect */}
                       <div className={`flex flex-wrap gap-2 transition-all duration-500 ${task.toolCalls && task.toolCalls.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 h-0 overflow-hidden'}`}>
                          {task.toolCalls?.map(tool => (
                             <ToolIcon key={tool} name={tool} />
                          ))}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </MainAgentCard>

            {!execution.currentGoal && !execution.isProcessing && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-8 animate-in mt-12">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-zinc-950 tracking-tight uppercase leading-tight">Fleet Deployment Interface</h2>
                  <p className="text-sm text-zinc-500 leading-relaxed font-medium">AI Orchestrator utilizes specialized sub-agents to execute your intent. Select a priority and describe your objective to begin.</p>
                </div>
                
                <div className="w-full space-y-2 border-t border-zinc-100 pt-8">
                    <button 
                      onClick={() => { setInputValue("I want to travel to Uganda next week"); setPriority(GoalPriority.HIGH); }}
                      className="w-full p-4 bg-zinc-50 hover:bg-zinc-100 rounded-md text-[11px] text-zinc-600 text-left border border-zinc-200 transition-all font-bold uppercase tracking-wide flex justify-between items-center group"
                    >
                      "Urgent Uganda Expedition" [HIGH]
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                    <button 
                      onClick={() => { setInputValue("Plan a surprise birthday party for my sister who loves hiking"); setPriority(GoalPriority.MEDIUM); }}
                      className="w-full p-4 bg-zinc-50 hover:bg-zinc-100 rounded-md text-[11px] text-zinc-600 text-left border border-zinc-200 transition-all font-bold uppercase tracking-wide flex justify-between items-center group"
                    >
                      "Themed Event Orchestration" [MEDIUM]
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                </div>
              </div>
            )}

            {(execution.currentGoal || execution.isProcessing) && (
              <div className="space-y-12 animate-in mt-10">
                
                {/* Final Synthesis Report */}
                {execution.finalReport && (
                  <div className="space-y-8 animate-in max-w-3xl mx-auto">
                    <div className="flex items-center gap-4">
                      <div className="h-[2px] flex-1 bg-zinc-900"></div>
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-zinc-950 shrink-0">Mission Delivery Report</h3>
                      <div className="h-[2px] flex-1 bg-zinc-900"></div>
                    </div>
                    <div className="bg-white border border-zinc-200 p-12 rounded-md whitespace-pre-wrap text-[13px] text-zinc-800 font-medium shadow-xl report-content prose prose-zinc max-w-none">
                      {execution.finalReport}
                    </div>
                    <div className="flex justify-center pt-8 border-t border-zinc-100">
                      <button 
                        onClick={() => setExecution({ isProcessing: false, currentGoal: '', priority: GoalPriority.MEDIUM, tasks: [] })}
                        className="px-12 py-5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-md text-[11px] font-bold uppercase tracking-[0.3em] transition-all hover:scale-[1.03] active:scale-95 shadow-2xl shadow-zinc-400"
                      >
                        Reset Command Center
                      </button>
                    </div>
                  </div>
                )}
                
                {execution.isProcessing && !execution.finalReport && !allTasksFinished && (
                  <div className="flex flex-col items-center justify-center py-10 gap-6">
                    <div className="text-center space-y-2">
                       <p className="text-[11px] text-zinc-950 font-bold uppercase tracking-[0.4em]">Sub-Agent Coordination Logic Active</p>
                       <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest font-mono">Parallel_Process: Validated</p>
                    </div>
                  </div>
                )}

                {allTasksFinished && !execution.finalReport && (
                  <div className="flex flex-col items-center justify-center py-20 gap-10">
                    <div className="flex gap-3">
                      <div className="w-2 h-10 bg-zinc-950 animate-[loading_1.2s_infinite] [animation-delay:-0.4s]"></div>
                      <div className="w-2 h-10 bg-zinc-950 animate-[loading_1.2s_infinite] [animation-delay:-0.2s]"></div>
                      <div className="w-2 h-10 bg-zinc-950 animate-[loading_1.2s_infinite]"></div>
                    </div>
                    <p className="text-[12px] text-zinc-950 font-bold uppercase tracking-[0.5em]">Synthesizing Deployment Report</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white border border-zinc-200 rounded-md p-6 shadow-xl transition-all duration-300 focus-within:border-zinc-950">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                   <div className="flex items-center gap-3 shrink-0 bg-zinc-50 p-3 rounded-md border border-zinc-100 w-full md:w-auto">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest shrink-0">Priority Rank:</span>
                      <div className="flex gap-1.5 flex-1">
                        {[GoalPriority.LOW, GoalPriority.MEDIUM, GoalPriority.HIGH].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`flex-1 md:flex-none px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border transition-all ${
                              priority === p 
                                ? 'bg-zinc-950 text-white border-zinc-950 shadow-md scale-105' 
                                : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                   </div>
                   <div className="flex-1 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] italic">
                      <span className="w-4 h-px bg-zinc-200"></span>
                      Sub-Agents ready for deployment
                      <span className="w-4 h-px bg-zinc-200"></span>
                   </div>
                </div>

                <div className="relative flex items-center gap-4 group">
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={execution.isProcessing ? "Deploying units..." : "Describe high-level mission objective..."}
                    className="flex-1 bg-zinc-50 border border-zinc-100 rounded-md px-6 py-5 text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:bg-white focus:border-zinc-950 transition-all text-sm font-semibold tracking-tight"
                    disabled={execution.isProcessing}
                  />
                  <button 
                    type="submit"
                    disabled={execution.isProcessing || !inputValue.trim()}
                    className={`px-12 h-[60px] rounded-md flex items-center justify-center transition-all duration-300 ${
                      execution.isProcessing || !inputValue.trim()
                        ? 'bg-zinc-50 text-zinc-300 border border-zinc-200 cursor-not-allowed'
                        : 'bg-zinc-950 text-white hover:bg-zinc-800 uppercase text-[11px] font-bold tracking-[0.3em] shadow-lg'
                    }`}
                  >
                    {execution.isProcessing ? (
                      <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-950 rounded-full animate-spin"></div>
                    ) : (
                      "Initiate"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <aside className="hidden xl:flex flex-col w-96 gap-4">
          <ActivityLog logs={logs} />
        </aside>
      </main>

      <footer className="px-10 py-5 border-t border-zinc-100 flex justify-between items-center bg-white">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">AI Orchestrator Core v3.0.0 | High-Precision Orchestration</span>
        <div className="flex gap-8">
          <span className="text-[10px] font-bold text-zinc-950 uppercase tracking-[0.2em]">Threads: PARALLEL</span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Auto_Collapse: ACTIVE</span>
        </div>
      </footer>
      <style>{`
        @keyframes loading {
          0% { transform: scaleY(0.6); opacity: 0.2; }
          50% { transform: scaleY(1.3); opacity: 1; }
          100% { transform: scaleY(0.6); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default App;
