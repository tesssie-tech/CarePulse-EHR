import { AlertTriangle } from 'lucide-react';

export default function ReferralQueueView({ criticalReferrals, onDeployTransport }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold tracking-tight text-rose-400 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-rose-500" /> CDSS Critical Referral Queue</h2>
        <p className="text-xs text-slate-500 mt-0.5">Dashboard isolating high-risk patients.</p>
      </div>
      {/* Table for Desktop */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Patient Profile Name</th>
              <th className="p-4">Catchment Hub</th>
              <th className="p-4">Triage Status Indicator</th>
              <th className="p-4 text-center">Peak Verified Vitals</th>
              <th className="p-4 text-right">Emergency Workflow Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {!criticalReferrals || criticalReferrals.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-600 text-sm">Zero emergency anomalies tracked across active clinical centers.</td>
              </tr>
            ) : (
              [...(criticalReferrals || [])].reverse().map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/10 transition-all text-slate-300 animate-slide-in-right">
                  <td className="p-4">
                    <div className="font-semibold text-slate-200">{alert.patientName}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{alert.phone || 'N/A'}</div>
                  </td>
                  <td className="p-4 text-slate-400">{alert.location || 'Not Configured'}</td>
                  <td className="p-4">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded border tracking-wide uppercase ${
                      alert.triageIndicator.includes('Dual') 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                        : alert.triageIndicator.includes('Hyperglycemia')
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    }`}>
                      {alert.triageIndicator}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[11px] font-bold ${alert.glucose >= 200 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                        {alert.glucose} mg/dL
                      </span>
                      <span className={`text-[10px] font-mono ${alert.systolic >= 140 || alert.diastolic >= 90 ? 'text-amber-500 animate-pulse' : 'text-slate-500'}`}>
                        BP: {alert.systolic || '---'}/{alert.diastolic || '---'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => onDeployTransport(alert.patientId)}
                      className="inline-block text-[10px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2.5 py-1 rounded uppercase tracking-wide hover:bg-rose-500 hover:text-white transition-all"
                    >
                      Deploy Transport
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards for Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {!criticalReferrals || criticalReferrals.length === 0 ? (
          <div className="p-8 text-center text-slate-600 text-sm">Zero emergency anomalies tracked across active clinical centers.</div>
        ) : (
          [...(criticalReferrals || [])].reverse().map((alert) => (
            <div key={alert.id} className="bg-slate-900 border border-rose-500/20 rounded-xl p-4 shadow-lg animate-slide-in-right">
              <div className="flex justify-between items-start gap-4">
                <div className="truncate">
                  <h3 className="font-bold text-slate-100 truncate">{alert.patientName}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{alert.phone || 'N/A'}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[11px] font-bold ${alert.glucose >= 200 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                    {alert.glucose} mg/dL
                  </span>
                  <span className={`text-[10px] font-mono ${alert.systolic >= 140 || alert.diastolic >= 90 ? 'text-amber-500 animate-pulse' : 'text-slate-500'}`}>
                    BP: {alert.systolic || '---'}/{alert.diastolic || '---'}
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-3">
                <p className="text-xs text-slate-400"><strong className="text-slate-500 font-medium">Settlement:</strong> {alert.location || 'Not Configured'}</p>
                <div>
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded border tracking-wide uppercase ${
                    alert.triageIndicator.includes('Dual') 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                      : alert.triageIndicator.includes('Hyperglycemia')
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  }`}>
                    {alert.triageIndicator}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-right">
                <button 
                  onClick={() => onDeployTransport(alert.patientId)}
                  className="inline-block text-[10px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2.5 py-1 rounded uppercase tracking-wide hover:bg-rose-500 hover:text-white transition-all"
                >
                  Deploy Transport
                </button>
              </div>
            </div>
          )))}
      </div>
    </div>
  );
}
