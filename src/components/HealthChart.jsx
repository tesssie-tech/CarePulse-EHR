import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, AlertTriangle } from 'lucide-react';

export default function HealthChart({ patients = [] }) {
  const safePatients = patients || [];

  // 1. Calculate Patient Risk Distribution for Pie Chart
  const highRiskCount = safePatients.filter(p => p.riskStatus === 'High Risk').length;
  const stableCount = safePatients.length - highRiskCount;
  
  const riskData = [
    { name: 'Stable Monitor', value: stableCount, color: '#14b8a6' }, // Teal-500
    { name: 'Critical High Risk', value: highRiskCount, color: '#f43f5e' } // Rose-500
  ];

  // 2. Calculate Geographic Triage Burden for Stacked Bar Chart
  const locationMap = safePatients.reduce((acc, p) => {
    const loc = p.location || 'Unknown Hub';
    if (!acc[loc]) acc[loc] = { name: loc, HighRisk: 0, Stable: 0 };
    if (p.riskStatus === 'High Risk') acc[loc].HighRisk += 1;
    else acc[loc].Stable += 1;
    return acc;
  }, {});
  
  // Convert to array and sort by highest total patient burden
  const regionalData = Object.values(locationMap).sort((a, b) => (b.HighRisk + b.Stable) - (a.HighRisk + a.Stable));

  return (
    <div className="flex flex-col gap-6 animate-slide-in-right">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold tracking-tight text-teal-400 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Regional Health Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Aggregate population health metrics and geographic triage distribution.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
           <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Triage Risk Distribution
          </h3>
          <div className="w-full h-[250px] min-w-0">
            {safePatients.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 text-xs">No patient data available.</div>
            ) : (
              <ResponsiveContainer width="99%" height="100%">
                <PieChart>
                  <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: 12, borderRadius: '8px' }} itemStyle={{ color: '#f1f5f9' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Geographic Distribution Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
           <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-teal-500" /> Geographic Catchment Burden
          </h3>
          <div className="w-full h-[250px] min-w-0">
            {regionalData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 text-xs">No geographic data available.</div>
            ) : (
              <ResponsiveContainer width="99%" height="100%">
                <BarChart data={regionalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: 12, borderRadius: '8px' }} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Stable" stackId="a" fill="#14b8a6" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="HighRisk" name="High Risk" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
