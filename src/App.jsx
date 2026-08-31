import React, { useState, useEffect, useReducer } from "react";
import { createClient } from "@supabase/supabase-js";
import Sidebar, { MobileHeader } from "./components/Sidebar";
import PatientRegistry from "./components/PatientRegistry";
import LogVitalsForm from "./components/LogVitalsForm";
import HistoryTimeline from "./components/HistoryTimeline";
import NewPatientView from "./components/NewPatientView";
import ReferralQueueView from "./components/ReferralQueueView";
import SettingsView from "./components/SettingsView";
import PatientListView from "./components/PatientListView";
import PatientProfileView from "./components/PatientProfileView";
import HealthChart from "./components/HealthChart";
import LoginView from "./components/LoginView";
import EditPatientView from "./components/EditPatientView";
import { ShieldCheck, Bell, Activity, X, Heart, Eye, LayoutDashboard, AlertTriangle, LogOut, CheckCircle } from "lucide-react";

// Supabase Configuration Engine
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

const initialPatientsSeed = [
  { id: "1", name: "Amina Bello", age: 45, gender: "Female", phone: "08031234567", location: "Gwagwalada", riskStatus: "High Risk", updatedAt: new Date().toISOString(), facility: "Gwagwalada Rural Care Node" },
  { id: "2", name: "Emeka Okafor", age: 62, gender: "Male", phone: "08159876543", location: "Kuje", riskStatus: "Stable", updatedAt: new Date().toISOString(), facility: "Gwagwalada Rural Care Node" },
];

const initialLogsSeed = [
  { id: "l1", patientId: "1", date: "2026-05-10", glucose: 110, symptoms: "None", medication: "None", facility: "Gwagwalada Rural Care Node" },
  { id: "l2", patientId: "1", date: "2026-06-01", glucose: 245, symptoms: "Polyuria, Blurred Vision", medication: "Metformin 500mg" },
  { id: "l3", patientId: "2", date: "2026-05-15", glucose: 95, symptoms: "None", medication: "None" },
];

const initialNotificationsSeed = [
  // Example: { id: crypto.randomUUID(), userId: 'mock-clinician-1', message: 'Referral for Amina Bello accepted.', createdAt: new Date().toISOString(), read: false }
];

