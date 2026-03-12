import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Circle, Popup, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Map as MapIcon, 
  LayoutDashboard, 
  Sparkles, 
  CloudRain, 
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from './lib/utils';
import { 
  Ward, 
  Street, 
  DrainageLine, 
  Infrastructure, 
  Resource, 
  HydrologyData, 
  Hotspot 
} from './types';
import { CommandCenter } from './components/CommandCenter';
import { IntelligenceHub } from './components/IntelligenceHub';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { MapControls } from './components/MapControls';

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<'map' | 'command'>('map');
  const [isDark, setIsDark] = useState(true);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  
  // Data State
  const [wards, setWards] = useState<Ward[]>([]);
  const [streets, setStreets] = useState<Street[]>([]);
  const [drainageData, setDrainageData] = useState<DrainageLine[]>([]);
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [hydrology, setHydrology] = useState<HydrologyData | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [report, setReport] = useState<any>(null);

  // Map Layer Toggles
  const [streetMode, setStreetMode] = useState(true);
  const [drainageMode, setDrainageMode] = useState(true);
  const [infraMode, setInfraMode] = useState(true);
  const [resourceMode, setResourceMode] = useState(true);
  const [priorityMode, setPriorityMode] = useState(false);
  const [streetTypeFilter, setStreetTypeFilter] = useState<'all' | 'major' | 'small'>('all');
  const [criticalOnly, setCriticalOnly] = useState(false);

  const mapRef = useRef<any>(null);

  // --- Data Fetching ---
  const fetchData = async (r24: number = 45, r7: number = 120) => {
    try {
      const endpoints = [
        { url: '/api/predict', options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rainfall_24h: r24, rainfall_7d: r7 })
        }},
        { url: '/api/infrastructure' },
        { url: '/api/resources' },
        { url: '/api/hotspots' },
        { url: '/api/weather/chennai' }
      ];

      const responses = await Promise.all(endpoints.map(e => fetch(e.url, e.options)));
      
      for (const res of responses) {
        if (!res.ok) {
          const text = await res.text();
          console.error(`Fetch error for ${res.url}: ${res.status} ${res.statusText}`, text.slice(0, 100));
          throw new Error(`API ${res.url} failed with status ${res.status}`);
        }
      }

      const [pred, infra, res, hotspots, weather] = await Promise.all(responses.map(res => res.json()));
      
      setWards(pred.wards);
      setStreets(pred.streets);
      setDrainageData(pred.drainage);
      setHydrology(pred.hydrology);
      
      setInfrastructure(infra);
      setResources(res);
      setHotspots(hotspots);
      setWeather(weather);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---
  const handleSimulate = (r24: number, r7: number) => {
    fetchData(r24, r7);
    setShowSimulator(false);
  };

  const handleDeploy = async (resourceId: string, targetArea: string) => {
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, targetArea })
      });
      if (res.ok) {
        setResources(prev => prev.map(r => r.id === resourceId ? { ...r, status: 'deployed' } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.setView([13.04, 80.22], 12);
    }
  };

  const generateReport = async () => {
    try {
      const res = await fetch('/api/report');
      setReport(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={cn(
      "h-screen w-screen flex flex-col overflow-hidden font-sans selection:bg-red-500/30",
      isDark ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* Navigation Rail */}
      <div className={cn(
        "h-16 border-b flex items-center justify-between px-6 z-[2000] backdrop-blur-xl",
        isDark ? "bg-zinc-950/80 border-white/10" : "bg-white/80 border-zinc-200"
      )}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="text-sm font-black tracking-tighter uppercase">UFMIS <span className="opacity-30">v2.5</span></span>
          </div>
          <div className="h-6 w-px bg-zinc-500/20" />
          <div className="flex items-center gap-1">
            {[
              { id: 'map', label: 'Tactical Map', icon: MapIcon },
              { id: 'command', label: 'Command Center', icon: LayoutDashboard },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  view === tab.id 
                    ? (isDark ? "bg-white text-black" : "bg-zinc-900 text-white")
                    : (isDark ? "text-zinc-500 hover:text-white" : "text-zinc-400 hover:text-zinc-900")
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {weather && (
            <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-xl bg-zinc-500/5 border border-zinc-500/10">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase opacity-50">Live Rainfall</span>
                <span className="text-[11px] font-mono font-bold text-blue-500">{weather.rainfall_24h}mm</span>
              </div>
              <CloudRain size={16} className="text-blue-500" />
            </div>
          )}
          <button 
            onClick={() => setShowIntelligence(!showIntelligence)}
            className={cn(
              "p-2.5 rounded-xl border transition-all relative",
              showIntelligence ? "bg-purple-500 text-white border-purple-500" : (isDark ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200")
            )}
          >
            <Sparkles size={18} />
            {showIntelligence && <motion.div layoutId="sparkle" className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />}
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 flex relative overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'map' ? (
            <motion.div 
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 relative"
            >
              <MapContainer 
                center={[13.04, 80.22]} 
                zoom={12} 
                className={cn("h-full w-full contrast-125", isDark ? "grayscale brightness-90" : "")}
                zoomControl={false}
                ref={mapRef}
              >
                <TileLayer
                  url={isDark 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  }
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <MapControls 
                  onRecenter={handleRecenter} 
                  isDark={isDark} 
                  onToggleDark={() => setIsDark(!isDark)}
                  streetMode={streetMode}
                  onToggleStreet={() => setStreetMode(!streetMode)}
                  drainageMode={drainageMode}
                  onToggleDrainage={() => setDrainageMode(!drainageMode)}
                  infraMode={infraMode}
                  onToggleInfra={() => setInfraMode(!infraMode)}
                  resourceMode={resourceMode}
                  onToggleResource={() => setResourceMode(!resourceMode)}
                  priorityMode={priorityMode}
                  onTogglePriority={() => setPriorityMode(!priorityMode)}
                />

                {/* Drainage Network */}
                {drainageMode && drainageData.map((drain, idx) => (
                  <Polyline
                    key={`drain-${idx}`}
                    positions={drain.coords as any}
                    pathOptions={{
                      color: '#0ea5e9',
                      weight: drain.type === 'river' ? 8 : 4,
                      opacity: 0.7,
                      lineCap: 'round',
                      dashArray: drain.type === 'drain' ? '5, 10' : undefined
                    }}
                  >
                    <LeafletTooltip sticky>
                      <div className="p-2 space-y-1">
                        <div className="text-[11px] font-bold border-b border-sky-500/20 pb-1">{drain.name}</div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[9px] opacity-60 uppercase font-bold">Type</span>
                          <span className="text-[10px] font-bold uppercase">{drain.type}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[9px] opacity-60 uppercase font-bold">Capacity</span>
                          <span className="text-[10px] font-mono font-bold">{(drain.capacity * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </LeafletTooltip>
                  </Polyline>
                ))}

                {/* Infrastructure */}
                {infraMode && infrastructure.map((item, idx) => (
                  <Circle
                    key={`infra-${idx}`}
                    center={[item.lat, item.lng]}
                    radius={300}
                    pathOptions={{
                      fillColor: item.status === 'active' ? '#10b981' : item.status === 'standby' ? '#f59e0b' : '#ef4444',
                      fillOpacity: 0.8,
                      color: isDark ? 'white' : 'black',
                      weight: 1
                    }}
                  >
                    <Popup>
                      <div className="p-2 space-y-1">
                        <div className="text-xs font-bold">{item.name}</div>
                        <div className="text-[10px] opacity-70 uppercase font-bold">{item.type} | {item.status}</div>
                        {item.reading && <div className="text-[10px] font-mono">Reading: {item.reading}{item.unit}</div>}
                        {item.health && <div className="text-[10px]">Health: {(item.health * 100).toFixed(0)}%</div>}
                      </div>
                    </Popup>
                  </Circle>
                ))}

                {/* Resources */}
                {resourceMode && resources.map((res, idx) => (
                  <Circle
                    key={`res-${idx}`}
                    center={res.location as [number, number]}
                    radius={400}
                    pathOptions={{
                      fillColor: res.status === 'deployed' ? '#4f46e9' : '#10b981',
                      fillOpacity: 0.9,
                      color: 'white',
                      weight: 2,
                      dashArray: res.status === 'deployed' ? '5, 5' : undefined
                    }}
                  >
                    <Popup>
                      <div className="p-2 space-y-1">
                        <div className="text-xs font-bold">{res.name}</div>
                        <div className="text-[10px] opacity-70 uppercase font-bold">{res.type} | {res.status}</div>
                        <div className="text-[10px]">Personnel: {res.personnel || 'N/A'}</div>
                      </div>
                    </Popup>
                  </Circle>
                ))}

                {/* Area Risk Markers */}
                {wards.map(ward => {
                  const priorityRank = [...wards]
                    .sort((a, b) => {
                      const riskMap: any = { 'High': 3, 'Medium': 2, 'Low': 1 };
                      const scoreA = (riskMap[a.riskLevel!] * 1000) + (100 - a.readinessScore!);
                      const scoreB = (riskMap[b.riskLevel!] * 1000) + (100 - b.readinessScore!);
                      return scoreB - scoreA;
                    })
                    .findIndex(w => w.id === ward.id);
                  
                  const isPriority = priorityMode && priorityRank < 3;

                  return (
                    <Circle
                      key={ward.id}
                      center={ward.center as [number, number]}
                      radius={isPriority ? 800 : 500}
                      pathOptions={{
                        fillColor: ward.riskLevel === 'High' ? '#ef4444' : ward.riskLevel === 'Medium' ? '#f59e0b' : '#10b981',
                        fillOpacity: isPriority ? 0.7 : 0.5,
                        color: isPriority ? '#ef4444' : (isDark ? 'white' : 'black'),
                        weight: isPriority ? 3 : 1,
                      }}
                    >
                      <LeafletTooltip sticky>
                        <div className="p-2 flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-4">
                            <div className="font-bold">{ward.name} Area</div>
                            {isPriority && (
                              <div className="bg-red-500 text-white text-[8px] px-1 rounded font-black uppercase">Priority {priorityRank + 1}</div>
                            )}
                          </div>
                          <div className="text-[10px] uppercase font-bold tracking-tighter" style={{ color: ward.riskLevel === 'High' ? '#ef4444' : ward.riskLevel === 'Medium' ? '#f59e0b' : '#10b981' }}>
                            Risk: {ward.riskLevel}
                          </div>
                        </div>
                      </LeafletTooltip>
                    </Circle>
                  );
                })}

                {/* Street Network */}
                {streetMode && streets
                  .filter(s => (!criticalOnly || s.riskLevel === 'High'))
                  .filter(s => streetTypeFilter === 'all' || s.type === streetTypeFilter)
                  .map((street, idx) => (
                  <Polyline
                    key={`street-${idx}`}
                    positions={street.coords as any}
                    pathOptions={{
                      color: street.riskLevel === 'High' ? '#ef4444' : street.riskLevel === 'Medium' ? '#f59e0b' : '#3b82f6',
                      weight: street.type === 'major' ? (street.riskLevel === 'High' ? 6 : 4) : (street.riskLevel === 'High' ? 4 : 2.5),
                      opacity: street.type === 'major' ? (street.riskLevel === 'High' ? 1 : 0.8) : (street.riskLevel === 'High' ? 0.9 : 0.6),
                      lineCap: 'round',
                      dashArray: street.riskLevel === 'High' ? '10, 10' : undefined,
                    }}
                  >
                    <LeafletTooltip sticky>
                      <div className="p-2 space-y-1 min-w-[140px]">
                        <div className="text-[11px] font-bold border-b border-zinc-500/20 pb-1">{street.name}</div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[9px] opacity-60 uppercase font-bold">Elevation</span>
                          <span className="text-[10px] font-mono font-bold">{street.elevation}m</span>
                        </div>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-tighter">ML Risk</span>
                          <span className={cn(
                            "text-[10px] font-black px-1 rounded",
                            street.riskLevel === 'High' ? "text-red-500 bg-red-500/10" : 
                            street.riskLevel === 'Medium' ? "text-amber-500 bg-amber-500/10" : "text-blue-500 bg-blue-500/10"
                          )}>
                            {street.riskLevel} ({(street.probability! * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    </LeafletTooltip>
                  </Polyline>
                ))}

                {/* Hotspots */}
                {hotspots.map(h => (
                  <Circle
                    key={h.id}
                    center={[h.lat, h.lng]}
                    radius={h.radius}
                    pathOptions={{
                      fillColor: '#ef4444',
                      fillOpacity: 0.7,
                      color: '#7f1d1d',
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="p-2 space-y-1">
                        <div className="text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                          <AlertTriangle size={14} className="animate-pulse" />
                          Critical Hotspot
                        </div>
                        <div className="font-bold text-sm">{h.name}</div>
                        <div className="text-[10px] opacity-70">Intensity Index: {h.intensity}</div>
                      </div>
                    </Popup>
                  </Circle>
                ))}
              </MapContainer>

              {/* Scenario Simulator Toggle */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000]">
                <button 
                  onClick={() => setShowSimulator(!showSimulator)}
                  className={cn(
                    "px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all",
                    isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-zinc-800"
                  )}
                >
                  <CloudRain size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Scenario Simulator</span>
                </button>
              </div>

              {/* Simulator Overlay */}
              <AnimatePresence>
                {showSimulator && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 50, x: '-50%' }}
                    className="absolute bottom-24 left-1/2 z-[1001] w-[340px]"
                  >
                    <ScenarioSimulator onSimulate={handleSimulate} isDark={isDark} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              key="command"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1"
            >
              <CommandCenter 
                infrastructure={infrastructure}
                resources={resources}
                onDeploy={handleDeploy}
                isDark={isDark}
                hydrology={hydrology}
                report={report}
                onCloseReport={() => setReport(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intelligence Hub Sidebar */}
        <AnimatePresence>
          {showIntelligence && (
            <motion.div 
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className={cn(
                "absolute top-0 right-0 h-full w-[400px] z-[3000] border-l shadow-2xl",
                isDark ? "bg-zinc-950 border-white/10" : "bg-white border-zinc-200"
              )}
            >
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-zinc-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500 text-white">
                      <Sparkles size={18} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">Intelligence Hub</span>
                  </div>
                  <button onClick={() => setShowIntelligence(false)} className="p-2 rounded-full hover:bg-zinc-500/10">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <IntelligenceHub isDark={isDark} currentRiskData={{ wards, hydrology }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Alerts Overlay */}
      {hydrology?.status === 'Critical' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[4000] pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-2 rounded-full bg-red-500 text-white shadow-2xl flex items-center gap-3"
          >
            <AlertTriangle size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Critical Flood Risk Active</span>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default App;
