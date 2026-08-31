import { User, Phone, MapPin, Calendar, Activity, ClipboardList, Clock, Pill, Edit, UserCircle, Building2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function PatientProfileView({ selectedPatient, currentPatientLogs, highRiskThreshold, setCurrentView }) {
  if (!selectedPatient) return null;

  // Statistical Calculations
  const totalLogs = currentPatientLogs?.length || 0;
  const avgGlucose = totalLogs > 0
    ? Math.round((currentPatientLogs || []).reduce((sum, log) => sum + log.glucose, 0) / totalLogs)
    : 0;

  return (
    <div className="flex flex-col gap-6 animate-slide-in-right">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-teal-400 flex items-center gap-2">
            <User className="w-5 h-5" /> Patient Profile 
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Diagnostic overview</p>
        </div>
        <div className="flex items-center gap-2">
          {setCurrentView && (
            <button 
              onClick={() => setCurrentView('edit-patient')}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-all uppercase tracking-widest"
            >
              <Edit className="w-3 h-3" /> Edit
            </button>
          )}
          <div className={`text-[10px] font-bold px-3 py-1 rounded-full border ${selectedPatient.riskStatus === 'High Risk' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} uppercase tracking-widest flex items-center`}>
            {selectedPatient.riskStatus}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Summary & Stats (Medical Card Panel) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
             {/* Decorative Background Icon */}
            <User className="absolute -right-8 -bottom-8 w-40 h-40 text-slate-800/20 pointer-events-none" />
            
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
              <ClipboardList className="w-3.5 h-3.5 text-teal-500" /> Identity Matrix
            </h3>

            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-teal-400 font-bold text-lg border border-slate-700">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-100 text-lg leading-tight">{selectedPatient.name}</div>
                  <div className="text-xs text-slate-500 font-mono">Patient ID: #{selectedPatient.id}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 mt-2">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Age</div>
                    <div className="text-sm font-semibold text-slate-300">{selectedPatient.age} Years</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <Activity className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Gender</div>
                    <div className="text-sm font-semibold text-slate-300">{selectedPatient.gender}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Contact</div>
                    <div className="text-sm font-semibold text-slate-300">{selectedPatient.phone || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Location</div>
                    <div className="text-sm font-semibold text-slate-300 truncate max-w-[120px]">{selectedPatient.location || 'Bwari Hub'}</div>
                  </div>
                </div>
              </div>

              {/* Metric Summary Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-center transition-all hover:border-teal-500/30">
                  <div className="text-2xl font-black text-teal-400 font-mono">{avgGlucose}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Average Fasting Glucose</div>
                </div>
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-center transition-all hover:border-emerald-500/30">
                  <div className="text-2xl font-black text-emerald-400 font-mono">{totalLogs}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Total Logged Checkups</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clinical History Timeline */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Health Chart at the top */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-purple-400" /> Glucose Trend Line
            </h3>
            <div className="w-full h-[300px] min-w-0">
              {totalLogs === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs text-center px-10">No records tracked yet. Commit a log entry on the dashboard panel to see trends.</div>
              ) : (
                <ResponsiveContainer width="99%" height="100%">
                  <LineChart data={currentPatientLogs}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#475569" fontSize={11} hide />
                    <YAxis stroke="#475569" fontSize={11} domain={[40, 'auto']} hide />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: 12 }} />
                    <Line type="monotone" dataKey="glucose" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill: '#14b8a6', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Vertical Timeline Feed Below */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col overflow-hidden">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2 shrink-0">
              <Clock className="w-3.5 h-3.5 text-rose-500" /> Chronological Care History Feed
            </h3>

            <div className="flex-1 overflow-y-auto pr-1 space-y-6 max-h-[500px] scrollbar-hide">
              {totalLogs === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50">
                  <ClipboardList className="w-10 h-10" />
                  <p className="text-xs text-center">No care history available for this record.<br/>Add daily logs to populate this feed.</p>
                </div>
              ) : (
                [...(currentPatientLogs || [])].reverse().map((log) => (
                  <div key={log.id} className="relative pl-8 border-l-2 border-slate-800 pb-2 flex group">
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ${log.glucose >= highRiskThreshold ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]'} border-4 border-slate-900 z-10`} />
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded uppercase">{new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-black ${log.glucose >= highRiskThreshold ? 'text-rose-500' : 'text-teal-400'}`}>{log.glucose} mg/dL</span>
                          {log.glucose >= highRiskThreshold && <span className="bg-rose-500/20 text-rose-500 text-[8px] px-1.5 py-0.5 rounded-full font-bold">HIGH RISK</span>}
                        </div>
                      </div>
                      <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/60 group-hover:border-slate-700 transition-all">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                            <Activity className="w-3 h-3 text-purple-400" />
                            <span>BP: {log.systolic || '---'}/{log.diastolic || '---'} mmHg</span>
                            <span className="text-slate-700">|</span>
                            <span>Weight: {log.weight || '---'} kg</span>
                            <span className="text-slate-700">|</span>
                            <span>Pulse: {log.pulse || '---'} bpm</span>
                          </div>

                          <div>
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block mb-1">Clinical Observations</span>
                            <p className="text-xs text-slate-200 leading-relaxed italic">
                              "{log.symptoms || 'No specific clinical symptoms were observed by the community health worker.'}"
                            </p>
                          </div>
                          
                          <div className="flex items-start gap-3 pt-3 border-t border-slate-800/50">
                            <div className="p-1.5 bg-sky-500/10 rounded-lg">
                              <Pill className="w-3.5 h-3.5 text-sky-400" />
                            </div>
                            <div className="flex-1">
                              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block mb-0.5">Integrated Medication Tracker</span>
                              <span className="text-xs font-semibold text-slate-100">{log.medication || 'No medication prescribed'}</span>
                            </div>
                          </div>

                          {log.notesAndTests && (
                            <div className="flex items-start gap-3 pt-3 border-t border-slate-800/50">
                              <div className="p-1.5 bg-purple-500/10 rounded-lg">
                                <ClipboardList className="w-3.5 h-3.5 text-purple-400" />
                              </div>
                              <div className="flex-1">
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block mb-0.5">Test Orders</span>
                                <p className="text-xs font-medium text-slate-200 leading-relaxed">{log.notesAndTests}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-800/50">
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 uppercase font-bold tracking-widest">
                              <UserCircle className="w-3 h-3 text-slate-400" />
                              <span>By: {log.clinician || 'System'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 uppercase font-bold tracking-widest">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[120px]">{log.facility || 'Unknown Facility'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
