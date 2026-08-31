import { useState, useEffect } from 'react';
import { Heart, KeyRound, UserCircle, ChevronRight, Phone, Loader2, UserPlus, Download, WifiOff } from 'lucide-react';

export default function LoginView({ onAuth, authLoading }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // Network State Handler
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA Installation State Handlers
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
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

  // Registration specific fields
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('nurse');
  const [selectedFacility, setSelectedFacility] = useState('Gwagwalada Primary Health Centre');

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const facilities = [
    "Gwagwalada Primary Health Centre",
    "Bwari Field Station",
    "Kuje General Hospital"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert local format to international format without '+' to match Supabase Test OTPs exactly
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) formattedPhone = '234' + formattedPhone.slice(1);
    formattedPhone = formattedPhone.replace(/[^\d]/g, '');

    if (otpSent) {
      await onAuth({ action: 'verify_otp', phone: formattedPhone, token });
    } else {
      const result = await onAuth({ action: 'send_otp', isSignUp, phone: formattedPhone, name, role: selectedRole, facility: selectedFacility });
      if (result?.success) {
        setOtpSent(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative">
      {/* Top Banners Container */}
      <div className="absolute top-0 left-0 w-full z-50 flex flex-col">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="p-4 pb-0 w-full flex justify-center pointer-events-none">
            <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md border border-rose-500/30 rounded-2xl p-4 flex items-center shadow-2xl shadow-rose-500/10 pointer-events-auto animate-in slide-in-from-top-8 duration-500">
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 shrink-0">
                  <WifiOff className="w-5 h-5 text-rose-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-100">Network Offline</p>
                  <p className="text-[10px] text-slate-400">Internet connection is required to authenticate</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PWA Install Banner */}
        {isInstallable && (
          <div className="p-4 w-full flex justify-center pointer-events-none">
            <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md border border-teal-500/30 rounded-2xl p-4 flex justify-between items-center shadow-2xl shadow-teal-500/10 pointer-events-auto animate-in slide-in-from-top-8 duration-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/10 rounded-full flex items-center justify-center border border-teal-500/20 shrink-0">
                  <Download className="w-5 h-5 text-teal-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-100">Install CarePulse EHR</p>
                  <p className="text-[10px] text-slate-400">Enable native offline caching</p>
                </div>
              </div>
              <button 
                onClick={handleInstallClick}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-transform hover:scale-105 shrink-0 ml-2"
              >
                Install
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
    
          <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            CarePulse EHR
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Clinical Registry Access Gate
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
            
            {!otpSent ? (
              <>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">
                    Mobile Phone Number
                  </label>
                  <div className="relative group">
                    <input
                      type="tel"
                      placeholder="e.g. 0803 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-12 text-sm text-slate-200 focus:outline-none focus:border-teal-500 transition-all group-hover:border-slate-700"
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-teal-400 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Registration Specific Fields */}
                {isSignUp && (
                  <div className="animate-in slide-in-from-top-4 duration-300 flex flex-col gap-6">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">
                        Full Legal Name
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          placeholder="e.g. Dr. Amina Bello"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-12 text-sm text-slate-200 focus:outline-none focus:border-teal-500 transition-all group-hover:border-slate-700"
                          required={isSignUp}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-teal-400 transition-colors">
                          <UserCircle className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">
                          System Role
                        </label>
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 transition-all"
                        >
                          <option value="nurse">Field Nurse</option>
                          <option value="doctor">Consultant Doctor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">
                          Active Facility
                        </label>
                        <select
                          value={selectedFacility}
                          onChange={(e) => setSelectedFacility(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-[11px] text-slate-200 focus:outline-none focus:border-teal-500 transition-all truncate"
                        >
                          {facilities.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <label className="block text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">
                  Verification Code (OTP)
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    placeholder="123456"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-12 text-xl tracking-[0.5em] text-teal-400 focus:outline-none focus:border-teal-500 transition-all group-hover:border-slate-700 font-mono"
                    required
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-teal-400 transition-colors">
                    <KeyRound className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-3 text-center">
                  A secure code was sent to <span className="text-slate-300 font-bold">{phone}</span>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading || !isOnline}
              className="w-full mt-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black py-4 rounded-xl text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
            >
              {authLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</>
              ) : otpSent ? (
                <>Verify & Access Registry <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>
              ) : isSignUp ? (
                <><UserPlus className="w-4 h-4" /> Send Registration OTP</>
              ) : (
                <>Send Secure OTP <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
            
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  if (otpSent) {
                    setOtpSent(false);
                    setToken('');
                  } else {
                    setIsSignUp(!isSignUp);
                  }
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-teal-400 transition-colors uppercase tracking-widest"
              >
                {otpSent 
                  ? "Didn't receive code? Go back" 
                  : isSignUp ? "Already have an account? Sign In" : "Need authorization? Register Account"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-600 text-[10px] uppercase font-bold tracking-widest">
            Protected Regional Health Information Network
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 opacity-20">
             <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center">
            
             </div>
             <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center">
              
             </div>
             <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center">
             
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
