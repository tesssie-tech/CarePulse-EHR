import { Users, PlusCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

export default function PatientListView({ searchQuery, setSearchQuery, setCurrentView, filteredPatients, setSelectedPatientId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPatients = filteredPatients?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalPatients / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalPatients);
  const paginatedPatients = (filteredPatients || []).slice(startIndex, endIndex);

  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-slate-800 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-teal-400 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" /> Patient Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Full directory of active patients enrolled.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              placeholder="Search by name or location..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-8 pr-8 text-xs text-slate-300 focus:outline-none focus:border-teal-500 transition-all"
            />
            <Users className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button 
            onClick={() => setCurrentView('new-patient')}
            className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Register New
          </button>
        </div>
      </div>

      {/* Table for Desktop */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-sm ">
          <thead className="bg-slate-950/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4 whitespace-nowrap">ID</th>
              <th className="p-4 whitespace-nowrap">Patient Name</th>
              <th className="p-4 whitespace-nowrap">Demographics</th>
              <th className="p-4 whitespace-nowrap">Settlement</th>
              <th className="p-4 text-center whitespace-nowrap">Clinical Status</th>
              <th className="p-4 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {!paginatedPatients || paginatedPatients.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-600 text-sm">
                  No patients found matching your search.
                </td>
              </tr>
            ) : (
              paginatedPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-800/10 transition-all text-slate-300 animate-slide-in-right">
                  <td className="p-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                    #{patient.id?.substring ? patient.id.substring(0, 5) : patient.id}
                  </td>
                  <td className="p-4 font-semibold text-slate-200 whitespace-nowrap">{patient.name}</td>
                  <td className="p-4 text-slate-400 whitespace-nowrap">{patient.age}y / {patient.gender}</td>
                  <td className="p-4 text-slate-400 whitespace-nowrap">{patient.location}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${patient.riskStatus === 'High Risk' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} uppercase tracking-wide`}>
                      {patient.riskStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => { setSelectedPatientId(patient.id); setCurrentView('dashboard'); }}
                      className="text-xs font-bold text-teal-500 hover:text-teal-400 underline decoration-teal-500/30 underline-offset-4"
                    >
                      View Charts
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
        {paginatedPatients.length > 0 ? (
          paginatedPatients.map(patient => (
            <div key={patient.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg animate-slide-in-right">
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-bold text-slate-100 truncate">{patient.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${patient.riskStatus === 'High Risk' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} uppercase tracking-wide shrink-0`}>
                  {patient.riskStatus}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-2 space-y-1 font-mono">
                <p><strong className="text-slate-500">ID:</strong> #{patient.id?.substring ? patient.id.substring(0, 5) : patient.id}</p>
                <p><strong className="text-slate-500">Demographics:</strong> {patient.age}y / {patient.gender}</p>
                <p><strong className="text-slate-500">Settlement:</strong> {patient.location}</p>
              </div>
              <div className="mt-4 text-right">
                <button
                  onClick={() => { setSelectedPatientId(patient.id); setCurrentView('dashboard'); }}
                  className="text-xs font-bold text-teal-500 hover:text-teal-400 underline decoration-teal-500/30 underline-offset-4"
                >
                  View Charts
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-600 text-sm">No patients found matching your search.</div>
        )}
      </div>

      {/* Pagination Controls UI Footer */}
      {totalPatients > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-400">
            Showing <span className="font-semibold text-slate-200">{startIndex + 1}</span> to <span className="font-semibold text-slate-200">{endIndex}</span> of <span className="font-semibold text-slate-200">{totalPatients}</span> patients
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:hover:bg-slate-800 px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-1 font-medium"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="text-xs font-medium text-slate-400 px-2">
              Page <span className="text-slate-200">{currentPage}</span> of <span className="text-slate-200">{totalPages}</span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:hover:bg-slate-800 px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-1 font-medium"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
