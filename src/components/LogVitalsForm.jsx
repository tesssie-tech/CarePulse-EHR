import { PlusCircle } from 'lucide-react';

export default function LogVitalsForm({ 
  selectedPatient, 
  handleAddCheckup, 
  dateInput, 
  setDateInput, 
  glucoseInput, 
  setGlucoseInput, 
  symptomsInput, 
  setSymptomsInput,
  medicationInput,
  setMedicationInput,
  systolicInput,
  setSystolicInput,
  diastolicInput,
  setDiastolicInput,
  weightInput,
  setWeightInput,
  pulseInput,
  setPulseInput,
  formErrors,
  notesAndTestsInput,
  setNotesAndTestsInput,
  currentUser
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <PlusCircle className="w-3.5 h-3.5 text-emerald-500" /> Add Log Entry for {selectedPatient?.name}
      </h3>
      <form onSubmit={handleAddCheckup} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">Date</label>
            <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">Glucose (mg/dL)</label>
            <input 
              type="number" 
              placeholder="Value" 
              value={glucoseInput} 
              onChange={(e) => setGlucoseInput(e.target.value)} 
              className={`w-full bg-slate-950 border ${formErrors?.glucose ? 'border-rose-500' : 'border-slate-800'} rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500`} 
              required 
            />
            {formErrors?.glucose && <p className="text-[10px] text-rose-500 mt-1">{formErrors.glucose}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] text-slate-500 mb-1">Systolic BP (mmHg)</label>
                <input type="text" placeholder="120" value={systolicInput} onChange={(e) => setSystolicInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500" />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] text-slate-500 mb-1">Diastolic BP (mmHg)</label>
                <input type="text" placeholder="80" value={diastolicInput} onChange={(e) => setDiastolicInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Weight (kg)</label>
              <input type="number" placeholder="70" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Pulse Rate (bpm)</label>
              <input type="number" placeholder="72" value={pulseInput} onChange={(e) => setPulseInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Observed Clinical Symptoms</label>
          <input type="text" placeholder="e.g. Dizziness, polyuria" value={symptomsInput} onChange={(e) => setSymptomsInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500" />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Prescribed Medication & Dosage</label>
          <input 
            type="text" 
            placeholder="e.g., Metformin 500mg daily" 
            value={medicationInput} 
            onChange={(e) => setMedicationInput(e.target.value)} 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500" 
          />
        </div>
        {currentUser?.role === 'specialist' && (
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">Test Orders</label>
            <textarea
              placeholder="e.g., Order HbA1c and lipid panel for next visit."
              value={notesAndTestsInput}
              onChange={(e) => setNotesAndTestsInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500 h-24 resize-none"
            />
          </div>
        )}
        <button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs py-2 rounded-lg transition-all hover:opacity-90">
          Commit Diagnostic Log
        </button>
      </form>
    </div>
  );
}
