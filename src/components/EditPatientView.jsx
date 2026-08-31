import { UserCog } from 'lucide-react';
import { useState } from 'react';

export default function EditPatientView({ 
  patient, 
  handleUpdatePatient, 
  setCurrentView,
  formErrors
}) {
  const [editPatient, setEditPatient] = useState(() => ({
    ...(patient || {}),
    name: patient?.name || "",
    age: patient?.age || "",
    gender: patient?.gender || "Female",
    phone: patient?.phone || "",
    location: patient?.location || ""
  }));

  const onSubmit = (e) => {
    e.preventDefault();
    handleUpdatePatient(editPatient);
  };

  if (!patient) return null;

  return (
    <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
        <UserCog className="w-5 h-5 text-teal-400" />
        <h2 className="text-lg font-bold">Edit Patient Details</h2>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Full Legal Name</label>
          <input 
            type="text" 
            placeholder="e.g. Chinedu Aliyu" 
            value={editPatient.name || ""} 
            onChange={(e) => setEditPatient({...editPatient, name: e.target.value})} 
            className={`w-full bg-slate-950 border ${formErrors?.name ? 'border-rose-500' : 'border-slate-800'} rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 text-slate-300`} 
            required 
          />
          {formErrors?.name && <p className="text-[10px] text-rose-500 mt-1">{formErrors.name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Age (Years)</label>
            <input 
              type="number" 
              placeholder="Age" 
              value={editPatient.age || ""} 
              onChange={(e) => setEditPatient({...editPatient, age: e.target.value})} 
              className={`w-full bg-slate-950 border ${formErrors?.age ? 'border-rose-500' : 'border-slate-800'} rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 text-slate-300`} 
              required 
            />
            {formErrors?.age && <p className="text-[10px] text-rose-500 mt-1">{formErrors.age}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Biological Gender</label>
            <select value={editPatient.gender || "Female"} onChange={(e) => setEditPatient({...editPatient, gender: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 text-slate-400">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Active Contact Telephone Number</label>
          <input 
            type="tel" 
            placeholder="e.g. 080XXXXXXXX" 
            value={editPatient.phone || ""} 
            onChange={(e) => setEditPatient({...editPatient, phone: e.target.value})} 
            className={`w-full bg-slate-950 border ${formErrors?.phone ? 'border-rose-500' : 'border-slate-800'} rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 text-slate-300`} 
          />
          {formErrors?.phone && <p className="text-[10px] text-rose-500 mt-1">{formErrors.phone}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Rural Settlement/Catchment Location Area</label>
          <input type="text" placeholder="e.g. Bwari Rural Settlement" value={editPatient.location || ""} onChange={(e) => setEditPatient({...editPatient, location: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 text-slate-300" />
        </div>
        <div className="flex gap-3 justify-end pt-2 border-t border-slate-800/60 mt-2">
          <button type="button" onClick={() => setCurrentView('patient-profile')} className="px-4 py-2 text-xs font-medium bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 transition-all text-slate-400">Cancel</button>
          <button type="submit" className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 rounded-lg hover:opacity-90 transition-all">Update Patient Details</button>
        </div>
      </form>
    </div>
  );
}