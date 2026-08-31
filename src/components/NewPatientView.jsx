import { UserPlus } from 'lucide-react';

export default function NewPatientView({ 
  newPatient, 
  setNewPatient, 
  handleCreatePatient, 
  setCurrentView,
  formErrors
}) {
  return (
    <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="border-b border-slate-800 pb-3 mb-4">
        <h2 className="text-xl font-bold tracking-tight text-teal-400 flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Register Patient</h2>
      </div>
      <form onSubmit={handleCreatePatient} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Full Legal Name</label>
          <input 
            type="text" 
            placeholder="e.g. Chinedu Aliyu" 
            value={newPatient.name} 
            onChange={(e) => setNewPatient({...newPatient, name: e.target.value})} 
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
              value={newPatient.age} 
              onChange={(e) => setNewPatient({...newPatient, age: e.target.value})} 
              className={`w-full bg-slate-950 border ${formErrors?.age ? 'border-rose-500' : 'border-slate-800'} rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 text-slate-300`} 
              required 
            />
            {formErrors?.age && <p className="text-[10px] text-rose-500 mt-1">{formErrors.age}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Biological Gender</label>
            <select value={newPatient.gender} onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 text-slate-400">
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
            value={newPatient.phone} 
            onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})} 
            className={`w-full bg-slate-950 border ${formErrors?.phone ? 'border-rose-500' : 'border-slate-800'} rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 text-slate-300`} 
          />
          {formErrors?.phone && <p className="text-[10px] text-rose-500 mt-1">{formErrors.phone}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Rural Settlement/Catchment Location Area</label>
            <input type="text" placeholder="e.g. Bwari Rural Settlement" value={newPatient.location} onChange={(e) => setNewPatient({...newPatient, location: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 text-slate-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Initial Glucose (mg/dL)</label>
            <input 
              type="number" 
              placeholder="Value" 
              value={newPatient.initialGlucose} 
              onChange={(e) => setNewPatient({...newPatient, initialGlucose: e.target.value})} 
              className={`w-full bg-slate-950 border ${formErrors?.initialGlucose ? 'border-rose-500' : 'border-slate-800'} rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 text-slate-300`} 
            />
            {formErrors?.initialGlucose && <p className="text-[10px] text-rose-500 mt-1">{formErrors.initialGlucose}</p>}
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2 border-t border-slate-800/60 mt-2">
          <button type="button" onClick={() => setCurrentView('dashboard')} className="px-4 py-2 text-xs font-medium bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 transition-all text-slate-400">Cancel</button>
          <button type="submit" className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 rounded-lg hover:opacity-90 transition-all">Save Patient Profile Record</button>
        </div>
      </form>
    </div>
  );
}
