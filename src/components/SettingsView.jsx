import { Building2, Settings as SettingsIcon, Trash2, CloudDownload, ShieldAlert, FileDown } from 'lucide-react';
import { useState } from 'react';

export default function SettingsView({ 
  highRiskThreshold, 
  setHighRiskThreshold, 
  setCurrentView,
  handleFetchFromCloud,
  setPatients,
  setLogs,
  patients,
  logs,
  setOfflineChangesCount,
  initialPatientsSeed,
  initialLogsSeed,
  currentFacility,
  handleUpdateFacility
}) {
  const [facilityInput, setFacilityInput] = useState(currentFacility || "Gwagwalada Primary Health Centre");
  const [isUpdating, setIsUpdating] = useState(false);

  const facilities = [
    "Gwagwalada Primary Health Centre",
    "Bwari Field Station",
    "Kuje General Hospital"
  ];

  const onUpdateFacility = async () => {
    setIsUpdating(true);
    await handleUpdateFacility(facilityInput);
    setIsUpdating(false);
  };

  const handleSystemPurge = () => {
    if (window.confirm("CRITICAL ACTION: This will wipe all local changes and reset the application to its original state. This cannot be undone. Proceed?")) {
      localStorage.clear();
      setPatients(initialPatientsSeed || []);
      setLogs(initialLogsSeed || []);
      setOfflineChangesCount(0);
      setCurrentView('dashboard');
    }
  };

  const handleExportCSV = () => {
    // 1. Prepare clinical data reconstruction
    const headers = ["Patient Name", "Age", "Location", "Date", "Glucose (mg/dL)", "Blood Pressure", "Weight (kg)", "Symptoms", "Medications"];
    
    const rows = (logs || []).map(log => {
      const patient = (patients || []).find(p => p.id === log.patientId);
      const bp = log.systolic && log.diastolic ? `${log.systolic}/${log.diastolic}` : "N/A";
      
      return [
        `"${patient?.name || 'Unknown'}"`,
        patient?.age || "N/A",
        `"${patient?.location || 'Unknown'}"`,
        log.date,
        log.glucose,
        `"${bp}"`,
        log.weight || "N/A",
        `"${(log.symptoms || "None").replace(/"/g, '""')}"`,
        `"${(log.medication || "None").replace(/"/g, '""')}"`
      ];
    });

    // 2. Structural CSV construction
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // 3. Browser-native Blob download workflow
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CarePulse_Offline_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <Building2 className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold">Workspace & Facility Management</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Active Assigned Facility</label>
            <div className="flex gap-3">
              <select
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-500 text-slate-400"
              >
                {facilities.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <button
                onClick={onUpdateFacility}
                disabled={isUpdating || facilityInput === currentFacility}
                className="px-5 py-2.5 text-xs font-bold bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isUpdating ? "Updating..." : "Transfer Facility"}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Transferring to a new facility will instantly update your access privileges and redirect your checkup logs to the new catchment area.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <SettingsIcon className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold">Clinical Rule-Base Engine Configurations</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">CDSS High-Risk Fasting Glucose Flag Threshold (mg/dL)</label>
            <input 
              type="number" 
              value={highRiskThreshold}
              onChange={(e) => setHighRiskThreshold(parseInt(e.target.value, 10) || 200)}
              className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-purple-300 focus:outline-none focus:border-purple-500 font-bold" 
            />
            <p className="text-xs text-slate-500 mt-2">
              Adjusting this setting rewrites the system's runtime parameters. If you change this to 150, the app will instantly recalculate every record and flag patients into the Emergency Referral Queue at that lower value.
            </p>
          </div>
          <div className="mt-2 pt-4 border-t border-slate-800/60 flex justify-end">
            <button type="button" onClick={() => setCurrentView('dashboard')} className="px-5 py-2 text-xs font-bold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg transition-all">
              Apply Rule Parameters
            </button>
          </div>
        </div>
      </div>

      {/* Dangerous Action Zone */}
      <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <ShieldAlert className="w-24 h-24 text-rose-500" />
        </div>
        
        <div className="flex items-center gap-2 border-b border-rose-500/20 pb-3 mb-6">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-bold text-slate-100">System Maintenance & Database Controls</h2>
        </div>

        <div className="flex flex-col gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-200 mb-1">Local Synchronization Module</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Re-hydrate your local engine by pulling the master clinical registry directly from our primary cloud database. Use this if your local cache is out of sync.
              </p>
            </div>
            <button 
              onClick={handleFetchFromCloud}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              <CloudDownload className="w-3.5 h-3.5" /> Pull Master Data
            </button>
          </div>

          <div className="border-t border-slate-800/80 pt-6 flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-emerald-400 mb-1">Disaster Recovery: CSV Data Export</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate a physical backup of the active clinical registry. This remains fully functional without internet access and provides a portable audit trail for emergency consultation.
              </p>
            </div>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/50 rounded-xl text-xs font-bold transition-all"
            >
              <FileDown className="w-3.5 h-3.5" /> Export Offline Registry to CSV
            </button>
          </div>

          <div className="border-t border-slate-800/80 pt-6 flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-400 mb-1">Hard System Reset (Purge)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Immediately destroys all locally stored patient records and log diagnostic history. This action resets the workstation to factory defaults for clean slate demonstrations.
              </p>
            </div>
            <button 
              onClick={handleSystemPurge}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/50 rounded-xl text-xs font-bold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Wipe Local Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
