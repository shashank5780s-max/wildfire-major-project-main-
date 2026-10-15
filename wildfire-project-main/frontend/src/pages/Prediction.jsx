import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { uploadImages, predict } from '../services/api';

const Prediction = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('sample'); // 'sample' or 'upload'
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const isUploading = useRef(false);
  const fileInputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const handleUploadAndPredictClick = () => {
    console.log('Button clicked');
    if (fileInputRef.current) {
      console.log('File picker opened');
      fileInputRef.current.click();
    } else {
      console.log('File input ref missing');
    }
  };

  const executeUpload = async (selectedFiles) => {
    if (selectedFiles.length !== 5) return;
    if (isUploading.current) return;
    
    console.log('Upload started');
    isUploading.current = true;
    setLoading(true);
    setError(null);
    setProgress(0);
    try {
      // 1. Upload
      await uploadImages(selectedFiles, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });
      
      // 2. Predict (no sequence specified uses uploads)
      const result = await predict();
      navigate('/results', { state: { predictionData: result } });
      
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Upload or Prediction failed');
    } finally {
      isUploading.current = false;
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    console.log('Files selected');
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files).slice(0, 5);
      console.log('Number of files received:', selected.length);
      setFiles(selected);
      
      if (selected.length === 5) {
        executeUpload(selected);
      }
    } else {
      console.log('No files received from file input');
    }
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = Array.from(e.dataTransfer.files).slice(0, 5);
      setFiles(selected);
      if (selected.length === 5) {
        executeUpload(selected);
      }
    }
  };
  
  const handlePredictSample = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await predict('sequence_001');
      navigate('/results', { state: { predictionData: result } });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Prediction failed');
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col relative">
      {/* Toast Error Notification */}
      {error && (
        <div className="absolute top-0 right-0 mt-4 mr-4 bg-red-500/90 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-2 hover:text-red-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Run Prediction</h1>
        <p className="text-slate-400">Select 5 sequential thermal images to predict future fire progression.</p>
      </motion.div>
      
      <div className="glass-panel p-2 flex mb-8 max-w-sm rounded-xl">
        <button 
          disabled={loading}
          onClick={() => setMode('sample')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'sample' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Use Sample Dataset
        </button>
        <button 
          disabled={loading}
          onClick={() => setMode('upload')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'upload' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Upload Own Images
        </button>
      </div>

      {mode === 'sample' ? (
        <motion.div 
          key="sample"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-8 flex-1 flex flex-col items-center justify-center border-dashed border-2 border-slate-600/50"
        >
          <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Sequence 001</h3>
          <p className="text-slate-400 text-center max-w-md mb-8">
            5 pre-validated thermal TIFF images showing an active wildfire scenario. Ready for testing the prediction pipeline.
          </p>
          <button 
            disabled={loading}
            onClick={handlePredictSample}
            className={`btn-primary flex items-center space-x-2 px-8 py-3 text-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing AI...
              </span>
            ) : (
              <>
                <span>Run Prediction</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </motion.div>
      ) : (
        <motion.div 
          key="upload"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex flex-col"
        >
          <div 
            className={`glass-panel flex-1 flex flex-col items-center justify-center border-dashed border-2 transition-all p-8 mb-6
              ${dragActive ? 'border-orange-500 bg-orange-500/5' : 'border-slate-600/50 hover:border-slate-500'}
            `}
            onDragEnter={!loading ? handleDrag : undefined}
            onDragLeave={!loading ? handleDrag : undefined}
            onDragOver={!loading ? handleDrag : undefined}
            onDrop={!loading ? handleDrop : undefined}
          >
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-inner border border-slate-700">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Drag & Drop TIFF Images</h3>
            <p className="text-slate-400 mb-6 text-center">
              Upload exactly 5 sequential .tif or .tiff images.<br/> Max 50MB per file.
            </p>
            
            <button 
              type="button"
              onClick={handleUploadAndPredictClick}
              className={`btn-primary px-8 py-3 text-lg cursor-pointer ${loading ? 'pointer-events-none opacity-50' : ''}`}
              disabled={loading}
              style={{ position: 'relative', zIndex: 10 }}
            >
              <span>Upload & Predict</span>
            </button>
            <button 
              type="button"
              onClick={handlePredictSample}
              disabled={loading}
              className={`btn-secondary mt-4 px-6 py-3 text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Predict Sample Data
            </button>
            <input 
              id="thermal-upload"
              type="file"
              multiple
              accept= ".tif,.tiff,.jpg,.jpeg"
              style={{ display: 'none' }}
              disabled={loading}
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
          </div>
          
          {files.length > 0 && (
            <div className="glass-panel p-6">
              <h4 className="text-white font-medium mb-4 flex items-center justify-between">
                <span>Selected Files ({files.length}/5)</span>
                {files.length === 5 && !loading && <span className="text-emerald-400 text-sm">Ready to predict</span>}
              </h4>
              <div className="space-y-2 mb-6">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm">
                    <span className="text-slate-300 truncate">{f.name}</span>
                    <span className="text-slate-500">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ))}
              </div>
              
              {files.length === 5 && !loading && (
                <button
                  type="button"
                  onClick={() => executeUpload(files)}
                  className="btn-primary w-full py-3 text-lg"
                >
                  Predict Uploaded Files
                </button>
              )}

              {loading && progress > 0 && progress < 100 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Prediction;
