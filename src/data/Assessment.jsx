import React, { useState } from 'react';
import { predictDiabetesRisk } from './mlService';

export default function Assessment() {
  const [patientData, setPatientData] = useState({
    gender: 'Male',
    age: '',
    hypertension: false,
    heartDisease: false,
    smokingHistory: 'never',
    bmi: '',
    hba1c: '',
    bloodGlucose: '',
  });
  const [riskScore, setRiskScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPatientData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRiskScore(null);

    try {
      // Replace dummy/mock score calculation with real async function call
      const score = await predictDiabetesRisk(patientData);
      setRiskScore(score);
    } catch (err) {
      console.error("Prediction failed:", err);
      setError("Failed to predict risk. Please ensure all fields are valid and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-950 text-slate-100 min-h-screen">
      <h2 className="text-xl font-bold tracking-tight text-teal-400 mb-4">Assess Diabetes Risk</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-slate-300">Gender</label>
          <select
            id="gender"
            name="gender"
            value={patientData.gender}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm bg-slate-800 text-slate-100"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-slate-300">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={patientData.age}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm bg-slate-800 text-slate-100"
            required
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="hypertension"
            name="hypertension"
            checked={patientData.hypertension}
            onChange={handleChange}
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label htmlFor="hypertension" className="ml-2 block text-sm text-slate-300">Hypertension</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="heartDisease"
            name="heartDisease"
            checked={patientData.heartDisease}
            onChange={handleChange}
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label htmlFor="heartDisease" className="ml-2 block text-sm text-slate-300">Heart Disease</label>
        </div>
        <div>
          <label htmlFor="smokingHistory" className="block text-sm font-medium text-slate-300">Smoking History</label>
          <select
            id="smokingHistory"
            name="smokingHistory"
            value={patientData.smokingHistory}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm bg-slate-800 text-slate-100"
          >
            <option value="never">Never</option>
            <option value="former">Former</option>
            <option value="current">Current</option>
          </select>
        </div>
        <div>
          <label htmlFor="bmi" className="block text-sm font-medium text-slate-300">BMI</label>
          <input
            type="number"
            id="bmi"
            name="bmi"
            value={patientData.bmi}
            onChange={handleChange}
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm bg-slate-800 text-slate-100"
            required
          />
        </div>
        <div>
          <label htmlFor="hba1c" className="block text-sm font-medium text-slate-300">HbA1c Level</label>
          <input
            type="number"
            id="hba1c"
            name="hba1c"
            value={patientData.hba1c}
            onChange={handleChange}
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm bg-slate-800 text-slate-100"
            required
          />
        </div>
        <div>
          <label htmlFor="bloodGlucose" className="block text-sm font-medium text-slate-300">Blood Glucose Level</label>
          <input
            type="number"
            id="bloodGlucose"
            name="bloodGlucose"
            value={patientData.bloodGlucose}
            onChange={handleChange}
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm bg-slate-800 text-slate-100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-lg text-sm uppercase tracking-wider hover:bg-teal-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Assessing...' : 'Assess Risk'}
        </button>
      </form>

      {riskScore !== null && (
        <div className="mt-6 p-4 bg-slate-800 rounded-lg text-center">
          <p className="text-lg font-semibold">Diabetes Risk: {riskScore}%</p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-800 text-white rounded-lg text-center">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