export default function App() {
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem("carepulse_patients");
    return saved ? JSON.parse(saved) : initialPatientsSeed;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("carepulse_logs");
    return saved ? JSON.parse(saved) : initialLogsSeed;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("carepulse_notifications");
    return saved ? JSON.parse(saved) : initialNotificationsSeed;
  });

  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedPatientId, setSelectedPatientId] = useState("1");
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => 
    window.innerWidth > 768
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const [highRiskThreshold, setHighRiskThreshold] = useState(() => {
    const saved = localStorage.getItem("carepulse_threshold");
    return saved ? parseInt(saved, 10) : 200;
  });

  const [newPatient, setNewPatient] = useState({ name: "", age: "", gender: "Female", phone: "", location: "", initialGlucose: "" });
  const [glucoseInput, setGlucoseInput] = useState("");
  const [symptomsInput, setSymptomsInput] = useState("");
  const [medicationInput, setMedicationInput] = useState("");
  const [systolicInput, setSystolicInput] = useState("");
  const [diastolicInput, setDiastolicInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [pulseInput, setPulseInput] = useState("");
  const [notesAndTestsInput, setNotesAndTestsInput] = useState("");
  const [dateInput, setDateInput] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineChangesCount, setOfflineChangesCount] = useState(() => {
    const saved = localStorage.getItem("carepulse_pending_changes");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Presentation Active Referral states
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState("National Hospital Abuja");
  const [referralDispatched, setReferralDispatched] = useState(false);
  const [dispatchAccepted, setDispatchAccepted] = useState(false);
  const [selectedReferralPatientId, setSelectedReferralPatientId] = useState(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [passcodeToken, setPasscodeToken] = useState(""); const [toast, setToast] = useState(null);

  // Auth Fallbacks & Mocking
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("carepulse_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentFacility, setCurrentFacility] = useState(() => {
    return localStorage.getItem("carepulse_facility") || "Gwagwalada Rural Care Node";
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [isInitializingAuth, setIsInitializingAuth] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [transferFinalized, setTransferFinalized] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    setIsInitializingAuth(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        const loggedUser = { id: session.user.id, name: meta.name || 'Clinician', role: meta.role || 'nurse' };
        setCurrentUser(loggedUser);
        setCurrentFacility(meta.facility || 'Unknown Facility');
        localStorage.setItem("carepulse_user", JSON.stringify(loggedUser));
        localStorage.setItem("carepulse_facility", meta.facility || 'Unknown Facility');
      }
      setIsInitializingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        const loggedUser = { id: session.user.id, name: meta.name || 'Clinician', role: meta.role || 'nurse' };
        setCurrentUser(loggedUser);
        setCurrentFacility(meta.facility || 'Unknown Facility');
        localStorage.setItem("carepulse_user", JSON.stringify(loggedUser));
        localStorage.setItem("carepulse_facility", meta.facility || 'Unknown Facility');
        if (_event === 'SIGNED_IN') {
          setIsDashboardLoading(true);
          setCurrentView(meta.role === 'nurse' ? 'new-patient' : 'dashboard');
        }
      } else {
        setCurrentUser(null);
        setCurrentFacility(null);
        localStorage.removeItem("carepulse_user");
        localStorage.removeItem("carepulse_facility");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Presentational loading animation
  useEffect(() => {
    if (currentUser?.id) {
      setIsDashboardLoading(true);
      const timer = setTimeout(() => setIsDashboardLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [currentUser?.id, currentView]);

  // Computed patient arrays for facility isolation
  const facilityPatients = (patients || []).filter(p => p.facility === currentFacility);
  const incomingReferrals = (patients || []).filter(p => 
    p.referralStatus === 'pending' && p.referralTarget === currentFacility
  ).sort((a, b) => {
    // Ensure the most recently dispatched patients appear first
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  // Unified OTP authentication handler
  const handleAuth = async (authData) => {
    setAuthLoading(true);
    try {
      if (authData.action === 'send_otp') {
        // If Supabase is present, use it; otherwise proceed directly with local validation configuration
        if (supabase) {
          const { error } = await supabase.auth.signInWithOtp({
            phone: authData.phone,
            options: authData.isSignUp ? {
              data: {
                name: authData.name,
                role: authData.role,
                facility: authData.facility
              }
            } : {}
          });
          if (error) throw error;
          return { success: true };
        } else {
          // Simulation layer
          console.log(`Development Sandbox: Local SMS token issued for ${authData.phone}`);
          return { success: true };
        }
      } else if (authData.action === 'verify_otp') {
        if (supabase) {
          const { error } = await supabase.auth.verifyOtp({
            phone: authData.phone,
            token: authData.token,
            type: 'sms'
          });
          if (error) throw error;
          return { success: true };
        } else {
          // Standard presentation bypass PIN verification
          if (authData.token === '123456') {
             const mockUser = { id: 'mock-clinician-1', name: 'Nurse Theresa', role: 'nurse' };
             const mockFacility = 'Gwagwalada Rural Care Node';
             setCurrentUser(mockUser);
             setCurrentFacility(mockFacility);
             localStorage.setItem('carepulse_user', JSON.stringify(mockUser));
             localStorage.setItem('carepulse_facility', mockFacility);
             setCurrentView('dashboard');
             return { success: true };
          } else if (authData.token === '987654') {
             const mockUser = { id: 'mock-specialist-1', name: 'Dr. Bello', role: 'specialist' };
             const mockFacility = 'National Hospital Abuja';
             setCurrentUser(mockUser);
             setCurrentFacility(mockFacility);
             localStorage.setItem('carepulse_user', JSON.stringify(mockUser));
             localStorage.setItem('carepulse_facility', mockFacility);
             setCurrentView('hospital-inbox');
             return { success: true };
          }
          
          throw new Error("Security verification failed. Please enter a valid 6-digit credential.");
        }
      }
    } catch (error) {
      alert(error.message);
      return { error };
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentFacility(null);
    localStorage.removeItem("carepulse_user");
    localStorage.removeItem("carepulse_facility");
  };

  const handleUpdateFacility = async (newFacility) => {
    if (!supabase) {
      setCurrentFacility(newFacility);
      localStorage.setItem("carepulse_facility", newFacility);
      alert("Facility node transfer completed locally!");
      return;
    }
    if (!navigator.onLine) {
      alert("You must be online to register a facility transfer in the cloud.");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({
        data: { facility: newFacility }
      });
      if (error) throw error;
      setCurrentFacility(newFacility);
      localStorage.setItem("carepulse_facility", newFacility);
      alert("Facility transfer completed successfully!");
    } catch (error) {
      alert("Failed to update facility: " + error.message);
    }
  };

  const handleCloudSync = async (syncPatients = patients, syncLogs = logs) => {
    if (!supabase || !navigator.onLine) return;
    setIsSyncing(true);
    try {
      const mappedPatients = syncPatients.map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        location: p.location,
        risk_status: p.riskStatus,
        updated_at: p.updatedAt || new Date().toISOString()
      }));

      const mappedLogs = syncLogs.map(l => ({
        id: l.id,
        patient_id: l.patientId,
        date: l.date,
        glucose: l.glucose,
        symptoms: l.symptoms || "None",
        medication: l.medication || "None",
        systolic: l.systolic ?? null,
        diastolic: l.diastolic ?? null,
        weight: l.weight ?? null,
        pulse: l.pulse ?? null,
        facility: l.facility || null,
        clinician: l.clinician || null
      }));

      const { error: patientError } = await supabase.from('patients').upsert(mappedPatients);
      if (patientError) throw patientError;

      const { error: logError } = await supabase.from('checkup_logs').upsert(mappedLogs);
      if (logError) throw logError;

      setOfflineChangesCount(0);
    } catch (error) {
      console.error("Clinical Data Sync Interruption:", error.message || error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const handleAutomaticSync = () => {
      setIsOnline(true);
      if (offlineChangesCount > 0) {
        handleCloudSync(patients, logs);
      }
    };
    const updateNetworkStatusState = () => setIsOnline(false);
    window.addEventListener("online", handleAutomaticSync);
    window.addEventListener("offline", updateNetworkStatusState);
    return () => {
      window.removeEventListener("online", handleAutomaticSync);
      window.removeEventListener("offline", updateNetworkStatusState);
    };
  }, [patients, logs, offlineChangesCount]);

  useEffect(() => {
    localStorage.setItem("carepulse_patients", JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem("carepulse_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("carepulse_threshold", highRiskThreshold.toString());
  }, [highRiskThreshold]);

  useEffect(() => {
    localStorage.setItem("carepulse_pending_changes", offlineChangesCount.toString());
  }, [offlineChangesCount]);

  const unreadNotificationsCount = notifications.filter(n => n.userId === currentUser?.id && !n.read).length;

  const handleFetchFromCloud = async () => {
    if (!supabase) {
      alert("Supabase cloud engine is currently bypassed. Using local sandbox partition.");
      return;
    }
    if (!navigator.onLine) {
      alert("No active network stream found. Please connect to request cloud records.");
      return;
    }
    setIsSyncing(true);
    try {
      const { data: cloudPatients, error: patientError } = await supabase.from('patients').select('*');
      if (patientError) throw patientError;

      const { data: cloudLogs, error: logError } = await supabase.from('checkup_logs').select('*');
      if (logError) throw logError;

      const mappedPatients = cloudPatients.map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        location: p.location,
        riskStatus: p.risk_status,
        updatedAt: p.updated_at
      }));

      const mappedLogs = cloudLogs.map(l => ({
        id: l.id,
        patientId: l.patient_id,
        date: l.date,
        glucose: l.glucose,
        symptoms: l.symptoms,
        medication: l.medication,
        systolic: l.systolic,
        diastolic: l.diastolic,
        weight: l.weight,
        pulse: l.pulse,
        facility: l.facility || null,
        clinician: l.clinician || null
      }));

      setPatients(mappedPatients);
      setLogs(mappedLogs);
      setOfflineChangesCount(0);
      alert("Clinical Node Records Restored and Synchronized Cleanly!");
    } catch (error) {
      console.error("Cloud Fetch Error:", error.message || error);
      alert("Fetch failed. Using local storage buffer.");
    } finally {
      setIsSyncing(false);
    }
  };

  const safePatients = patients || [];
  const safeLogs = logs || [];

  const selectedPatient = safePatients.find(p => p.id === selectedPatientId);
  const currentPatientLogs = safeLogs.filter(log => log.patientId === selectedPatientId);
  const selectedLog = safeLogs.find(l => l.id === selectedLogId);
  
  const filteredPatients = safePatients.filter(p => 
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const criticalReferrals = safeLogs.filter(log => {
    const isHyperglycemic = log.glucose >= highRiskThreshold;
    const isHypertensive = (log.systolic >= 140) || (log.diastolic >= 90);

    if (currentUser?.role === 'nurse') {
      const patient = safePatients.find(p => p.id === log.patientId);
      return (isHyperglycemic || isHypertensive) && patient?.facility === currentFacility;
    }
    return isHyperglycemic || isHypertensive;
  }).map(log => {
    const patient = safePatients.find(p => p.id === log.patientId);
    let triageIndicator = "";
    const isHyperglycemic = log.glucose >= highRiskThreshold;
    const isHypertensive = (log.systolic >= 140) || (log.diastolic >= 90);

    if (isHyperglycemic && isHypertensive) triageIndicator = "Dual Metabolic-Cardio Risk";
    else if (isHyperglycemic) triageIndicator = "Hyperglycemia Crisis";
    else if (isHypertensive) triageIndicator = "Hypertensive Crisis";

    return { 
      ...log, 
      patientName: patient?.name, 
      phone: patient?.phone, 
      location: patient?.location,
      triageIndicator 
    };
  });

  // Emergency Rapid Admission Action Handler
  const handleQuickEmergencyAdmit = () => {
    const tempId = `TEMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEmergencyPatient = {
      id: tempId,
      name: `CRITICAL OUTPATIENT [${tempId}]`,
      age: 40,
      gender: "Male",
      phone: "08000000000",
      location: "EMERGENCY INFLOW",
      riskStatus: "High Risk",
      updatedAt: new Date().toISOString(),
      facility: currentFacility
    };

    const emergencyLog = {
      id: crypto.randomUUID(),
      patientId: tempId,
      date: new Date().toISOString().split("T")[0],
      glucose: 250, // Default crisis level
      symptoms: "Bypassed standard triage registration due to severe systemic shock",
      medication: "Oxygen, IV Saline Administered",
      systolic: 155,
      diastolic: 95,
      weight: 70,
      pulse: 110,
      facility: currentFacility,
      clinician: currentUser?.name || "System (Emergency Bypass)"
    };

    const updatedPatients = [...patients, newEmergencyPatient];
    const updatedLogs = [...logs, emergencyLog];

    setPatients(updatedPatients);
    setLogs(updatedLogs);
    setSelectedPatientId(tempId);
    setOfflineChangesCount(prev => prev + 1);
    setToast({ message: "Emergency Bypass Activated. Temporary Patient Enqueued.", type: 'info' });
    setCurrentView("dashboard");
    setIsEmergencyModalOpen(false);
  };

  // Open referral modal from the alerts queue
  const handleDeployTransportFromQueue = (patientId) => {
    setSelectedPatientId(patientId);
    handleOpenReferralModal();
  };

  // Launch hospital referral modal with single-use passcode
  const handleOpenReferralModal = () => {
    const patient = patients.find(p => p.id === selectedPatientId);
    if (patient?.referralStatus === 'pending') {
      setToast({ message: `This patient has a pending referral to ${patient.referralTarget}. A new referral cannot be initiated.`, type: 'warning' });
      return;
    }
    if (patient?.referralStatus === 'accepted') {
      // This case is less likely for a nurse due to facility isolation, but it's a good safeguard.
      setToast({ message: `This patient has already been transferred to ${patient.facility}.`, type: 'warning' });
      return;
    }

    const freshToken = `EHR-REF-${Math.floor(1000 + Math.random() * 9000)}`;
    setPasscodeToken(freshToken);
    setReferralDispatched(false);
    setIsReferralModalOpen(true);
  };

  // Execute secure hospital notification simulation
  const handleConfirmReferralDispatch = () => {
    setReferralDispatched(true);
    setToast({ message: `✓ Secured packet routed to ${selectedHospital}. Direct Cloud Token: ${passcodeToken}`, type: 'info' });
    setDispatchAccepted(false); // Reset acceptance status for new dispatch

    // Logic for a nurse dispatching a patient for referral
    if (currentUser?.role === 'nurse' && selectedPatientId) {
      const updatedPatients = patients.map(p =>
        p.id === selectedPatientId ? { ...p, referralStatus: 'pending', referralTarget: selectedHospital, updatedAt: new Date().toISOString() } : p
      );
      setPatients(updatedPatients);
      setOfflineChangesCount(prev => prev + 1);
      setToast({ message: `Patient referral for ${selectedPatient.name} dispatched to ${selectedHospital}.`, type: 'info' });
    }

    // Logic for a specialist accepting a transfer
    if (currentUser?.role === 'specialist' && selectedPatientId) {
      const patientToTransfer = patients.find(p => p.id === selectedPatientId);
      if (patientToTransfer && patientToTransfer.facility !== currentFacility) {
        const updatedPatients = patients.map(p =>
          p.id === selectedPatientId ? { ...p, facility: currentFacility, referralStatus: 'accepted', referralTarget: null, updatedAt: new Date().toISOString() } : p
        );
        setPatients(updatedPatients);
        setOfflineChangesCount(prev => prev + 1);
        setToast({ message: `Patient ${patientToTransfer.name} transferred to your facility.`, type: 'info' });
        // Close the modal after accepting
        setIsReferralModalOpen(false);
      }
    }

    setTimeout(() => {
      setIsReferralModalOpen(false);
    }, 3000);
  };


  const handleCreatePatient = (e) => {
    e.preventDefault();
    const errors = {};
    const sanitizedName = newPatient.name.trim();
    const ageValue = parseInt(newPatient.age, 10);
    const initialGlucoseValue = parseInt(newPatient.initialGlucose, 10);
    
    const phoneRegex = /^(080|081|090|070|091)\d{8}$/;

    if (!sanitizedName) errors.name = "Full name is required";
    if (isNaN(ageValue) || ageValue < 1 || ageValue > 120) errors.age = "Age must be between 1 and 120";
    if (newPatient.phone && !phoneRegex.test(newPatient.phone)) errors.phone = "Invalid Nigerian format (e.g. 08012345678)";
    if (!isNaN(initialGlucoseValue) && (initialGlucoseValue < 40 || initialGlucoseValue > 600)) {
      errors.initialGlucose = "Please verify value. Blood sugar readings must be between 40 and 600 mg/dL.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const patientId = crypto.randomUUID();
    const addedPatient = {
      id: patientId,
      ...newPatient,
      name: sanitizedName,
      age: ageValue,
      riskStatus: !isNaN(initialGlucoseValue) && initialGlucoseValue >= highRiskThreshold ? "High Risk" : "Stable",
      facility: currentFacility,
      updatedAt: new Date().toISOString()
    };

    let updatedLogs = [...logs];
    if (!isNaN(initialGlucoseValue)) {
      const initialLog = {
        id: crypto.randomUUID(),
        patientId: patientId,
        date: new Date().toISOString().split("T")[0],
        glucose: initialGlucoseValue,
        symptoms: "Initial Registration Reading",
        medication: "None",
        facility: currentFacility,
        clinician: currentUser?.name || "System"
      };
      updatedLogs.push(initialLog);
      setLogs(updatedLogs);
    }

    const updatedPatients = [...patients, addedPatient];
    setPatients(updatedPatients);
    setSelectedPatientId(addedPatient.id);
    setOfflineChangesCount(prev => prev + 1);

    if (navigator.onLine) {
      handleCloudSync(updatedPatients, updatedLogs);
    }

    setNewPatient({ name: "", age: "", gender: "Female", phone: "", location: "", initialGlucose: "" });
    setFormErrors({});
    setCurrentView("dashboard");
  };

  const handleUpdatePatient = (updatedPatientData) => {
    const errors = {};
    const sanitizedName = updatedPatientData.name.trim();
    const ageValue = parseInt(updatedPatientData.age, 10);
    
    const phoneRegex = /^(080|081|090|070|091)\d{8}$/;

    if (!sanitizedName) errors.name = "Full name is required";
    if (isNaN(ageValue) || ageValue < 1 || ageValue > 120) errors.age = "Age must be between 1 and 120";
    if (updatedPatientData.phone && !phoneRegex.test(updatedPatientData.phone)) errors.phone = "Invalid Nigerian format (e.g. 08012345678)";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const existingPatient = patients.find(p => p.id === updatedPatientData.id);
    const updatedPatient = {
      ...existingPatient,
      ...updatedPatientData,
      name: sanitizedName,
      age: ageValue,
      updatedAt: new Date().toISOString()
    };

    const updatedPatients = patients.map(p => p.id === updatedPatient.id ? updatedPatient : p);
    setPatients(updatedPatients);
    setOfflineChangesCount(prev => prev + 1);

    if (navigator.onLine) {
      handleCloudSync(updatedPatients, logs);
    }

    setFormErrors({});
    setCurrentView("patient-profile");
  };

  const handleFinalizeTransfer = (patientId) => {
    setTransferFinalized(true);
    const patientToTransfer = patients.find(p => p.id === patientId);
    if (patientToTransfer) {
      const updatedPatients = patients.map(p =>
        p.id === patientId ? { ...p, facility: currentFacility, referralStatus: 'accepted', referralTarget: null, updatedAt: new Date().toISOString() } : p
      );
      setPatients(updatedPatients);
      setOfflineChangesCount(prev => prev + 1);

      // Create a notification for the referring nurse
      const referringLog = logs.find(l => l.patientId === patientId && l.clinician);
      if (referringLog?.clinicianId) {
        const newNotification = {
          id: crypto.randomUUID(),
          userId: referringLog.clinicianId,
          message: `Referral for ${patientToTransfer.name} to ${currentFacility} has been accepted.`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        setNotifications(prev => [...prev, newNotification]);
      }

      setToast({ message: `Patient ${patientToTransfer.name} has been successfully transferred to ${currentFacility}.`, type: 'info' });
      setTimeout(() => {
        setCurrentView('dashboard'); // Redirect to dashboard after transfer
        setTransferFinalized(false); // Reset for next interaction
      }, 1500); // Delay to show acceptance before redirecting
    }
  };

  const handleAddCheckup = (e) => {
    e.preventDefault();
    const errors = {};
    const glucoseValue = parseInt(glucoseInput, 10);

    if (isNaN(glucoseValue) || glucoseValue < 40 || glucoseValue > 600) {
      errors.glucose = "Please verify value. Blood sugar readings must be between 40 and 600 mg/dL.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newLog = {
      id: crypto.randomUUID(),
      patientId: selectedPatientId,
      date: dateInput,
      glucose: glucoseValue,
      symptoms: symptomsInput || "None",
      medication: medicationInput || "None",
      systolic: parseInt(systolicInput) || null,
      diastolic: parseInt(diastolicInput) || null,
      weight: parseFloat(weightInput) || null,
      pulse: parseInt(pulseInput) || null,
      notesAndTests: notesAndTestsInput || null,
      facility: currentFacility,
      clinician: currentUser?.name || "System"
    };

    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);
    setOfflineChangesCount(prev => prev + 1);

    const isHyperglycemic = glucoseValue >= highRiskThreshold;
    const isHypertensive = (parseInt(systolicInput) >= 140) || (parseInt(diastolicInput) >= 90);
    const updatedRiskStatus = (isHyperglycemic || isHypertensive) ? "High Risk" : "Stable";

    const updatedPatients = patients.map(p => 
      p.id === selectedPatientId 
        ? { ...p, riskStatus: updatedRiskStatus, updatedAt: new Date().toISOString() } 
        : p
    );
    setPatients(updatedPatients);
    if (navigator.onLine) {
      handleCloudSync(updatedPatients, updatedLogs);
    }

    setGlucoseInput("");
    setSymptomsInput("");
    setMedicationInput("");
    setSystolicInput("");
    setDiastolicInput("");
    setWeightInput("");
    setPulseInput("");
    setNotesAndTestsInput("");
    setFormErrors({});
  };

  if (isInitializingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-purple-600/10 rounded-2xl flex items-center justify-center border border-purple-600/20 shadow-2xl">
            <ShieldCheck className="w-8 h-8 text-purple-500 animate-pulse" />
          </div>
          <p className="text-purple-600 font-bold uppercase tracking-widest text-xs">Accessing System Partition...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onAuth={handleAuth} authLoading={authLoading} />;
  }

  return (
    <div className="flex md:flex-row flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Dynamic Action Toasts */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 max-w-md bg-slate-900 border-l-4 p-4 rounded-r-lg shadow-2xl flex items-start gap-3 animate-slide-in ${
          toast.type === 'warning' ? 'border-amber-500' : 'border-teal-500'
        }`}>
          <div className={`p-2 rounded-lg border ${
            toast.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-teal-500/10 border-teal-500/20'
          }`}>
            <Activity className={`w-5 h-5 animate-pulse ${
              toast.type === 'warning' ? 'text-amber-400' : 'text-teal-400'
            }`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-200">Clinical Notification</p>
            <p className="text-xs text-slate-400 mt-1">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Specialist's Secure Patient Chart Link Modal */}
      {selectedReferralPatientId && (() => {
        const referralPatient = patients.find(p => p.id === selectedReferralPatientId);
        const referralPatientLogs = logs.filter(l => l.patientId === selectedReferralPatientId).reverse();
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-slate-900 border border-teal-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-scale-in">
              <div className="flex justify-between items-center p-4 border-b border-slate-800 shrink-0">
                <h3 className="font-bold text-teal-400">Secure Patient Chart Link</h3>
                <button onClick={() => setSelectedReferralPatientId(null)} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                {referralPatient ? (
                  <div className="flex flex-col gap-4">
                    {/* General Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><strong className="block text-xs text-slate-500">Name</strong>{referralPatient.name}</div>
                      <div><strong className="block text-xs text-slate-500">Age</strong>{referralPatient.age}</div>
                      <div><strong className="block text-xs text-slate-500">Gender</strong>{referralPatient.gender}</div>
                      <div><strong className="block text-xs text-slate-500">Phone</strong>{referralPatient.phone || 'N/A'}</div>
                      <div className="col-span-2"><strong className="block text-xs text-slate-500">Location</strong>{referralPatient.location}</div>
                    </div>
                    {/* History Timeline */}
                    <div className="mt-4 border-t border-slate-800 pt-4">
                      <h4 className="font-semibold text-slate-300 mb-2">Chronological Care History</h4>
                      <div className="space-y-3">
                        {referralPatientLogs.length > 0 ? referralPatientLogs.map(log => (
                          <div key={log.id} className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 text-xs">
                            <div className="flex justify-between items-center font-bold mb-2">
                              <span className="font-mono text-slate-500">{new Date(log.date).toLocaleDateString()}</span>
                              <span className={log.glucose >= highRiskThreshold ? 'text-rose-400' : 'text-emerald-400'}>{log.glucose} mg/dL</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-slate-400 mb-2">
                              <span>BP: {log.systolic || '--'}/{log.diastolic || '--'}</span>
                              <span>Pulse: {log.pulse || '--'} bpm</span>
                              <span>Weight: {log.weight || '--'} kg</span>
                            </div>
                            <p><strong className="text-slate-500">Symptoms:</strong> {log.symptoms || 'None'}</p>
                            <p><strong className="text-slate-500">Medication:</strong> {log.medication || 'None'}</p>
                          </div>
                        )) : <p className="text-slate-500 text-center py-4">No historical logs found for this patient.</p>}
                      </div>
                    </div>
                  </div>
                ) : <p>Loading patient data...</p>}
              </div>
              <div className="p-4 border-t border-slate-800 text-right shrink-0">
                 <button onClick={() => setSelectedReferralPatientId(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs">✕ Close Chart</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Mobile Header */}
      {isMobile && (
        <MobileHeader 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
      )}

      {/* Hospital Referral Modal */}
      {isReferralModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="border-b border-slate-800 p-6 flex justify-between items-center bg-gradient-to-r from-teal-950/20 to-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-500/15 rounded-lg flex items-center justify-center border border-teal-500/25">
                  <Activity className="w-4 h-4 text-teal-400" />
                </div>
                <h3 className="font-bold text-slate-200">Secure Dispatch Panel</h3>
              </div>
              <button onClick={() => setIsReferralModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Receiving Facility</label>
                <select 
                  value={selectedHospital} 
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                >
                  <option value="National Hospital Abuja">National Hospital Abuja</option>
                  <option value="Gwagwalada Specialist Hospital">Gwagwalada Specialist Hospital</option>
                  <option value="Federal Medical Centre, Abuja">Federal Medical Centre, Abuja</option>
                  <option value="Asokoro District Hospital">Asokoro District Hospital</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Encrypted Outbound Telemetry Payload</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                  <span className="text-rose-400">SECURE TRANSIT DISPATCH</span><br />
                  <span className="text-slate-500">Source:</span> {currentFacility}<br />
                  <span className="text-slate-500">Patient ID:</span> {selectedPatient?.id || "TEMP-911-042"}<br />
                  <span className="text-slate-500">Patient Name:</span> {selectedPatient?.name}<br />
                  <span className="text-slate-500">Triage Profile:</span> {selectedPatient?.riskStatus || "Level 1 Red"}<br />
                  <br />
                  To the Clinical Triage Desk at <span className="text-teal-400">{selectedHospital}</span>:<br />
                  Stabilization protocol complete. Deploying transit. We request immediate specialist guideline coordination.
                  <br /><br />
                  <span className="text-teal-400">Secure Records Access Code:</span> <span className="underline font-bold text-slate-200">{passcodeToken}</span>
                </div>
              </div>

              {referralDispatched ? (
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 text-center text-xs font-semibold text-teal-400 animate-pulse">
                  ✓ Dispatch Successful. Packet transmitted securely.
                </div>
              ) : (
                <button
                  onClick={handleConfirmReferralDispatch}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-teal-500/10"
                >
                  Authorize & Route Alert
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Bypass Modal */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="border-b border-rose-500/20 p-5 flex justify-between items-center bg-gradient-to-r from-rose-950/20 to-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/15 rounded-lg flex items-center justify-center border border-rose-500/25">
                  <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
                </div>
                <h3 className="font-bold text-slate-200">Emergency Bypass Protocol</h3>
              </div>
              <button onClick={() => setIsEmergencyModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 text-center">
              <p className="text-sm text-slate-400">
                This action will immediately create a temporary critical patient record and bypass standard triage. Use only in life-threatening situations.
              </p>
              <button
                onClick={handleQuickEmergencyAdmit}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-rose-500/20"
              >
                Quick-Admit Critical Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for mobile sidebar */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/50 z-30"
        />
      )}

      {(!isMobile || isSidebarOpen) && (
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          currentView={currentView}
          setCurrentView={setCurrentView}
          criticalReferralsCount={criticalReferrals.length}
          isSyncing={isSyncing}
          offlineChangesCount={offlineChangesCount}
          isOnline={isOnline}
          patients={patients}
          logs={logs}
          user={currentUser}
          currentFacility={currentFacility}
          referralDispatched={referralDispatched}
          incomingReferralsCount={incomingReferrals.length}
          onLogout={handleLogout}
          unreadNotificationsCount={unreadNotificationsCount}
          navItems={[
            { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { view: 'new-patient', label: 'New Patient', icon: Heart },
            { view: 'patients', label: 'Patient Directory', icon: Eye },
            { view: 'alerts', label: 'Referral Queue', icon: Bell, badge: criticalReferrals.length },
            { view: 'hospital-inbox', label: 'Specialist Portal', icon: Heart },
          ]}
        />
      )}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {currentView === "dashboard" && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-teal-400 flex items-center gap-2"><LayoutDashboard className="w-5 h-5" />Dashboard</h2>
                <p className="text-xs text-slate-500 mt-1">{currentFacility}</p>
              </div>
              <button 
                onClick={() => setIsEmergencyModalOpen(true)}
                className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rose-500 hover:text-slate-950 transition-all shadow-lg"
              >
                Emergency only
              </button>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-4 flex flex-col gap-6">
                <PatientRegistry 
                  patients={facilityPatients}
                  selectedPatientId={selectedPatientId}
                  setSelectedPatientId={(id) => {
                    setSelectedPatientId(id);
                    setCurrentView("patient-profile");
                  }}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  setCurrentView={setCurrentView}
                  isLoading={isDashboardLoading}
                />
                <LogVitalsForm 
                  selectedPatient={selectedPatient}
                  handleAddCheckup={handleAddCheckup}
                  dateInput={dateInput}
                  setDateInput={setDateInput}
                  glucoseInput={glucoseInput}
                  setGlucoseInput={setGlucoseInput}
                  symptomsInput={symptomsInput}
                  setSymptomsInput={setSymptomsInput}
                  medicationInput={medicationInput}
                  setMedicationInput={setMedicationInput}
                  systolicInput={systolicInput}
                  setSystolicInput={setSystolicInput}
                  diastolicInput={diastolicInput}
                  setDiastolicInput={setDiastolicInput}
                  weightInput={weightInput}
                  setWeightInput={setWeightInput}
                  pulseInput={pulseInput}
                  setPulseInput={setPulseInput}
                  notesAndTestsInput={notesAndTestsInput}
                  setNotesAndTestsInput={setNotesAndTestsInput}
                  currentUser={currentUser}
                  formErrors={formErrors}
                />
              </div>
              <div className="xl:col-span-8 flex flex-col gap-6">
                <div className="animate-slide-in-right">
                  <HealthChart patients={patients} />
                </div>
                <HistoryTimeline
                  currentPatientLogs={currentPatientLogs}
                  highRiskThreshold={highRiskThreshold}
                  setSelectedLogId={setSelectedLogId}
                  selectedLog={selectedLog}
                  setSelectedLogIdNull={() => setSelectedLogId(null)}
                  isLoading={isDashboardLoading}
                  selectedPatient={selectedPatient}
                />
              </div>
            </div>
          </div>
        )}
        {currentView === "patient-profile" && (
           <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {selectedPatient?.referralStatus === 'pending' && selectedPatient?.referralTarget === currentFacility ? (
                  <button onClick={() => setCurrentView("hospital-inbox")} className="hover:text-teal-400 transition-colors">Specialist Portal</button>
                ) : (
                  <button onClick={() => setCurrentView("dashboard")} className="hover:text-teal-400 transition-colors">Dashboard</button>
                )}
                <span>/</span><span className="text-slate-300">Patient&nbsp;Profile</span>
              </div>
              {currentUser?.role === 'specialist' && selectedPatient?.referralTarget === currentFacility && (selectedPatient?.referralStatus === 'pending' || transferFinalized) ? (
                <button onClick={() => handleFinalizeTransfer(selectedPatient.id)} className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-teal-400 transition-all flex items-center gap-1.5 shadow-lg shadow-teal-500/10 disabled:bg-teal-500/50 disabled:cursor-not-allowed" disabled={transferFinalized || selectedPatient.referralStatus === 'accepted'}>
                  {transferFinalized || selectedPatient.referralStatus === 'accepted' ? <><CheckCircle className="w-4 h-4" /> Accepted</> : <><CheckCircle className="w-3.5 h-3.5" /> Finalize Transfer</>}
                </button>
              ) : currentUser?.role === 'specialist' && selectedPatient?.referralStatus === 'accepted' ? (
                <div className="px-4 py-2 bg-emerald-500/20 text-emerald-300 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Finalize Transfer
                </div>
              ) : (
                <button onClick={handleOpenReferralModal} className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-teal-400 transition-all flex items-center gap-1.5 shadow-lg shadow-teal-500/10">
                  <Activity className="w-3.5 h-3.5" /> Deploy Transport
                </button>
              )}
            </div>
            <PatientProfileView 
              selectedPatient={selectedPatient}
              currentPatientLogs={currentPatientLogs}
              highRiskThreshold={highRiskThreshold}
              setCurrentView={setCurrentView}
            />
            <div className="mt-4">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-teal-400 transition-all"
              >
                ← Return to Clinical Dashboard
              </button>
            </div>
           </div>
        )}
        {currentView === "new-patient" && (
          <NewPatientView 
            newPatient={newPatient}
            setNewPatient={setNewPatient}
            handleCreatePatient={handleCreatePatient}
            setCurrentView={setCurrentView}
            formErrors={formErrors}
          />
        )}
        {currentView === "edit-patient" && (
          <EditPatientView 
            patient={selectedPatient}
            handleUpdatePatient={handleUpdatePatient}
            setCurrentView={setCurrentView}
            formErrors={formErrors}
          />
        )}
        {currentView === "alerts" && (
          <ReferralQueueView 
            criticalReferrals={criticalReferrals} 
            onDeployTransport={handleDeployTransportFromQueue}
          />
        )}
        {currentView === "patients" && (
          <PatientListView 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setCurrentView={setCurrentView} 
            filteredPatients={facilityPatients.filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.location || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.id || '').toLowerCase().includes(searchQuery.toLowerCase()))}
            setSelectedPatientId={setSelectedPatientId}
          />
        )}
        {currentView === "settings" && (
          <SettingsView 
            highRiskThreshold={highRiskThreshold}
            setHighRiskThreshold={setHighRiskThreshold}
            setCurrentView={setCurrentView}
            handleFetchFromCloud={handleFetchFromCloud}
            setPatients={setPatients}
            setLogs={setLogs}
            patients={patients}
            logs={logs}
            setOfflineChangesCount={setOfflineChangesCount}
            initialPatientsSeed={initialPatientsSeed}
            initialLogsSeed={initialLogsSeed}
            currentFacility={currentFacility}
            handleUpdateFacility={handleUpdateFacility}
          />
        )}
        {currentView === "hospital-inbox" && (
          currentUser?.role === 'specialist' ? (
            <div className="flex flex-col gap-6 animate-slide-in-right">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-teal-400 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" />
                    {currentFacility} - Specialist Portal
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Incoming Emergency Dispatches</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-all uppercase tracking-wider"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
              {incomingReferrals.length > 0 ? (
                <div className="space-y-4">
                  {incomingReferrals.map((patient) => (
                    <div key={patient.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-100">{patient.name}</div>
                        <div className="text-xs text-slate-400">{patient.age}y • {patient.gender} • From: {patient.facility || 'Unknown'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${patient.riskStatus === 'High Risk' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>{patient.riskStatus}</span>
                        <button onClick={() => { setSelectedPatientId(patient.id); setCurrentView('patient-profile'); }} className="px-3 py-1.5 bg-teal-500/10 text-teal-400 rounded-lg text-xs font-bold hover:bg-teal-500/20">
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-600">No incoming referrals at this time. All queues are clear.</div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
                <AlertTriangle className="w-8 h-8 text-rose-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-200">Access Denied</h2>
              <p className="text-slate-500 max-w-md">
                This portal is restricted to specialist clinicians. As a field nurse, your primary views are the Dashboard, Patient Registry, and Referral Queue.
              </p>
              <button onClick={() => setCurrentView('dashboard')} className="mt-4 px-6 py-2 bg-teal-500 text-slate-950 font-bold rounded-lg text-sm uppercase tracking-wider hover:bg-teal-400 transition-all">
                Return to Dashboard
              </button>
            </div>
          )
        )}
      </main>
    </div>
  );
}