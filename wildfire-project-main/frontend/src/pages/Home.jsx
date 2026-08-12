import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="h-full flex flex-col">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel p-8 md:p-12 relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]"></div>
        
        <div className="max-w-3xl relative z-10">
          <span className="px-3 py-1 text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-500/10 rounded-full border border-blue-500/20 mb-6 inline-block">
            Production Ready
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Advanced Wildfire <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-300">
              Prediction Engine
            </span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl">
            Wildfire Vision AI uses U-Net segmentation and ConvLSTM sequence modeling on thermal TIFF images to forecast wildfire spread patterns with high accuracy.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/prediction" className="btn-accent text-lg px-8 py-3 flex items-center space-x-2 group">
              <span>Start Prediction</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/about" className="btn-secondary text-lg px-8 py-3">
              How it works
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 pb-4">
        {[
          {
            title: "Thermal Preprocessing",
            desc: "Automated scaling and normalization of infrared sequence data.",
            icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
            color: "from-blue-500 to-cyan-400"
          },
          {
            title: "U-Net Segmentation",
            desc: "Pixel-perfect semantic segmentation to isolate active fire boundaries.",
            icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
            color: "from-indigo-500 to-purple-500"
          },
          {
            title: "ConvLSTM Forecasting",
            desc: "Spatiotemporal modeling to predict future fire progression and risk.",
            icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
            color: "from-orange-500 to-red-500"
          }
        ].map((feature, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + (idx * 0.1) }}
            className="glass-panel p-6 hover:-translate-y-1 transition-transform duration-300 group cursor-default"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
