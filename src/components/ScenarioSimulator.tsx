import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CloudRain, Play, RotateCcw, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ScenarioSimulatorProps {
  onSimulate: (rainfall24h: number, rainfall7d: number) => void;
  isDark: boolean;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ onSimulate, isDark }) => {
  const [rainfall24h, setRainfall24h] = useState(45);
  const [rainfall7d, setRainfall7d] = useState(120);

  const scenarios = [
    { name: 'Moderate Monsoon', r24: 30, r7: 80, color: 'bg-blue-500' },
    { name: 'Heavy Downpour', r24: 85, r7: 150, color: 'bg-amber-500' },
    { name: 'Extreme Event (2015)', r24: 250, r7: 400, color: 'bg-red-500' },
  ];

  return (
    <div className={cn(
      "p-6 rounded-[32px] border shadow-xl backdrop-blur-md",
      isDark ? "bg-zinc-950/90 border-white/10" : "bg-white/90 border-zinc-200"
    )}>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
          <CloudRain size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest">Scenario Simulator</h3>
          <p className="text-[9px] opacity-50 font-bold uppercase">Test urban resilience models</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Presets */}
        <div className="grid grid-cols-3 gap-2">
          {scenarios.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setRainfall24h(s.r24);
                setRainfall7d(s.r7);
              }}
              className={cn(
                "p-2 rounded-xl border text-[8px] font-black uppercase tracking-tighter transition-all text-center",
                isDark ? "bg-zinc-900 border-white/5 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
              )}
            >
              <div className={cn("w-1.5 h-1.5 rounded-full mx-auto mb-1", s.color)} />
              {s.name}
            </button>
          ))}
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50">24h Rainfall</label>
              <span className="text-xs font-mono font-bold">{rainfall24h}mm</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="500" 
              value={rainfall24h} 
              onChange={(e) => setRainfall24h(Number(e.target.value))}
              className="w-full h-1 bg-zinc-500/20 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50">7d Cumulative</label>
              <span className="text-xs font-mono font-bold">{rainfall7d}mm</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1000" 
              value={rainfall7d} 
              onChange={(e) => setRainfall7d(Number(e.target.value))}
              className="w-full h-1 bg-zinc-500/20 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Warning Indicator */}
        {rainfall24h > 100 && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertTriangle size={14} className="text-red-500 animate-pulse" />
            <span className="text-[9px] font-bold text-red-500 uppercase">Extreme Flood Risk Detected</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={() => onSimulate(rainfall24h, rainfall7d)}
            className="flex-1 py-3 rounded-2xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
          >
            <Play size={14} />
            Run Simulation
          </button>
          <button 
            onClick={() => { setRainfall24h(45); setRainfall7d(120); }}
            className={cn(
              "p-3 rounded-2xl border transition-all",
              isDark ? "bg-zinc-900 border-white/10 hover:bg-zinc-800" : "bg-white border-zinc-200 hover:bg-zinc-50"
            )}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
