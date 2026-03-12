import React from 'react';
import { 
  Navigation, 
  Layers, 
  Droplets, 
  Zap, 
  Activity, 
  ShieldAlert,
  Moon,
  Sun,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface MapControlsProps {
  onRecenter: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  streetMode: boolean;
  onToggleStreet: () => void;
  drainageMode: boolean;
  onToggleDrainage: () => void;
  infraMode: boolean;
  onToggleInfra: () => void;
  resourceMode: boolean;
  onToggleResource: () => void;
  priorityMode: boolean;
  onTogglePriority: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onRecenter,
  isDark,
  onToggleDark,
  streetMode,
  onToggleStreet,
  drainageMode,
  onToggleDrainage,
  infraMode,
  onToggleInfra,
  resourceMode,
  onToggleResource,
  priorityMode,
  onTogglePriority
}) => {
  const ControlButton = ({ icon: Icon, active, onClick, label }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "p-3 rounded-2xl border shadow-lg transition-all flex items-center gap-3 group relative",
        active 
          ? (isDark ? "bg-white text-black border-white" : "bg-zinc-900 text-white border-zinc-900")
          : (isDark ? "bg-zinc-950/80 border-white/10 text-white hover:bg-zinc-900" : "bg-white/80 border-zinc-200 text-zinc-900 hover:bg-zinc-50")
      )}
    >
      <Icon size={18} />
      <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block whitespace-nowrap">{label}</span>
    </button>
  );

  return (
    <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
      <ControlButton icon={Navigation} onClick={onRecenter} label="Recenter" />
      <ControlButton icon={isDark ? Sun : Moon} onClick={onToggleDark} active={isDark} label={isDark ? "Light Mode" : "Dark Mode"} />
      
      <div className="w-full h-px bg-zinc-500/20 my-2" />
      
      <ControlButton icon={Layers} onClick={onToggleStreet} active={streetMode} label="Street Network" />
      <ControlButton icon={Droplets} onClick={onToggleDrainage} active={drainageMode} label="Drainage Network" />
      <ControlButton icon={Zap} onClick={onToggleInfra} active={infraMode} label="Infrastructure" />
      <ControlButton icon={Activity} onClick={onToggleResource} active={resourceMode} label="Resources" />
      <ControlButton icon={ShieldAlert} onClick={onTogglePriority} active={priorityMode} label="Priority Zones" />
    </div>
  );
};
