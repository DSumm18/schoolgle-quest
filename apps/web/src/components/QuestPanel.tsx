"use client";

import { useState } from "react";
import type { Quest, PlayerProgress } from "@schoolgle/shared";

interface QuestPanelProps {
  quests?: Quest[];
  playerProgress?: PlayerProgress;
}

export function QuestPanel({ quests = [], playerProgress }: QuestPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate XP progress percentage
  const xpPercentage = playerProgress
    ? (playerProgress.xp / playerProgress.xpToNextLevel) * 100
    : 0;

  // Filter active quests
  const activeQuests = quests.filter(
    (q) => q.status === "in_progress" || q.status === "not_started"
  );

  return (
    <div className="fixed top-4 left-4 z-50 max-w-sm">
      {/* Player Progress Card */}
      {playerProgress && (
        <div className="mb-2 rounded-xl border border-slate-700 bg-slate-900/95 p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs text-slate-400">Player Level</div>
              <div className="text-2xl font-bold text-sky-400">
                {playerProgress.level}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">XP</div>
              <div className="text-sm font-semibold">
                {playerProgress.xp} / {playerProgress.xpToNextLevel}
              </div>
            </div>
          </div>
          {/* XP Progress Bar */}
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-300"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Quests Panel */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <span className="font-semibold">Active Quests</span>
            {activeQuests.length > 0 && (
              <span className="text-xs bg-sky-500 text-white px-2 py-0.5 rounded-full">
                {activeQuests.length}
              </span>
            )}
          </div>
          <span className="text-slate-400">
            {isExpanded ? "▼" : "▶"}
          </span>
        </button>

        {/* Quest List */}
        {isExpanded && (
          <div className="border-t border-slate-700 max-h-96 overflow-y-auto">
            {activeQuests.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">
                No active quests. Explore the world to find new adventures!
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {activeQuests.map((quest) => (
                  <div key={quest.id} className="p-3">
                    {/* Quest Title */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="font-medium text-sm">{quest.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {quest.description}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            quest.difficulty === "easy"
                              ? "bg-green-500/20 text-green-400"
                              : quest.difficulty === "medium"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {quest.difficulty}
                        </span>
                        <span className="text-xs text-sky-400 mt-1">
                          +{quest.xpReward} XP
                        </span>
                      </div>
                    </div>

                    {/* Objectives */}
                    <div className="space-y-1">
                      {quest.objectives.map((objective) => (
                        <div
                          key={objective.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={objective.completed}
                            readOnly
                            className="rounded border-slate-600"
                          />
                          <span
                            className={
                              objective.completed
                                ? "line-through text-slate-500"
                                : "text-slate-300"
                            }
                          >
                            {objective.description}
                          </span>
                          {objective.target && (
                            <span className="text-slate-500 ml-auto">
                              {objective.current || 0}/{objective.target}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
