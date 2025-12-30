import React from 'react';
import { Stats } from '../types';
import { Activity, Globe2, Users, CheckCircle2 } from 'lucide-react';

interface StatsPanelProps {
  stats: Stats;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Card 1 */}
      <div className="glass-panel p-6 rounded-3xl border-0 bg-white shadow-xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        <div className="flex items-center justify-between relative z-10">
           <div>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Missions</p>
             <p className="text-4xl font-orbitron font-bold text-slate-800">{stats.totalMissions}</p>
           </div>
           <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
             <Globe2 size={28} />
           </div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="glass-panel p-6 rounded-3xl border-0 bg-white shadow-xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        <div className="flex items-center justify-between relative z-10">
           <div>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Active Threats</p>
             <p className="text-4xl font-orbitron font-bold text-red-500">{stats.activePollution}</p>
           </div>
           <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
             <Activity size={28} />
           </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="glass-panel p-6 rounded-3xl border-0 bg-white shadow-xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        <div className="flex items-center justify-between relative z-10">
           <div>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Elves Deployed</p>
             <p className="text-4xl font-orbitron font-bold text-yellow-500">{stats.elvesDeployed}</p>
           </div>
           <div className="p-3 bg-yellow-50 text-yellow-500 rounded-2xl">
             <Users size={28} />
           </div>
        </div>
      </div>

      {/* Card 4 */}
      <div className="glass-panel p-6 rounded-3xl border-0 bg-white shadow-xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        <div className="flex items-center justify-between relative z-10">
           <div>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Sectors Cleaned</p>
             <p className="text-4xl font-orbitron font-bold text-green-500">{stats.sectorsCleaned}</p>
           </div>
           <div className="p-3 bg-green-50 text-green-500 rounded-2xl">
             <CheckCircle2 size={28} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;