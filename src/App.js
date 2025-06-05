import React from 'react';
import MeterList from './components/MeterList';
import './App.css'; // Ensure your Tailwind base styles are imported here or in index.css

function App() {
  return (
    <div className="bg-slate-900 min-h-screen text-slate-100"> {/* Main background */}
      <MeterList />
    </div>
  );
}

export default App;