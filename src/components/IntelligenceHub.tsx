import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Brain, 
  MessageSquare, 
  ChevronRight, 
  ShieldAlert,
  Lightbulb,
  BookOpen,
  Send
} from 'lucide-react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

interface IntelligenceHubProps {
  isDark: boolean;
  currentRiskData: any;
}

export const IntelligenceHub: React.FC<IntelligenceHubProps> = ({ isDark, currentRiskData }) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'chat' | 'protocols'>('insights');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const insights = [
    { 
      title: "Drainage Saturation Alert", 
      desc: "Buckingham Canal is at 85% capacity. Downstream flow in Adyar is restricted due to high tide (expected 22:00).",
      type: "critical",
      icon: ShieldAlert
    },
    { 
      title: "Resource Optimization", 
      desc: "ML models suggest moving 2 mobile pumps from Anna Nagar to Velachery to preemptively manage lake overflow.",
      type: "suggestion",
      icon: Lightbulb
    },
    { 
      title: "Historical Pattern Match", 
      desc: "Current accumulation matches the 2015 pre-flood signature. Recommend activating Level 3 protocols.",
      type: "analysis",
      icon: Brain
    }
  ];

  const protocols = [
    { id: 'p1', title: 'Level 1: Monitoring', status: 'completed' },
    { id: 'p2', title: 'Level 2: Resource Staging', status: 'active' },
    { id: 'p3', title: 'Level 3: Emergency Deployment', status: 'pending' },
    { id: 'p4', title: 'Level 4: Evacuation Advisory', status: 'pending' },
  ];

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are the UFMIS AI Assistant for Chennai Government. 
        Current Context: ${JSON.stringify(currentRiskData)}
        User Query: ${userMsg}
        Provide a concise, professional, and actionable response for a government official.`,
      });
      
      setChatHistory(prev => [...prev, { role: 'ai', text: response.text || "I'm sorry, I couldn't process that request." }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'ai', text: "Connection error. Please check system logs." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={cn(
      "h-full flex flex-col",
      isDark ? "bg-zinc-950 text-white" : "bg-white text-zinc-900"
    )}>
      {/* Tabs */}
      <div className="flex p-2 gap-1 border-b border-zinc-500/10">
        {[
          { id: 'insights', label: 'AI Insights', icon: Sparkles },
          { id: 'chat', label: 'AI Advisor', icon: MessageSquare },
          { id: 'protocols', label: 'Protocols', icon: BookOpen },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all",
              activeTab === tab.id 
                ? (isDark ? "bg-white text-black" : "bg-zinc-900 text-white")
                : (isDark ? "hover:bg-white/5" : "hover:bg-zinc-100")
            )}
          >
            <tab.icon size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'insights' && (
            <motion.div 
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {insights.map((insight, i) => (
                <div key={i} className={cn(
                  "p-5 rounded-3xl border flex gap-4",
                  insight.type === 'critical' ? "bg-red-500/10 border-red-500/20" :
                  insight.type === 'suggestion' ? "bg-amber-500/10 border-amber-500/20" :
                  "bg-blue-500/10 border-blue-500/20"
                )}>
                  <div className={cn(
                    "p-3 rounded-2xl h-fit",
                    insight.type === 'critical' ? "bg-red-500 text-white" :
                    insight.type === 'suggestion' ? "bg-amber-500 text-white" :
                    "bg-blue-500 text-white"
                  )}>
                    <insight.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight mb-1">{insight.title}</h4>
                    <p className="text-xs opacity-70 leading-relaxed">{insight.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              <div className="flex-1 space-y-4 mb-4">
                {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-8">
                    <Brain size={48} className="mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">Ask the AI Advisor about flood risk, resource allocation, or historical data.</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={cn(
                    "p-4 rounded-2xl text-xs max-w-[85%]",
                    msg.role === 'user' 
                      ? "ml-auto bg-blue-500 text-white" 
                      : (isDark ? "bg-zinc-900" : "bg-zinc-100")
                  )}>
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <div className={cn("p-4 rounded-2xl text-xs w-fit", isDark ? "bg-zinc-900" : "bg-zinc-100")}>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask UFMIS Advisor..."
                  className={cn(
                    "flex-1 px-4 py-3 rounded-2xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500",
                    isDark ? "bg-zinc-900 border-white/10" : "bg-zinc-50 border-zinc-200"
                  )}
                />
                <button 
                  onClick={handleSendMessage}
                  className="p-3 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'protocols' && (
            <motion.div 
              key="protocols"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {protocols.map((protocol, i) => (
                <div key={protocol.id} className={cn(
                  "p-4 rounded-2xl border flex items-center justify-between",
                  protocol.status === 'active' ? (isDark ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200") :
                  protocol.status === 'completed' ? "opacity-50" : "opacity-30"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black",
                      protocol.status === 'active' ? "bg-blue-500 text-white" :
                      protocol.status === 'completed' ? "bg-emerald-500 text-white" : "bg-zinc-500 text-white"
                    )}>
                      {i + 1}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-tight">{protocol.title}</span>
                  </div>
                  {protocol.status === 'active' && (
                    <div className="px-2 py-0.5 rounded bg-blue-500 text-white text-[8px] font-black uppercase">Active</div>
                  )}
                </div>
              ))}
              <div className="mt-8 p-6 rounded-[32px] bg-zinc-500/5 border border-dashed border-zinc-500/20">
                <h5 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Protocol Notes</h5>
                <p className="text-[10px] opacity-70 leading-relaxed">
                  Protocols are automatically suggested based on ML risk scores and historical rainfall patterns. Officials must manually confirm Level 3 and 4 escalations.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
