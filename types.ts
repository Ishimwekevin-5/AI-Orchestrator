
export enum AgentStatus {
  IDLE = 'IDLE',
  WORKING = 'WORKING',
  RECRUITING = 'RECRUITING',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum GoalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  status: AgentStatus;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeRole: string;
  status: TaskStatus;
  progress: number;
  toolCalls?: string[];
  result?: string;
  reasoning?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai';
}

export interface UserMemory {
  preferences: string[];
  goals: string[];
  recentActivities: string[];
}

export interface ExecutionState {
  isProcessing: boolean;
  currentGoal: string;
  priority: GoalPriority;
  tasks: Task[];
  finalReport?: string;
}
