'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Plus, ArrowRight, DollarSign, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  category: 'Retirement' | 'Emergency Fund' | 'House Purchase' | 'Education';
  targetDate: string;
}

interface InvestmentGoalsProps {
  isLoading?: boolean;
  goals: Goal[];
  cashBalance: number;
  onAddGoal: (name: string, target: number, category: Goal['category'], date: string) => void;
  onAllocateFunds: (goalId: string, amount: number) => void;
}

export default function InvestmentGoals({
  isLoading = false,
  goals,
  cashBalance,
  onAddGoal,
  onAllocateFunds
}: InvestmentGoalsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(10000);
  const [newGoalCategory, setNewGoalCategory] = useState<Goal['category']>('Retirement');
  const [newGoalDate, setNewGoalDate] = useState('2030-12-31');

  // Allocation State
  const [allocatingGoalId, setAllocatingGoalId] = useState<string | null>(null);
  const [allocateAmount, setAllocateAmount] = useState(1000);

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName || newGoalTarget <= 0) return;
    onAddGoal(newGoalName, newGoalTarget, newGoalCategory, newGoalDate);
    setNewGoalName('');
    setShowAddForm(false);
  };

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingGoalId || allocateAmount <= 0) return;
    onAllocateFunds(allocatingGoalId, allocateAmount);
    setAllocatingGoalId(null);
  };

  if (isLoading) {
    return (
      <Card className="bg-panel border-border/80 w-full animate-pulse h-[300px]">
        <CardContent className="h-full flex items-center justify-center">
          <div className="h-4 w-40 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-panel border-border/85 w-full shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-3 flex items-center justify-between">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5 font-mono">
          <Target className="w-4 h-4 text-primary" /> Active Financial Milestones
        </CardTitle>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> New Goal
        </button>
      </CardHeader>
      
      <CardContent className="pt-5 space-y-4 font-mono text-xs">
        
        {/* Render Form if active */}
        {showAddForm && (
          <form onSubmit={handleSubmitGoal} className="bg-secondary/40 border border-border/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border/20 pb-1.5 mb-1">
              <span className="font-bold text-foreground">Create Investment Milestone</span>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-muted-foreground">Milestone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hawaii Trip, Retirement Fund"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-panel border border-border text-foreground rounded text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-muted-foreground">Milestone Category</label>
                <select
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value as Goal['category'])}
                  className="w-full px-2 py-1.5 bg-panel border border-border text-foreground rounded text-xs focus:outline-none"
                >
                  <option value="Retirement">Retirement</option>
                  <option value="Emergency Fund">Emergency Fund</option>
                  <option value="House Purchase">House Purchase</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-muted-foreground">Target Capital ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-panel border border-border text-foreground rounded text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-muted-foreground">Target Date</label>
                <input
                  type="date"
                  required
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-panel border border-border text-foreground rounded text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/20">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded bg-secondary hover:bg-muted border border-border text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-primary text-primary-foreground hover:opacity-90 cursor-pointer shadow"
              >
                Log Milestone
              </button>
            </div>
          </form>
        )}

        {/* Goals Progress bars List */}
        <div className="space-y-5">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-sm">{goal.name}</span>
                    <span className="text-[9px] text-muted-foreground font-sans mt-0.5">{goal.category} • Target Date: {goal.targetDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-extrabold text-foreground">${goal.current.toLocaleString()}</span>
                      <span className="text-muted-foreground"> / ${goal.target.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => setAllocatingGoalId(goal.id)}
                      className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-500 border border-emerald-500/20 transition-all cursor-pointer"
                    >
                      Fund
                    </button>
                  </div>
                </div>

                {/* Animated progress bar container */}
                <div className="w-full bg-secondary/80 h-2.5 rounded-full overflow-hidden border border-border/30 relative">
                  <div 
                    className="bg-gradient-to-r from-primary to-indigo-500 h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>{percent}% Completed</span>
                  <span>Remaining: ${(goal.target - goal.current).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Allocate Modal popup */}
      {allocatingGoalId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel border border-border rounded-xl p-5 w-full max-w-sm font-mono shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-primary" /> Allocate Cash Capital to Goal
              </h3>
              <button 
                onClick={() => setAllocatingGoalId(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAllocateSubmit} className="space-y-4">
              <div className="bg-secondary/40 border border-border/60 rounded-lg p-3 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span>Active Account Cash Balance:</span>
                  <span className="font-bold text-foreground">${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Goal Milestones Remaining:</span>
                  <span className="font-bold text-foreground">
                    ${(goals.find(g => g.id === allocatingGoalId)?.target || 0 - (goals.find(g => g.id === allocatingGoalId)?.current || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Cash Amount to Allocate ($)</label>
                <input
                  type="number"
                  min="10"
                  max={cashBalance}
                  required
                  value={allocateAmount}
                  onChange={(e) => setAllocateAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-secondary text-foreground border border-border rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAllocatingGoalId(null)}
                  className="flex-1 py-2 text-xs font-bold rounded-lg bg-secondary border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={allocateAmount > cashBalance}
                  className="flex-1 py-2 text-xs font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-md"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
