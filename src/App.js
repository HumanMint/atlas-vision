import React, { useState } from 'react';
import SensorComparisonTool from './components/SensorComparisonTool';
import { versionHistory, currentVersion } from './utils/versionHistory';
import './App.css';

function App() {
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <div className="App standalone-tool">
      <header className="standalone-header">
        <div className="brand-logo">Atlas Lens Co.</div>
      </header>
      
      <main>
        <SensorComparisonTool />
      </main>

      <footer className="standalone-footer">
        <p>&copy; {new Date().getFullYear()} Atlas Lens Co. Technical specifications for internal visualization only.</p>
        <p className="version-link" onClick={() => setShowChangelog(true)}>v{currentVersion}</p>
      </footer>

      {showChangelog && (
        <div className="modal-overlay" onClick={() => setShowChangelog(false)}>
          <div className="changelog-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowChangelog(false)}>×</button>
            <h3>Version History</h3>
            <div className="changelog-list">
              {versionHistory.map((v, i) => (
                <div key={i} className="changelog-item">
                  <div className="version-header">
                    <span className="v-num">v{v.version}</span>
                    <span className="v-date">{v.date}</span>
                  </div>
                  <ul>
                    {v.changes.map((c, j) => <li key={j}>{c}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
