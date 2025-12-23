import React from 'react';
import SensorComparisonTool from './components/SensorComparisonTool';
import './App.css';

function App() {
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
      </footer>
    </div>
  );
}

export default App;
