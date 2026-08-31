import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Activity, UserCircle, Building2 } from 'lucide-react';

export default function HistoryTimeline({ 
  currentPatientLogs, 
  highRiskThreshold, 
  setSelectedLogId, 
  selectedLog, 
  setSelectedLogIdNull,
  isLoading,
  selectedPatient
}) {
  return (
    <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-purple-400" /> History Timeline
        </h3>
        <div className="w-full h-[300px] min-w-0">
          {isLoading ? (
            <div className="h-full w-full bg-slate-950/50 animate-pulse rounded-xl border border-slate-800/60"></div>
          ) : !currentPatientLogs || currentPatientLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 text-xs">No records tracked yet. Commit a log entry on the left panel.</div>
          ) : (
            <ResponsiveContainer width="99%" height="100%">
              <LineChart data={currentPatientLogs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} domain={[40, 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: 12 }} />
                <Line type="monotone" dataKey="glucose" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill: '#14b8a6', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Mini Inline History Display */}
      <div className="mt-4 border-t border-slate-800/80 pt-3">
        <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Recent Checkup Notes (Click to expand)</span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[46px] rounded-lg border border-slate-800/60 bg-slate-950/40 animate-pulse"></div>
            ))
          ) : (
            (currentPatientLogs || []).slice(-3).reverse().map(l => (
              <button 
                key={l.id} 
                onClick={() => setSelectedLogId(l.id)}
                className={`text-left p-2 rounded-lg border transition-all text-[11px] ${selectedLog?.id === l.id ? 'bg-teal-500/20 border-teal-500/50' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}`}
              >
                <div className="flex justify-between font-medium"><span className="text-slate-500">{l.date}</span> <span className={l.glucose >= highRiskThreshold ? 'text-rose-400' : 'text-teal-400'}>{l.glucose} mg/dL</span></div>
                <div className="text-slate-600 italic truncate mt-0.5">Sx: {l.symptoms}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* LOG DETAIL MODAL / FULL VIEW */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
            
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-full ${selectedLog.glucose >= highRiskThreshold ? 'bg-rose-500/20' : 'bg-teal-500/20'}`}>
                <Activity className={`w-6 h-6 ${selectedLog.glucose >= highRiskThreshold ? 'text-rose-400' : 'text-teal-400'}`} />
              </div>
              <div>
                <h4 className="font-bold text-slate-100">Diagnostic Entry for {selectedPatient?.name}</h4>
                <p className="text-xs text-slate-500">{selectedLog.date}</p>
              </div>
            </div>

            <div className="space-y-4 overflow-y-auto p-2 bg-slate-950/50 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Glucose Level</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-black ${selectedLog.glucose >= highRiskThreshold ? 'text-rose-500' : 'text-teal-500'}`}>{selectedLog.glucose}</span>
                    <span className="text-slate-500 text-xs font-medium">mg/dL</span>
                  </div>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Blood Pressure</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-slate-200">{selectedLog.systolic || '--'}/{selectedLog.diastolic || '--'}</span>
                    <span className="text-slate-500 text-[10px] font-medium ml-1">mmHg</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Body Weight</span>
                  <span className="text-sm font-semibold text-slate-300">{selectedLog.weight || '--'} kg</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Pulse Rate</span>
                  <span className="text-sm font-semibold text-slate-300">{selectedLog.pulse || '--'} bpm</span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Current Medication</span>
                <p className="text-sm font-semibold text-sky-400">{selectedLog.medication || 'None Prescribed'}</p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Verified Symptoms</span>
                <p className="text-sm text-slate-300 leading-relaxed italic">"{selectedLog.symptoms}"</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                  <UserCircle className="w-6 h-6 text-slate-500" />
                  <div className="overflow-hidden">
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Clinician</span>
                    <p className="text-xs font-semibold text-slate-200 truncate">{selectedLog.clinician || 'System'}</p>
                  </div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-slate-500" />
                  <div className="overflow-hidden">
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Facility</span>
                    <p className="text-xs font-semibold text-slate-200 truncate">{selectedLog.facility || 'Unknown'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className={`text-[10px] font-bold py-2 px-3 rounded-lg border text-center uppercase tracking-widest ${selectedLog.glucose >= highRiskThreshold ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-teal-500/10 border-teal-500/30 text-teal-400'}`}>
                  {selectedLog.glucose >= highRiskThreshold ? 'Clinical Intervention Recommended' : 'Stable Monitoring Status'}
                </div>
              </div>
            </div>

            <button 
              onClick={setSelectedLogIdNull}
              className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-all"
            >
              Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
