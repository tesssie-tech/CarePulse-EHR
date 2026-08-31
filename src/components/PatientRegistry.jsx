import { Users, X } from 'lucide-react';
import React from 'react';

export default function PatientRegistry({ 
  patients, 
  selectedPatientId, 
  setSelectedPatientId, 
  setCurrentView,
  isLoading,
  searchQuery,
  setSearchQuery
}) {
  const displayedPatients = React.useMemo(() => {
    if (!searchQuery) {
      return (patients || []).slice(-6).reverse();
    }
    return (patients || []).filter(p => 
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patients, searchQuery]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex flex-col gap-3 mb-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Users className="w-3.5 h-3.5 text-teal-500" /> Active Registry Records
        </h3>
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Search registry..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
          <Users className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-hide">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-full p-3 rounded-xl border border-slate-800/60 bg-slate-950/40 animate-pulse flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <div className="h-3.5 bg-slate-800 rounded w-1/2"></div>
                <div className="h-3.5 bg-slate-800 rounded w-1/4"></div>
              </div>
              <div className="h-2.5 bg-slate-800 rounded w-3/4 mt-1"></div>
            </div>
          ))
        ) : displayedPatients.length > 0 ? (
          displayedPatients.map(patient => (
          <button
            key={patient.id}
            onClick={() => setSelectedPatientId(patient.id)}
            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${selectedPatientId === patient.id ? 'bg-teal-500/10 border-teal-500/60 text-teal-300' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-400'}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">{patient.name}</span>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${patient.riskStatus === 'High Risk' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {patient.riskStatus}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">{patient.age} Yrs • {patient.gender} • {patient.location}</div>
          </button>
          ))
        ) : (
          <div className="p-8 text-center text-slate-600 text-xs">
            No patients found matching your search.
          </div>
        )}
        {!isLoading && !searchQuery && (patients?.length || 0) > 6 && (
          <button 
            onClick={() => setCurrentView('patients')}
            className="w-full py-2 text-[10px] font-bold text-teal-500/60 hover:text-teal-400 uppercase tracking-widest transition-all"
          >
            + {(patients?.length || 0) - 6} more in full registry
          </button>
        )}
      </div>
    </div>
  );
}
