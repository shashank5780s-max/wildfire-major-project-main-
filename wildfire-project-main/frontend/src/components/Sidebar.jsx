import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Prediction', path: '/prediction', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { name: 'Results', path: '/results', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'About', path: '/about', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  return (
    <div className="w-64 glass-panel m-4 flex flex-col justify-between hidden md:flex border-r border-slate-700/50">
      <div>
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-blue-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-orange-400">
            Wildfire Vision
          </h1>
        </div>
        
        <nav className="mt-6 px-4 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.name} to={link.path} className="block relative">
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-blue-600/20 rounded-lg border border-blue-500/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <div className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                  </svg>
                  <span className="font-medium">{link.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="p-4">
        <div className="glass-panel p-4 text-sm text-slate-400 border border-slate-700/30 bg-slate-800/20">
          <p className="font-semibold text-slate-200 mb-1">System Status</p>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AI Engine Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
