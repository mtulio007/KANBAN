
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  compact?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, compact = false }) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  
  // Blue for progress (standard), Light Green for complete, Amber for started/low
  let colorClass = 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'; // Blue
  
  if (percentage >= 100) {
      colorClass = 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]'; // Light Green
  } else if (percentage < 30) {
      colorClass = 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'; // Amber
  }

  if (compact) {
    return (
        <div className="flex items-center gap-3 w-full">
            <div className="flex-1 bg-gray-700/50 rounded-full h-3 overflow-hidden border border-gray-600/50">
                <div 
                className={`h-full rounded-full transition-all duration-500 ${colorClass}`} 
                style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <span className="text-sm font-bold text-white w-12 text-right drop-shadow-sm">{percentage.toFixed(0)}%</span>
        </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1 text-gray-400 font-medium">
        <span>Progresso</span>
        <span>{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-right mt-1 text-gray-500">
        {current} / {total} unidades
      </div>
    </div>
  );
};
