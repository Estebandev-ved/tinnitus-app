const fs = require('fs');
let appCode = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add imports
const importsToAdd = `
import { LinkFlow } from './components/caregiver/LinkFlow';
import { PatientDashboardBadge } from './components/caregiver/PatientDashboardBadge';
import { CaregiverPanel } from './components/caregiver/CaregiverPanel';
`;
appCode = appCode.replace("import './components/DigitalTwin.css';", "import './components/DigitalTwin.css';" + importsToAdd);

// 2. Add state
const stateToAdd = `
  const [showCaregiver, setShowCaregiver] = useState(false);`;
appCode = appCode.replace("const [showVoiceDiary, setShowVoiceDiary] = useState(false);", "const [showVoiceDiary, setShowVoiceDiary] = useState(false);" + stateToAdd);

// 3. Add Modal/UI toggle in the header or in a menu
const buttonToAdd = `
            <button className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => setShowCaregiver(true)}>
              <Heart size={18} /> Modo Cuidador
            </button>
`;
// Add button to a visible place, let's find the header options
appCode = appCode.replace('{/* Rescue Mode Widget */}', buttonToAdd + '\n{/* Rescue Mode Widget */}');

// 4. Add the modal for Caregiver Mode
const modalToAdd = `
      {/* Caregiver Modal */}
      {showCaregiver && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ backgroundColor: '#111827', padding: '24px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ marginBottom: '24px', borderBottom: '1px solid #374151', paddingBottom: '16px' }}>
              <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}><Heart color="#ef4444" /> Panel Modo Cuidador (Demo)</h2>
              <button className="close-btn" onClick={() => setShowCaregiver(false)} style={{ color: '#9ca3af' }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div>
                <h3 style={{ color: '#9ca3af', marginBottom: '16px', fontSize: '14px' }}>1. Flujo de Vinculación</h3>
                <LinkFlow />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ color: '#9ca3af', marginBottom: '16px', fontSize: '14px' }}>2. Vista del Paciente</h3>
                  <PatientDashboardBadge caregiverName="Dra. Gómez" />
                </div>
                
                <div>
                  <h3 style={{ color: '#9ca3af', marginBottom: '16px', fontSize: '14px' }}>3. Panel del Cuidador</h3>
                  <CaregiverPanel patientName="Carlos" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
`;

appCode = appCode.replace('{showLibrary && (', modalToAdd + '\n      {showLibrary && (');

fs.writeFileSync('src/App.jsx', appCode);
console.log('App patched!');
