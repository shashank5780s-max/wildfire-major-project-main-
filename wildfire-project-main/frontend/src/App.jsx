import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Prediction from './pages/Prediction';
import Results from './pages/Results';
import About from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-900 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
          <div className="absolute bottom-0 right-0 w-full h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6 z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/prediction" element={<Prediction />} />
              <Route path="/results" element={<Results />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
