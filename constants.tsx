
import React from 'react';
import { Agent, AgentStatus, UserMemory } from './types';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'travel-agent',
    name: 'Voyager',
    role: 'TravelAgent',
    description: 'Specializes in routes, logistics, and travel schedules.',
    color: 'bg-blue-500',
    status: AgentStatus.IDLE,
  },
  {
    id: 'weather-agent',
    name: 'SkyWatch',
    role: 'WeatherAgent',
    description: 'Simulates meteorology and climate-based advice.',
    color: 'bg-sky-400',
    status: AgentStatus.IDLE,
  },
  {
    id: 'finance-agent',
    name: 'Ledger',
    role: 'FinanceAgent',
    description: 'Estimates budgets, currency exchange, and costs.',
    color: 'bg-emerald-500',
    status: AgentStatus.IDLE,
  },
  {
    id: 'calendar-agent',
    name: 'Chronos',
    role: 'CalendarAgent',
    description: 'Checks for scheduling conflicts and time management.',
    color: 'bg-purple-500',
    status: AgentStatus.IDLE,
  }
];

export const MARKETPLACE_AGENTS: Partial<Agent>[] = [
  {
    name: 'DineExpert',
    role: 'CulinaryAgent',
    description: 'Finds the best restaurants and dietary options.',
    color: 'bg-orange-500',
  },
  {
    name: 'SecureStay',
    role: 'SecurityAgent',
    description: 'Evaluates safety and provides security briefings.',
    color: 'bg-red-500',
  },
  {
    name: 'HealthBot',
    role: 'MedicalAgent',
    description: 'Suggests vaccinations, health alerts, and first aid.',
    color: 'bg-rose-500',
  }
];

export const INITIAL_MEMORY: UserMemory = {
  preferences: [
    "Prefers eco-friendly travel options",
    "Budget range: Mid-tier to Premium",
    "Highly values punctuality",
    "Vegetarian dietary preference"
  ],
  goals: [
    "Plan a sabbatical year starting 2026",
    "Complete professional certification in AI Ethics"
  ],
  recentActivities: [
    "Booked a weekend trip to London",
    "Updated calendar for Q1 quarterly reviews"
  ]
};
