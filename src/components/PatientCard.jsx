
const PatientCard = ({ patient }) => {
  return (
    <div className="patient-card" style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
      <h3>{patient.name}</h3>
      <p><strong>Age:</strong> {patient.age}</p>
      <p><strong>Location:</strong> {patient.location}</p>
      <p><strong>Glucose Level:</strong> {patient.glucoseLevel} mg/dL</p>
      <p><strong>Status:</strong> <span style={{ color: patient.status === 'At Risk' ? 'red' : 'green' }}>{patient.status}</span></p>
      <p><small>Last Checkup: {patient.lastCheckup}</small></p>
    </div>
  );
};

export default PatientCard;
