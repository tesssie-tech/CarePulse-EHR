import React from 'react';
import { LayoutDashboard, Users, UserPlus, ShieldAlert, Settings as SettingsIcon, Heart, ChevronLeft, Menu, RefreshCw, LogOut, UserCircle, Download, BriefcaseMedical } from 'lucide-react';

export function MobileHeader({ setIsSidebarOpen }) {
  return (
    <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <Heart className="w-6 h-6 text-rose-500" />
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">CarePulse</span>
      </div>
      <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:text-slate-200">
        <Menu className="w-6 h-6" />
      </button>
    </header>
  );
}
export default function Sidebar({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  currentView, 
  setCurrentView, 
  criticalReferralsCount,
  isSyncing,
  offlineChangesCount,
  isOnline,
  patients, // Needed for storage re-eval
  logs,     // Needed for storage re-eval
  user,     // Role-Based Access
  currentFacility, // Workspace Active Facility
  referralDispatched, // To show a counter for specialists
  incomingReferralsCount,
  onLogout  // Session Management
}) {
  // PWA Installation State Handlers
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [isInstallable, setIsInstallable] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });
    
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const storageMetrics = React.useMemo(() => {
    // 1. Calculate the total string length of all local storage values
    try {
      // Accessing these props to justify their presence in the dependency array
      // as they are the primary drivers of localStorage changes in this app
      const dataTrace = `${patients?.length || 0}${logs?.length || 0}${offlineChangesCount}`;
      
      const totalBytes = JSON.stringify(localStorage).length;
      const usedKB = Math.round(totalBytes / 1024);
      const capacityKB = 5000; // Standard 5MB ceiling
      const usagePercent = Math.min((usedKB / capacityKB) * 100, 100).toFixed(2);
      return { used: usedKB, percent: usagePercent, trace: dataTrace };
    } catch {
      return { used: 0, percent: 0 };
    }
  }, [patients, logs, offlineChangesCount]); // Re-evaluate whenever clinical state or sync status changes

  return (
    <aside className={`
      bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 transition-all duration-300
      md:relative ${isSidebarOpen ? 'md:w-64' : 'md:w-20'}
      fixed md:sticky top-0 inset-y-0 left-0 z-40 w-64 transform
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0
    `}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 px-2 py-3 border-b border-slate-800/60 overflow-hidden">
          <Heart className="w-6 h-6 text-rose-500 animate-pulse shrink-0" />
          {isSidebarOpen && (
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent whitespace-nowrap">CarePulse</span>
          )}
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-slate-800 border border-slate-700 rounded-full p-1 text-slate-400 hover:text-slate-200 transition-colors shadow-xl z-20 hidden md:block"
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        <nav className="flex flex-col gap-1.5">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${currentView === 'dashboard' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'} ${!isSidebarOpen && 'justify-center'}`}
            title={!isSidebarOpen ? "Dashboard" : ""}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" /> {isSidebarOpen && "Workspace Dashboard"}
          </button>

          <button 
            onClick={() => setCurrentView('patients')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${currentView === 'patients' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'} ${!isSidebarOpen && 'justify-center'}`}
            title={!isSidebarOpen ? "Patients" : ""}
          >
            <Users className="w-4 h-4 shrink-0" /> {isSidebarOpen && "Current Patients"}
          </button>

          <button 
            onClick={() => setCurrentView('new-patient')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${currentView === 'new-patient' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'} ${!isSidebarOpen && 'justify-center'}`}
            title={!isSidebarOpen ? "Register" : ""}
          >
            <UserPlus className="w-4 h-4 shrink-0" /> {isSidebarOpen && "Register New Patient"}
          </button>

          <button 
            onClick={() => setCurrentView('alerts')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative duration-200 ${currentView === 'alerts' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'} ${!isSidebarOpen ? 'justify-center' : ''}`}
            title={!isSidebarOpen ? "Alerts" : ""}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" /> {isSidebarOpen && (
              <>
                Referral Queue
                {criticalReferralsCount > 0 && (
                  <span className="ml-auto bg-rose-500 text-slate-950 font-bold text-xs px-2 py-0.5 rounded-full">{criticalReferralsCount}</span>
                )}
              </>
            )}
            {!isSidebarOpen && criticalReferralsCount > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-slate-900 animate-pulse" />
            )}
          </button>

          {user?.role === 'specialist' && (
            <button
              onClick={() => setCurrentView('hospital-inbox')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative duration-200 ${currentView === 'hospital-inbox' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'} ${!isSidebarOpen ? 'justify-center' : ''}`}
              title={!isSidebarOpen ? "Specialist Portal" : ""}
            >
              <BriefcaseMedical className="w-4 h-4 shrink-0" />
              {isSidebarOpen && (
                <>
                  Specialist Portal
                  {incomingReferralsCount > 0 && (
                    <span className="ml-auto bg-amber-500 text-slate-950 font-bold text-xs px-2 py-0.5 rounded-full">{incomingReferralsCount}</span>
                  )}
                </>
              )}
            </button>
          )}

          {user?.role === 'doctor' ? (
            <button 
              onClick={() => setCurrentView('settings')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${currentView === 'settings' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'} ${!isSidebarOpen && 'justify-center'}`}
              title={!isSidebarOpen ? "Settings" : ""}
            >
              <SettingsIcon className="w-4 h-4 shrink-0" /> {isSidebarOpen && "System Settings"}
            </button>
          ) : (
            <div 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] uppercase tracking-widest font-black text-slate-600 bg-slate-950/20 border border-slate-800/40 cursor-not-allowed selection:bg-transparent ${!isSidebarOpen ? 'justify-center' : ''}`}
              title="Admin Access Only"
            >
              <SettingsIcon className="w-4 h-4 shrink-0 opacity-20" /> {isSidebarOpen && "Admin Access Only"}
            </div>
          )}
        </nav>

        {/* Custom Native PWA Install Button */}
        {isInstallable && (
          <button 
            onClick={handleInstallClick}
            className={`mx-3 mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 ${!isSidebarOpen && 'justify-center mx-2 px-0'}`}
            title={!isSidebarOpen ? "Install App" : ""}
          >
            <Download className={`w-4 h-4 shrink-0 ${isSidebarOpen && 'animate-bounce'}`} /> {isSidebarOpen && "Install CarePulse App"}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {/* User Identity Section */}
        {isSidebarOpen && (
          <div className="mx-2 mb-2 p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                <UserCircle className="w-5 h-5 text-teal-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-black text-slate-200 truncate">{user?.name}</p>
                <p className="text-[9px] font-bold text-teal-500 uppercase tracking-tighter truncate" title={currentFacility}>Active Facility: {currentFacility}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full mt-3 py-1.5 text-[10px] font-black text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg border border-rose-500/10 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          </div>
        )}

        {!isSidebarOpen && (
          <button 
            onClick={onLogout}
            className="flex items-center justify-center p-2.5 mb-2 hover:bg-rose-500/10 text-rose-500 transition-all rounded-xl"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}

        {/* Background Auto-Sync Indicator Panel */}
        <div className={`bg-slate-950/60 rounded-xl border border-slate-800/60 transition-all overflow-hidden ${!isSidebarOpen && 'p-1'}`}>
          <div className={`p-3 flex items-center justify-center text-sm font-medium transition-colors ${
            !isOnline ? 'bg-amber-950/30 text-amber-500' :
            isSyncing ? 'bg-blue-950/30 text-blue-400' : 'bg-emerald-950/30 text-emerald-400'
          }`}>
            {isSidebarOpen ? (
              isOnline ? (
                isSyncing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" /> Syncing changes...
                  </span>
                ) : (
                  <span>🟢 Cloud Synchronized</span>
                )
              ) : (
                <div className="flex flex-col items-center">
                  <span>🔴 Offline (Local Vault)</span>
                  {offlineChangesCount > 0 && (
                    <span className="text-xs font-semibold text-amber-600/70 mt-1">
                      {offlineChangesCount} record(s) queued
                    </span>
                  )}
                </div>
              )
            ) : (
              <div className={`mx-auto w-3 h-3 rounded-full ${!isOnline ? 'bg-amber-500 animate-pulse' : isSyncing ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400'}`} title={!isOnline ? 'Offline' : isSyncing ? 'Syncing...' : 'Synchronized'} />
            )}
          </div>

          {isSidebarOpen && (
            <div className="p-3 pt-2 border-t border-slate-800/60">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Cache Storage</span>
                <span className="text-[9px] font-mono text-slate-400">{storageMetrics.used} KB / 5000 KB</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ease-out ${
                    storageMetrics.percent > 80 ? 'bg-rose-500' : storageMetrics.percent > 50 ? 'bg-amber-500' : 'bg-teal-500'
                  }`}
                  style={{ width: `${storageMetrics.percent}%` }}
                />
              </div>
              <div className="mt-1 text-right">
                <span className="text-[9px] font-bold text-slate-600">[{storageMetrics.percent}% utilized]</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
