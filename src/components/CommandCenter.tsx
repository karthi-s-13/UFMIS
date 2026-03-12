import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  ShieldCheck, 
  Zap, 
  Droplets, 
  AlertTriangle, 
  Navigation, 
  FileText, 
  X,
  ArrowUpRight,
  Settings,
  Users,
  Truck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Infrastructure, Resource, HydrologyData } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CommandCenterProps {
  infrastructure: Infrastructure[];
  resources: Resource[];
  onDeploy: (resourceId: string, targetArea: string) => void;
  isDark: boolean;
  hydrology: HydrologyData | null;
  report: any;
  onCloseReport: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  infrastructure,
  resources,
  onDeploy,
  isDark,
  hydrology,
  report,
  onCloseReport
}) => {
  const pumps = infrastructure.filter(i => i.type === 'pump');
  const sensors = infrastructure.filter(i => i.type === 'sensor');
  const relief = infrastructure.filter(i => i.type === 'relief');

  const mockChartData = [
    { time: '00:00', level: 1.2 },
    { time: '04:00', level: 1.5 },
    { time: '08:00', level: 2.1 },
    { time: '12:00', level: 2.8 },
    { time: '16:00', level: 2.4 },
    { time: '20:00', level: 2.2 },
  ];

  return (
    <div className={cn(
      "flex-1 flex flex-col h-full overflow-hidden",
      isDark ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* Header */}
      <div className={cn(
        "px-8 py-6 border-b flex items-center justify-between",
        isDark ? "border-white/10 bg-zinc-900/50" : "border-zinc-200 bg-white"
      )}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Government Command Center</h1>
            <p className="text-xs font-medium opacity-50 uppercase tracking-widest">Urban Flood Micro-Hotspot Intelligence System (UFMIS)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "px-4 py-2 rounded-xl border flex items-center gap-2",
            isDark ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200"
          )}>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">System Live</span>
          </div>
          <button className={cn(
            "p-2 rounded-xl border transition-all",
            isDark ? "bg-zinc-900 border-white/10 hover:bg-zinc-800" : "bg-white border-zinc-200 hover:bg-zinc-50"
          )}>
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Pumps', value: pumps.filter(p => p.status === 'active').length, total: pumps.length, icon: Zap, color: 'text-amber-500' },
            { label: 'Sensor Network', value: sensors.filter(s => s.status === 'active').length, total: sensors.length, icon: Activity, color: 'text-emerald-500' },
            { label: 'Rescue Teams', value: resources.filter(r => r.type === 'rescue' && r.status === 'available').length, total: resources.filter(r => r.type === 'rescue').length, icon: Users, color: 'text-blue-500' },
            { label: 'Relief Capacity', value: '42%', total: '100%', icon: ShieldCheck, color: 'text-purple-500' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-6 rounded-3xl border shadow-sm",
                isDark ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl bg-zinc-500/10", stat.color)}>
                  <stat.icon size={20} />
                </div>
                <ArrowUpRight size={16} className="opacity-30" />
              </div>
              <div className="text-3xl font-black tracking-tighter mb-1">{stat.value}<span className="text-lg opacity-30 font-medium">/{stat.total}</span></div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-50">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Middle Section: Hydrology & Infrastructure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hydrology Engine */}
          <div className={cn(
            "lg:col-span-2 p-8 rounded-[40px] border shadow-sm",
            isDark ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200"
          )}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black tracking-tighter uppercase">Hydrology Engine</h2>
                <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest">Real-time accumulation & flow dynamics</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest">Live Stream</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-500/5 border border-zinc-500/10">
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">Net Accumulation</div>
                  <div className="text-2xl font-black tracking-tighter">{hydrology?.netAccumulation.toFixed(1)} <span className="text-sm font-medium opacity-30">mm</span></div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-500/5 border border-zinc-500/10">
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">Drainage Efficiency</div>
                  <div className="text-2xl font-black tracking-tighter">{(hydrology?.drainageEfficiency! * 100).toFixed(0)}%</div>
                </div>
              </div>
              <div className="md:col-span-2 h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData}>
                    <defs>
                      <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#ffffff10' : '#00000010'} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 4]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: isDark ? '#18181b' : '#ffffff', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="level" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLevel)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-zinc-500/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold uppercase">River Levels</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-500/30" />
                <span className="text-[10px] font-bold uppercase">Historical Avg</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className={cn(
            "p-8 rounded-[40px] border shadow-sm",
            isDark ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200"
          )}>
            <h2 className="text-xl font-black tracking-tighter uppercase mb-6">Infrastructure</h2>
            <div className="space-y-4">
              {pumps.map(pump => (
                <div key={pump.id} className="p-4 rounded-2xl bg-zinc-500/5 border border-zinc-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      pump.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      <Zap size={18} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold">{pump.name}</div>
                      <div className="text-[9px] opacity-50 uppercase font-bold tracking-widest">{pump.status}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-mono font-bold">{(pump.health! * 100).toFixed(0)}%</div>
                    <div className="text-[8px] opacity-30 uppercase font-bold">Health</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 rounded-2xl bg-zinc-500/10 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-500/20 transition-all">
              View All Assets
            </button>
          </div>
        </div>

        {/* Bottom Section: Resource Deployment & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
          {/* Resource Deployment */}
          <div className={cn(
            "p-8 rounded-[40px] border shadow-sm",
            isDark ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-tighter uppercase">Resource Deployment</h2>
              <Truck size={20} className="opacity-30" />
            </div>
            <div className="space-y-4">
              {resources.map(res => (
                <div key={res.id} className="p-4 rounded-2xl bg-zinc-500/5 border border-zinc-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      res.status === 'available' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                    )}>
                      {res.type === 'rescue' ? <Users size={18} /> : <Truck size={18} />}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold">{res.name}</div>
                      <div className="text-[9px] opacity-50 uppercase font-bold tracking-widest">{res.status}</div>
                    </div>
                  </div>
                  {res.status === 'available' && (
                    <button 
                      onClick={() => onDeploy(res.id, 'Critical Zone A')}
                      className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-all"
                    >
                      Deploy
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Alerts & Reports */}
          <div className={cn(
            "p-8 rounded-[40px] border shadow-sm",
            isDark ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-tighter uppercase">Active Alerts</h2>
              <AlertTriangle size={20} className="text-red-500 animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-red-500 text-white">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-red-500 uppercase">Flash Flood Warning</div>
                  <p className="text-[10px] opacity-70 mt-1">Intense rainfall detected in Velachery. Expected accumulation: 45mm in 2 hours.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-amber-500 text-white">
                  <Activity size={16} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-500 uppercase">River Level Advisory</div>
                  <p className="text-[10px] opacity-70 mt-1">Adyar River approaching 75% capacity. Monitoring downstream flow.</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => {/* Trigger report fetch */}}
              className="w-full mt-6 py-3 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2"
            >
              <FileText size={16} />
              Generate Situation Report (SITREP)
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {report && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "max-w-2xl w-full p-10 rounded-[40px] shadow-2xl relative",
              isDark ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
            )}
          >
            <button 
              onClick={onCloseReport}
              className="absolute top-8 right-8 p-2 rounded-full hover:bg-zinc-500/10 transition-all"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-red-500 text-white">
                <FileText size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase">{report.title}</h2>
                <p className="text-xs font-medium opacity-50 uppercase tracking-widest">{report.date}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-zinc-500/5 border border-zinc-500/10">
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3">Executive Summary</h3>
                <p className="text-sm leading-relaxed">{report.summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-500/5 border border-zinc-500/10">
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">Active Pumps</div>
                  <div className="text-xl font-black">{report.metrics.activePumps}</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-500/5 border border-zinc-500/10">
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">Deployed Teams</div>
                  <div className="text-xl font-black">{report.metrics.deployedTeams}</div>
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {report.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button 
              onClick={() => window.print()}
              className="w-full mt-10 py-4 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Export as PDF
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
