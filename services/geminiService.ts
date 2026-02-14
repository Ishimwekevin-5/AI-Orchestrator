
import { GoogleGenAI, Type } from "@google/genai";
import { UserMemory, Task, Agent, GoalPriority } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function decomposeGoal(goal: string, memory: UserMemory, activeAgents: Agent[], priority: GoalPriority) {
  const prompt = `
    As a Main Personal AI Agent, decompose the following user goal into specific subtasks.
    USER GOAL: "${goal}"
    PRIORITY LEVEL: ${priority}
    USER MEMORY: ${JSON.stringify(memory)}
    AVAILABLE AGENT ROLES: ${activeAgents.map(a => a.role).join(', ')}

    INSTRUCTION: Adjust task granularity based on priority. 
    - HIGH priority requires comprehensive decomposition and deeper resource allocation logic.
    - MEDIUM is standard execution.
    - LOW is streamlined/efficient execution.

    Identify which roles are needed. If a role is missing from the available list but necessary, explicitly list it in 'newAgentsNeeded'.
    Current system roles available for immediate recruitment: CulinaryAgent, SecurityAgent, MedicalAgent.

    Output the tasks in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                assigneeRole: { type: Type.STRING },
              },
              required: ['title', 'description', 'assigneeRole']
            }
          },
          newAgentsNeeded: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['tasks', 'newAgentsNeeded']
      }
    }
  });

  return JSON.parse(response.text);
}

export async function executeSubTask(task: Task, role: string, memory: UserMemory, priority: GoalPriority) {
  const prompt = `
    You are the "${role}". 
    Perform the following simulated subtask: "${task.title}" - ${task.description}.
    SYSTEM PRIORITY: ${priority}. 
    (High priority tasks expect more rigorous analysis and contingency planning).
    Take into account user context: ${JSON.stringify(memory)}.
    
    Provide a realistic, structured simulated result with reasoning.
    The result should feel expert and specific to your role.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          result: { type: Type.STRING, description: "The detailed findings or action performed." },
          reasoning: { type: Type.STRING, description: "Why this was suggested/done based on user memory." }
        },
        required: ['result', 'reasoning']
      }
    }
  });

  return JSON.parse(response.text);
}

export async function aggregateResults(goal: string, results: any[], memory: UserMemory, priority: GoalPriority) {
  const prompt = `
    As the Main Personal AI Agent, aggregate these sub-agent results into a final cohesive plan for the user.
    GOAL: "${goal}"
    PRIORITY: ${priority}
    RESULTS: ${JSON.stringify(results)}
    USER CONTEXT: ${JSON.stringify(memory)}

    IMPORTANT STRUCTURE REQUIREMENTS:
    - Use clean, professional alignment.
    - Resolve any conflicts (e.g., timing, budget) immediately.
    - Organize with the following sections and mandatory sub-headers:
      1. Strategic Summary (Overview of mission success)
      2. Actionable Steps:
         - Immediate Priorities (Must do now)
         - Logistics & Coordination (Secondary steps)
      3. Resource Allocation (Financial and unit utilization)
      4. Expert Warnings:
         - Security & Safety Alerts
         - Operational Risks & Constraints
    
    - Highlight why certain steps were taken based on the ${priority} priority.
    - Use Markdown formatting: Bold headers (##) and Sub-headers (###).
    - Ensure text orientation is professional and output is well-aligned for a justified view.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
        thinkingConfig: { thinkingBudget: 2000 }
    }
  });

  return response.text;
}
