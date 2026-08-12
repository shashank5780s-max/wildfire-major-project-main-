import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, Navigate } from 'react-router-dom';

const Results = () => {
  const location = useLocation();
  const data = location.state?.predictionData;

  if (!data) {
    return <Navigate to="/prediction" replace />;
  }

  const BASE_URL = 'http://localhost:8000';
  const analytics = data.analytics || {};
  const riskLevel = analytics.risk || data.risk || 'Low';
  const riskScore = analytics.risk_score ?? data.risk_score ?? 0;

  const getImageUrl = (path) => path ? `${BASE_URL}${path}` : '';

  const downloadFile = (url, filename) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch(err => console.error("Download failed", err));
  };

  const getCompassDirection = (angle) => {
    if (angle === undefined || angle === null || Number.isNaN(Number(angle))) return '--';
    const normalized = ((Number(angle) % 360) + 360) % 360;
    if (normalized >= 337.5 || normalized < 22.5) return 'North';
    if (normalized >= 22.5 && normalized < 67.5) return 'North-East';
    if (normalized >= 67.5 && normalized < 112.5) return 'East';
    if (normalized >= 112.5 && normalized < 157.5) return 'South-East';
    if (normalized >= 157.5 && normalized < 202.5) return 'South';
    if (normalized >= 202.5 && normalized < 247.5) return 'South-West';
    if (normalized >= 247.5 && normalized < 292.5) return 'West';
    return 'North-West';
  };

  const spreadAngle = data.spread_angle ?? analytics.spread_angle ?? analytics.spread_direction;
  const normalizedSpreadAngle = spreadAngle !== undefined && spreadAngle !== null && !Number.isNaN(Number(spreadAngle))
    ? ((Number(spreadAngle) % 360) + 360) % 360
    : null;
  const spreadLabel = getCompassDirection(normalizedSpreadAngle);
  const hasFireDirection = normalizedSpreadAngle !== null;

  const imagePaths = {
    current_fire_mask: data.current_fire_mask,
    predicted_future_fire: data.predicted_future_fire,
    future_fire_overlay: data.future_fire_overlay,
    fire_probability_heatmap: data.fire_probability_heatmap,
    difference_map: data.difference_map,
    fire_boundary: data.fire_boundary,
    fire_direction: data.fire_direction,
    risk_dashboard: data.risk_dashboard,
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pb-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analysis Results</h1>
          <p className="text-slate-400">Review predictions and AI forecasting metrics.</p>
        </div>
        <button 
          onClick={() => downloadFile(getImageUrl('/outputs/prediction_results.csv'), 'prediction_results.csv')}
          className="btn-secondary flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Current Fire Mask</h3>
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700/50 flex items-center justify-center min-h-[200px] overflow-hidden">
              <img src={getImageUrl(imagePaths.current_fire_mask)} alt="Current Fire Mask" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
            </div>
          </div>

          <div className="glass-panel p-4 flex flex-col border-orange-500/20">
            <h3 className="text-sm font-semibold text-orange-400 mb-3 uppercase tracking-wider">Predicted Future Fire</h3>
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700/50 flex items-center justify-center min-h-[200px] overflow-hidden">
              <img src={getImageUrl(imagePaths.predicted_future_fire)} alt="Predicted Future Fire" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
            </div>
            <button onClick={() => downloadFile(getImageUrl(imagePaths.predicted_future_fire), 'predicted_future_fire.png')} className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex justify-end">Download</button>
          </div>

          <div className="glass-panel p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Future Overlay</h3>
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700/50 flex items-center justify-center min-h-[200px] overflow-hidden">
              <img src={getImageUrl(imagePaths.future_fire_overlay)} alt="Overlay" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
            </div>
            <button onClick={() => downloadFile(getImageUrl(imagePaths.future_fire_overlay), 'future_fire_overlay.png')} className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex justify-end">Download</button>
          </div>

          <div className="glass-panel p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Probability Heatmap</h3>
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700/50 flex items-center justify-center min-h-[200px] overflow-hidden">
              <img src={getImageUrl(imagePaths.fire_probability_heatmap)} alt="Heatmap" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
            </div>
            <button onClick={() => downloadFile(getImageUrl(imagePaths.fire_probability_heatmap), 'fire_probability_heatmap.png')} className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex justify-end">Download</button>
          </div>

          <div className="glass-panel p-4 flex flex-col md:col-span-2">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Difference Map</h3>
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700/50 flex items-center justify-center min-h-[250px] overflow-hidden">
              <img src={getImageUrl(imagePaths.difference_map)} alt="Difference Map" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
            </div>
          </div>

          <div className="glass-panel p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Fire Boundary</h3>
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700/50 flex items-center justify-center min-h-[200px] overflow-hidden">
              <img src={getImageUrl(imagePaths.fire_boundary)} alt="Fire Boundary" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
            </div>
          </div>

          <div className="glass-panel p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Fire Direction</h3>
            <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-700/50 flex flex-col items-center justify-center min-h-[260px] p-4">
              {hasFireDirection ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-[320px] aspect-square sm:max-w-[380px]">
                    <svg viewBox="0 0 320 320" className="w-full h-full">
                      <defs>
                        <radialGradient id="compassGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#1f2937" />
                          <stop offset="70%" stopColor="#0f172a" />
                          <stop offset="100%" stopColor="#020617" />
                        </radialGradient>
                      </defs>

                      <circle cx="160" cy="160" r="154" fill="url(#compassGlow)" stroke="#334155" strokeWidth="4" />
                      <circle cx="160" cy="160" r="132" fill="#0f172a" stroke="#475569" strokeWidth="3" />
                      <circle cx="160" cy="160" r="18" fill="#f8fafc" />

                      {[...Array(8)].map((_, index) => {
                        const angle = index * 45;
                        const rad = (angle - 90) * (Math.PI / 180);
                        const labelRadius = 112;
                        const x = 160 + Math.cos(rad) * labelRadius;
                        const y = 160 + Math.sin(rad) * labelRadius;
                        const labels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
                        return (
                          <g key={angle}>
                            <line
                              x1={160 + Math.cos(rad) * 124}
                              y1={160 + Math.sin(rad) * 124}
                              x2={160 + Math.cos(rad) * 140}
                              y2={160 + Math.sin(rad) * 140}
                              stroke="#94a3b8"
                              strokeWidth={2}
                            />
                            <text
                              x={x}
                              y={y + 5}
                              textAnchor="middle"
                              fontSize="16"
                              fill="#cbd5e1"
                              fontWeight="600"
                              letterSpacing="1"
                            >
                              {labels[index]}
                            </text>
                          </g>
                        );
                      })}

                      <circle cx="160" cy="160" r="96" fill="transparent" stroke="#475569" strokeWidth="1" />

                      <g
                        className="transition-transform duration-700 ease-out"
                        style={{ transform: `rotate(${normalizedSpreadAngle ?? 0}deg)`, transformOrigin: '160px 160px' }}
                      >
                        <polygon
                          points="160,42 170,170 160,160 150,170"
                          fill="#fb923c"
                          stroke="#f97316"
                          strokeWidth="2"
                          style={{ filter: 'drop-shadow(0 0 18px rgba(251, 146, 60, 0.45))' }}
                        />
                        <polygon
                          points="160,42 162,160 160,154 158,160"
                          fill="#fee2e2"
                        />
                        <polygon
                          points="160,278 170,170 160,160 150,170"
                          fill="#0f172a"
                          opacity="0.8"
                        />
                        <line x1="160" y1="160" x2="160" y2="44" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="160" cy="160" r="8" fill="#f8fafc" stroke="#f97316" strokeWidth="2" />
                      </g>
                    </svg>
                  </div>

                  <div className="mt-6 w-full text-left text-slate-300 space-y-2">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">Spread Direction</p>
                      <p className="text-lg font-semibold text-white">{spreadLabel}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">Angle</p>
                      <p className="text-lg font-semibold text-white">{normalizedSpreadAngle !== null ? `${normalizedSpreadAngle.toFixed(0)}°` : '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">Spread Speed</p>
                      <p className="text-lg font-semibold text-orange-400">{analytics.spread_speed !== undefined ? `${Number(analytics.spread_speed).toFixed(2)} px/t` : '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">Spread Distance</p>
                      <p className="text-lg font-semibold text-orange-400">{analytics.spread_distance !== undefined ? `${Number(analytics.spread_distance).toFixed(2)} px` : '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">Confidence</p>
                      <p className="text-lg font-semibold text-blue-400">{analytics.confidence !== undefined ? `${(Number(analytics.confidence) * 100).toFixed(1)} %` : '--'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/70 border border-slate-500/60 mb-4">
                    <span className="text-sm uppercase tracking-[0.3em] text-slate-300">NF</span>
                  </div>
                  <p className="text-xl font-semibold text-white">No Fire Detected</p>
                  <p className="text-sm text-slate-400 mt-2 text-center max-w-xs">No directional spread data was detected by the model.</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-4 flex flex-col md:col-span-2">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Risk Dashboard Output</h3>
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700/50 flex items-center justify-center min-h-[250px] overflow-hidden">
              <img src={getImageUrl(imagePaths.risk_dashboard)} alt="Risk Dashboard" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 h-fit">
          <h3 className="text-lg font-bold text-white mb-6">Fire Analytics</h3>

          <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${riskLevel === 'High' ? 'bg-red-500/10 border-red-500/20' : riskLevel === 'Medium' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
              <p className={`text-sm font-medium mb-1 ${riskLevel === 'High' ? 'text-red-400' : riskLevel === 'Medium' ? 'text-orange-400' : 'text-green-400'}`}>Risk Category</p>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-bold text-white uppercase">{riskLevel}</span>
                <span className="text-sm text-slate-400 mb-1">Score: {riskScore ? Number(riskScore).toFixed(1) : '--'}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase">Current Area</p>
                <p className="text-lg font-semibold text-slate-200">{analytics.current_fire_area ?? 0} px</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Future Area</p>
                <p className="text-lg font-semibold text-orange-400">{analytics.future_fire_area ?? 0} px</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Growth</p>
                <p className="text-lg font-semibold text-slate-200">{analytics.growth_percentage !== undefined ? `${Number(analytics.growth_percentage).toFixed(2)} %` : '--'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Spread Speed</p>
                <p className="text-lg font-semibold text-slate-200">{analytics.spread_speed !== undefined ? `${Number(analytics.spread_speed).toFixed(2)} px/t` : '--'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Spread Distance</p>
                <p className="text-lg font-semibold text-slate-200">{analytics.spread_distance !== undefined ? `${Number(analytics.spread_distance).toFixed(2)} px` : '--'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Direction</p>
                <p className="text-lg font-semibold text-slate-200">{analytics.spread_direction !== undefined ? `${Number(analytics.spread_direction).toFixed(1)} °` : '--'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Confidence</p>
                <p className="text-lg font-semibold text-blue-400">{analytics.confidence !== undefined ? `${(Number(analytics.confidence) * 100).toFixed(1)} %` : '--'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
