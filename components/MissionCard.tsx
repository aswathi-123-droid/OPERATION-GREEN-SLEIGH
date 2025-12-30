import React, { useState, useRef, useEffect } from 'react';
import { Mission, MissionStatus } from '../types';
import { ShieldAlert, Zap, UserCheck, CheckCircle, Trash2, Radio, Sparkles, MapPin, Gift, Bot, AlertTriangle } from 'lucide-react';
import { ELVES } from '../constants';
import gsap from 'gsap';

interface MissionCardProps {
  mission: Mission;
  onUpdateStatus: (id: string, status: MissionStatus, elf?: string) => void;
  onDelete: (id: string) => void;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, onUpdateStatus, onDelete }) => {
  const [selectedElf, setSelectedElf] = useState(ELVES[0]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  // Animation handlers
  const onEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { 
        y: -8, 
        boxShadow: "0 20px 40px -5px rgba(220, 38, 38, 0.15)",
        borderColor: mission.status === 'Cleaned' ? '#86efac' : '#fca5a5',
        duration: 0.3 
      });
    }
  };

  const onLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { 
        y: 0, 
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
        borderColor: '#f1f5f9',
        duration: 0.3 
      });
    }
  };

  const handleAnalyze = async () => {
    // Toggle close if already open
    if (analysis) {
        setAnalysis(null);
        return;
    }

    setIsAnalyzing(true);
    
    // Simulate API Delay
    setTimeout(() => {
        const protocols = [
          "Deploy biodegradable glitter countermeasures.",
          "Activate Reindeer Shielding Protocol Alpha.",
          "Utilize candy-cane grappling hooks for waste retrieval.",
          "Dispatch Snow-Bot unit for heavy lifting.",
          "Neutralize toxins with peppermint extract.",
          "Engage Silent Night cleaning mode."
        ];
        const randomProtocol = protocols[Math.floor(Math.random() * protocols.length)];
        
        const generatedAnalysis = `TARGET: ${mission.sector}\nHAZARD: ${mission.wasteType}\nDIRECTIVE: ${randomProtocol}\nSTATUS: Priority Level ${mission.pollutionLevel}`;
        
        setAnalysis(generatedAnalysis);
        setIsAnalyzing(false);
    }, 1000);
  };

  // Animate the analysis box when it opens
  useEffect(() => {
    if (analysis && analysisRef.current) {
      gsap.fromTo(analysisRef.current, 
        { height: 0, opacity: 0, marginTop: 0 },
        { height: "auto", opacity: 1, marginTop: 16, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [analysis]);

  const getPollutionColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'Low': return 'text-green-600 bg-green-50 border-green-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-red-500 text-white shadow-red-200';
      case 'Dispatching': return 'bg-yellow-500 text-white shadow-yellow-200';
      case 'Cleaned': return 'bg-green-500 text-white shadow-green-200';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div 
      id={`mission-${mission._id}`}
      ref={cardRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="mission-card relative bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden group transition-all duration-300 flex flex-col"
    >
      {/* Festive Top Decoration (Candy Cane Stripe) */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[repeating-linear-gradient(45deg,#ef4444,#ef4444_10px,#ffffff_10px,#ffffff_20px)] z-10 opacity-80" />

      {/* Snowfall Effect Container (Hidden by default, visible on hover) */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0">
         {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute text-slate-200 animate-[fall_3s_linear_infinite]" 
                 style={{ 
                   left: `${Math.random() * 100}%`, 
                   top: `-${Math.random() * 20}px`, 
                   animationDelay: `${Math.random() * 2}s`,
                   fontSize: `${Math.random() * 10 + 10}px`
                 }}>
               ❄
            </div>
         ))}
      </div>

      <div className="p-6 relative z-10 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            {/* Hanging Ornament Status */}
            <div className="relative mb-3 inline-block">
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-200 group-hover:bg-red-300 transition-colors"></div>
               <span className={`relative z-10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1 ${getStatusBadgeStyle(mission.status)}`}>
                  {mission.status === 'Cleaned' ? <Sparkles className="w-3 h-3" /> : <Radio className="w-3 h-3 animate-pulse" />}
                  {mission.status}
               </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 leading-tight flex items-center gap-2 font-orbitron mt-1">
               <MapPin className="w-5 h-5 text-red-400" />
               {mission.sector}
            </h3>
          </div>
          
          <div className="flex flex-col gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
             <button 
              onClick={handleAnalyze}
              className={`p-2.5 rounded-xl transition-all shadow-sm ${
                isAnalyzing ? 'bg-indigo-100 text-indigo-500 animate-pulse' 
                : analysis ? 'bg-indigo-500 text-white rotate-0' 
                : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white hover:rotate-12'
              }`}
              title="Tactical Analysis"
              disabled={isAnalyzing}
            >
              <Bot className="w-4 h-4" />
            </button>
             <button 
              onClick={() => onDelete(mission._id)}
              className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all hover:-rotate-12 shadow-sm"
              title="Abort Mission"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex gap-3">
             <div className={`flex-1 p-3 rounded-2xl border-2 flex items-center gap-3 transition-colors ${getPollutionColor(mission.pollutionLevel)}`}>
                <div className="p-2 bg-white/60 rounded-full backdrop-blur-sm">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase opacity-70">Threat</p>
                   <p className="font-bold text-sm leading-none">{mission.pollutionLevel}</p>
                </div>
             </div>
             <div className={`flex-1 p-3 rounded-2xl border-2 flex items-center gap-3 transition-colors ${mission.isSafeForReindeer ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                <div className="p-2 bg-white/60 rounded-full backdrop-blur-sm">
                  {mission.isSafeForReindeer ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>
                 <div>
                   <p className="text-[10px] font-bold uppercase opacity-70">Reindeer Safe</p>
                   <p className="font-bold text-sm leading-none">{mission.isSafeForReindeer ? 'YES' : 'NO'}</p>
                </div>
             </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:border-slate-200 transition-colors relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 text-slate-100 rotate-12 group-hover:rotate-0 transition-transform duration-500">
               <Gift className="w-16 h-16" />
             </div>
             <p className="text-slate-400 text-[10px] font-bold uppercase mb-1 relative z-10">Waste Signature</p>
             <p className="text-slate-700 font-medium text-sm relative z-10">{mission.wasteType}</p>
          </div>
          
          {/* Simulated Tactical Analysis Window */}
          {analysis && (
            <div ref={analysisRef} className="overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-100 relative">
               <div className="px-4 py-2 border-b border-indigo-100 flex items-center gap-2 bg-white/50">
                  <Bot className="w-3 h-3 text-indigo-500" />
                  <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase flex-1">Krampus-01 Tactical</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
               </div>
               <div className="p-4 text-sm text-slate-700 font-mono leading-relaxed relative whitespace-pre-wrap">
                   <p>{analysis}</p>
                   {/* Decoration */}
                   <div className="absolute bottom-2 right-2 opacity-10">
                     <Bot className="w-12 h-12" />
                   </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 group-hover:bg-white transition-colors relative z-10">
        {mission.status === 'Pending' && (
          <div className="flex flex-col gap-2">
            <select 
              value={selectedElf}
              onChange={(e) => setSelectedElf(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all cursor-pointer font-bold"
            >
              {ELVES.map(elf => <option key={elf} value={elf}>{elf}</option>)}
            </select>
            <button 
              onClick={() => onUpdateStatus(mission._id, 'Dispatching', selectedElf)}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-500/20 group/btn"
            >
              <Zap className="w-4 h-4 group-hover/btn:fill-white" /> Deploy Team
            </button>
          </div>
        )}

        {mission.status === 'Dispatching' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-yellow-700 text-sm bg-yellow-50 p-2.5 rounded-xl border border-yellow-200 justify-center shadow-sm">
              <UserCheck className="w-4 h-4" />
              <span className="font-bold">{mission.elfAssigned}</span>
            </div>
            <button 
              onClick={() => onUpdateStatus(mission._id, 'Cleaned')}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Report Success
            </button>
          </div>
        )}

        {mission.status === 'Cleaned' && (
          <div className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-green-500/20 animate-[pulse_3s_infinite]">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            SECTOR SECURED
          </div>
        )}
      </div>
      
      {/* CSS for custom snowflake fall */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MissionCard;