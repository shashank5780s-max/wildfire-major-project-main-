import React from 'react';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/prediction': return 'Predict Future Fire';
      case '/results': return 'Analysis Results';
      case '/about': return 'About the AI Engine';
      default: return 'Wildfire Vision AI';
    }
  };

  return (
    <header className="h-20 flex items-center justify-between px-8 z-20">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{getPageTitle()}</h2>
        <p className="text-slate-400 text-sm mt-1 hidden md:block">Real-time thermal imaging and ConvLSTM prediction system</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-slate-800/50 border border-slate-700 text-slate-200 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 transition-all"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-4 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <button className="relative p-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
        </button>
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-slate-700 shadow-md flex items-center justify-center font-bold text-sm cursor-pointer hover:border-blue-500 transition-colors">
          AI
        </div>
      </div>
    </header>
  );
};

export default Navbar;
