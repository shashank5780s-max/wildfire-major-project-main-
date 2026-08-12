import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto h-full pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">About the Engine</h1>
        <p className="text-slate-400">Architecture and technologies behind Wildfire Vision AI.</p>
      </motion.div>

      <div className="space-y-6">
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span>Prediction Pipeline</span>
          </h2>
          <div className="space-y-4 text-slate-300">
            <p>
              The system utilizes a dual-model architecture to forecast wildfire spread from nadir thermal imagery.
            </p>
            
            <div className="pl-4 border-l-2 border-slate-700 space-y-4 py-2">
              <div>
                <h3 className="text-blue-400 font-semibold">1. U-Net Segmentation</h3>
                <p className="text-sm mt-1">
                  Each frame in the input sequence is preprocessed and passed through a ResNet34-backed U-Net model. 
                  This extracts high-precision pixel-level semantic masks of the currently active fire lines.
                </p>
              </div>
              
              <div>
                <h3 className="text-orange-400 font-semibold">2. ConvLSTM Forecasting</h3>
                <p className="text-sm mt-1">
                  The sequential fire masks are then aggregated into a spatiotemporal tensor and fed into a Convolutional LSTM network. 
                  This model captures the temporal dynamics and spatial expansion of the fire, outputting a probability map for the next timestep.
                </p>
              </div>
              
              <div>
                <h3 className="text-emerald-400 font-semibold">3. Analytics & Visualization</h3>
                <p className="text-sm mt-1">
                  A custom analytics engine computes the growth metrics, centroid shift, and risk categorizations. 
                  These are rendered back to the user alongside OpenCV/Matplotlib-generated difference maps and overlays.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <h2 className="text-lg font-bold text-white mb-4">Dataset</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Trained on the FLAME 3 Dataset, specifically leveraging the Nadir thermal (infrared) sequences from controlled burns (e.g. Hanna Hammock).
              The dataset provides rich spatiotemporal context for modeling fire behavior in varied terrain and wind conditions.
            </p>
          </div>
          
          <div className="glass-panel p-6">
            <h2 className="text-lg font-bold text-white mb-4">Technology Stack</h2>
            <div className="flex flex-wrap gap-2">
              {['Python 3.12', 'PyTorch', 'FastAPI', 'Rasterio', 'OpenCV', 'React', 'Vite', 'TailwindCSS'].map(tech => (
                <span key={tech} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
