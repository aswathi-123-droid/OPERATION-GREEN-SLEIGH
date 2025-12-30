import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mission, MissionStatus, Stats, PollutionLevel } from './types';
import { fetchMissions, createMission, updateMissionStatus, deleteMission } from './services/missionService';
import MissionCard from './components/MissionCard';
import StatsPanel from './components/StatsPanel';
import GlobalMap from './components/GlobalMap';
import { Radar, Plus, Terminal, Snowflake, X, Sparkles, Bell, Gift, MapPin } from 'lucide-react';
import gsap from 'gsap';

const App: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Refs for animation
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const mapRef = useRef(null);
  const contentRef = useRef(null);
  const missionContainerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<SVGSVGElement>(null);

  // New Mission Form State
  const [newMissionSector, setNewMissionSector] = useState('');
  const [newMissionWaste, setNewMissionWaste] = useState('');
  const [newMissionLevel, setNewMissionLevel] = useState<PollutionLevel>('Medium');
  const [newMissionSafe, setNewMissionSafe] = useState(false);
  const [newMissionCoords, setNewMissionCoords] = useState<{lat: number, lon: number} | undefined>(undefined);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMissions();
      setMissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Initial Entrance Animation
  useEffect(() => {
    if (!loading) {
      const tl = gsap.timeline();
      
      tl.fromTo(headerRef.current, 
        { y: -100, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      )
      .fromTo(mapRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.2)" },
        "-=0.4"
      )
      .fromTo(statsRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      )
      .fromTo(".mission-card", 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
        "-=0.2"
      );
    }
  }, [loading]);

  // Modal Animation Effect
  useEffect(() => {
    if (showAddModal && modalRef.current) {
      // Modal Entrance
      gsap.fromTo(modalRef.current, 
        { scale: 0.8, opacity: 0, rotationX: 10, y: 50 },
        { scale: 1, opacity: 1, rotationX: 0, y: 0, duration: 0.6, ease: "back.out(1.5)" }
      );

      // Bell Swing Animation
      if (bellRef.current) {
        gsap.to(bellRef.current, {
          rotation: 15,
          duration: 0.2,
          yoyo: true,
          repeat: 5,
          ease: "power1.inOut"
        });
      }

      // Input Stagger
      gsap.fromTo(".modal-input-group", 
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.2, ease: "power2.out" }
      );
    }
  }, [showAddModal]);

  const handleMapLocationSelect = (data: { lat: number, lon: number, name: string }) => {
    setNewMissionSector(data.name);
    setNewMissionCoords({ lat: data.lat, lon: data.lon });
    setNewMissionWaste(''); // Reset waste
    setNewMissionLevel('Medium');
    setNewMissionSafe(false);
    setShowAddModal(true);
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newMissionSector || !newMissionWaste) return;

    try {
      const newMission = await createMission({
        sector: newMissionSector,
        wasteType: newMissionWaste,
        pollutionLevel: newMissionLevel,
        status: 'Pending',
        elfAssigned: 'Waiting for Santa...',
        isSafeForReindeer: newMissionSafe,
        coordinates: newMissionCoords
      });
      setMissions(prev => [...prev, newMission]);
      setShowAddModal(false);
      setNewMissionSector('');
      setNewMissionWaste('');
      setNewMissionLevel('Medium');
      setNewMissionSafe(false);
      setNewMissionCoords(undefined);
      
      // Animate new item
      setTimeout(() => {
         const cards = document.querySelectorAll('.mission-card');
         const lastCard = cards[cards.length - 1];
         gsap.fromTo(lastCard, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)" });
      }, 100);

    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, status: MissionStatus, elf?: string) => {
    try {
      const updated = await updateMissionStatus(id, status, elf);
      setMissions(prev => prev.map(m => m._id === id ? updated : m));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Animate deletion
      const card = document.getElementById(`mission-${id}`);
      if(card) {
        gsap.to(card, { 
          scale: 0.9, 
          opacity: 0, 
          duration: 0.3, 
          onComplete: async () => {
            await deleteMission(id);
            setMissions(prev => prev.filter(m => m._id !== id));
          }
        });
      } else {
        await deleteMission(id);
        setMissions(prev => prev.filter(m => m._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stats: Stats = {
    totalMissions: missions.length,
    activePollution: missions.filter(m => m.status === 'Pending').length,
    elvesDeployed: missions.filter(m => m.status === 'Dispatching').length,
    sectorsCleaned: missions.filter(m => m.status === 'Cleaned').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 relative selection:bg-red-200">
      
      {/* Decorative Background Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header ref={headerRef} className="sticky top-0 z-40 glass-panel border-b-0 px-6 py-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 rounded-xl shadow-lg shadow-red-500/30">
              <Snowflake className="text-white w-6 h-6 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider font-orbitron text-slate-900">
                OPERATION <span className="festive-gradient-text">GREEN SLEIGH</span>
              </h1>
              <p className="text-xs font-bold text-slate-400 tracking-[0.3em] uppercase">Santa's Eco-Command v2.1</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              SYSTEM ONLINE
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 relative z-10 space-y-8">
        
        {/* GLOBAL MAP */}
        <div ref={mapRef} className="rounded-3xl shadow-2xl shadow-blue-900/5 overflow-hidden border border-white">
           <GlobalMap missions={missions} onLocationSelect={handleMapLocationSelect} />
        </div>

        <div ref={statsRef}>
           <StatsPanel stats={stats} />
        </div>

        <div ref={contentRef}>
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-orbitron font-bold text-slate-800 flex items-center gap-3">
              <Radar className="text-red-500" /> 
              Active Sectors
            </h2>
            <button 
              onClick={() => {
                setNewMissionCoords(undefined);
                setNewMissionSector('');
                setNewMissionSafe(false);
                setShowAddModal(true);
              }}
              className="group bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> New Mission
            </button>
          </div>

          {loading ? (
            <div className="text-center py-24 bg-white/50 rounded-3xl border border-dashed border-slate-300">
              <div className="animate-spin w-12 h-12 border-4 border-slate-200 border-t-red-500 rounded-full mx-auto mb-4"></div>
              <p className="text-slate-500 font-bold animate-pulse">Scanning Global Sectors...</p>
            </div>
          ) : (
            <div ref={missionContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {missions.map(mission => (
                <MissionCard 
                  key={mission._id} 
                  mission={mission}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDelete}
                />
              ))}
              {missions.length === 0 && (
                 <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                    <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">All Clear!</h3>
                    <p className="text-slate-500">No active pollution detected. The world is clean!</p>
                 </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* NEW MISSION MODAL (White/Red/Green Theme) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-lg p-4 transition-all duration-300">
          <div 
            ref={modalRef} 
            className="bg-white border-2 border-red-50 rounded-[2rem] max-w-lg w-full shadow-2xl shadow-red-900/10 relative overflow-hidden"
          >
             {/* Decorative Background Glows - Adjusted for white bg */}
             <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-100 rounded-full blur-3xl pointer-events-none opacity-50"></div>
             <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-green-100 rounded-full blur-3xl pointer-events-none opacity-50"></div>
             
             {/* Hanging Ornament Decoration */}
             <div className="absolute -top-4 right-8 flex flex-col items-center animate-[sway_3s_ease-in-out_infinite_alternate] origin-top z-20">
                <div className="w-0.5 h-12 bg-yellow-400"></div>
                <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 w-8 h-8 rounded-full shadow-lg border border-yellow-200 flex items-center justify-center">
                   <div className="w-2 h-2 bg-white/70 rounded-full blur-[1px] absolute top-2 right-2"></div>
                </div>
             </div>

            <div className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-8 border-b border-red-50 pb-4">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-50 rounded-xl border border-red-100 shadow-sm">
                      <Bell ref={bellRef} className="text-red-500 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 font-orbitron tracking-wide">
                        NEW MISSION
                      </h3>
                      <p className="text-green-600 text-[10px] font-bold uppercase tracking-[0.2em]">Deploy Eco-Elves</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-red-500 transition-colors hover:rotate-90 duration-300 p-1"
                 >
                   <X className="w-6 h-6" />
                 </button>
              </div>

              <form onSubmit={handleCreateMission} className="space-y-6">
                <div className="modal-input-group">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <MapPin className="w-3 h-3 text-red-400" /> Target Sector
                  </label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={newMissionSector}
                      onChange={(e) => setNewMissionSector(e.target.value)}
                      placeholder="Enter Sector ID..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 placeholder-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-50 outline-none transition-all font-mono"
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">
                      <Terminal className="w-5 h-5" />
                    </div>
                  </div>
                   {newMissionCoords && (
                    <p className="text-[10px] text-green-600 font-mono mt-2 flex items-center gap-2 bg-green-50 p-2 rounded-lg border border-green-100">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      GPS LOCKED: {newMissionCoords.lat.toFixed(4)}, {newMissionCoords.lon.toFixed(4)}
                    </p>
                  )}
                </div>

                <div className="modal-input-group">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                     <Sparkles className="w-3 h-3 text-red-400" /> Contaminant Type
                  </label>
                  <input 
                    type="text" 
                    value={newMissionWaste}
                    onChange={(e) => setNewMissionWaste(e.target.value)}
                    placeholder="e.g. Glitter Bombs, Wrapping Paper"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 placeholder-slate-400 focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none transition-all font-mono"
                    required
                  />
                </div>

                <div className="modal-input-group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Toxicity Level</label>
                  <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
                    {(['Low', 'Medium', 'High'] as PollutionLevel[]).map(level => (
                      <button
                        type="button"
                        key={level}
                        onClick={() => setNewMissionLevel(level)}
                        className={`py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wide shadow-sm ${
                          newMissionLevel === level 
                          ? (level === 'High' ? 'bg-red-500 text-white shadow-red-200' : level === 'Medium' ? 'bg-yellow-400 text-white shadow-yellow-200' : 'bg-green-500 text-white shadow-green-200')
                          : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-input-group">
                  <div 
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                      newMissionSafe 
                        ? 'bg-green-50 border-green-100' 
                        : 'bg-white border-slate-100 hover:border-red-100'
                    }`} 
                    onClick={() => setNewMissionSafe(!newMissionSafe)}
                  >
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors shadow-sm ${newMissionSafe ? 'bg-green-500 border-green-500' : 'border-slate-300 bg-white'}`}>
                        {newMissionSafe && <div className="text-white text-xs font-bold">✓</div>}
                    </div>
                    
                    <div className="flex-1">
                      <label className="text-sm font-bold text-slate-700 select-none cursor-pointer block">
                         Flight Safety Check
                      </label>
                      <p className="text-[10px] text-slate-400">Is this sector safe for reindeer traversal?</p>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${newMissionSafe ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                       {newMissionSafe ? 'SAFE' : 'UNVERIFIED'}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-6 modal-input-group">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-4 text-slate-400 font-bold hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    ABORT
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-500 to-green-600 hover:from-red-600 hover:to-green-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-red-500/20 transition-transform active:scale-95 flex items-center justify-center gap-2 group border-b-4 border-green-700/20"
                  >
                    <Gift className="w-5 h-5 group-hover:animate-bounce" />
                    INITIATE MISSION
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;