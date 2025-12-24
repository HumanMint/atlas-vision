import React, { useState, useEffect, useMemo, useRef } from 'react';
import { loadCameraData, loadLensData } from '../utils/dataLoader';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './SensorComparisonTool.css';

const aspectRatios = [
  { name: "1.78:1 (16:9)", ratio: 1.777 },
  { name: "1.85:1", ratio: 1.85 },
  { name: "2.35:1", ratio: 2.35 },
  { name: "2.39:1", ratio: 2.39 },
  { name: "2.40:1", ratio: 2.4 },
  { name: "1.33:1 (4:3)", ratio: 1.333 }
];

const SensorComparisonTool = () => {
  const reportRef = useRef(null);
  const dropdownRef = useRef(null);
  const [cameraData, setCameraData] = useState(null);
  const [lensData, setLensData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [brand1, setBrand1] = useState('');
  const [model1, setModel1] = useState('');
  const [modeIdx1, setModeIdx1] = useState(0);

  const [brand2, setBrand2] = useState('');
  const [model2, setModel2] = useState('');
  const [modeIdx2, setModeIdx2] = useState(0);

  const [isComparing, setIsComparing] = useState(false);
  const [showCam1, setShowCam1] = useState(true);
  const [showCam2, setShowCam2] = useState(true);
  
  const [seriesIdx, setSeriesIdx] = useState(0);
  const [lensIdx, setLensIdx] = useState(4); // Default 32mm
  const [deliveryRatio, setDeliveryRatio] = useState(2.39);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const init = async () => {
      const cams = await loadCameraData();
      const lenses = await loadLensData();
      setCameraData(cams);
      setLensData(lenses);
      
      const brands = Object.keys(cams);
      setBrand1(brands[0]);
      setModel1(Object.keys(cams[brands[0]])[0]);
      setBrand2(brands[1] || brands[0]);
      setModel2(Object.keys(cams[brands[1] || brands[0]])[0]);
      
      setLoading(false);
    };
    init();
  }, []);

  const parseRes = (resStr) => {
    if (!resStr) return { w: 0, h: 0 };
    const parts = resStr.split('x').map(p => parseInt(p.trim()));
    return { w: parts[0], h: parts[1] };
  };

  const currentCam1 = useMemo(() => {
    if (!cameraData || !brand1 || !model1) return null;
    const mode = cameraData[brand1][model1][modeIdx1];
    return { ...mode, res: parseRes(mode.resolution) };
  }, [cameraData, brand1, model1, modeIdx1]);

  const currentCam2 = useMemo(() => {
    if (!cameraData || !brand2 || !model2) return null;
    const mode = cameraData[brand2][model2][modeIdx2];
    return { ...mode, res: parseRes(mode.resolution) };
  }, [cameraData, brand2, model2, modeIdx2]);

  const currentSeries = lensData[seriesIdx];
  const currentLens = currentSeries?.lenses[lensIdx];
  const squeeze = currentSeries?.squeeze || 2.0;
  const fl = currentLens?.fl || 32;
  const imageCircle = currentLens?.ic || 31;

  if (loading) return <div className="loading">Loading Atlas Vision Data...</div>;

  const brands = Object.keys(cameraData);
  
  const getCamStats = (cam) => {
    if (!cam) return null;
    const desqAR = (cam.width * squeeze) / cam.height;
    const desqResW = Math.round(cam.res.w * squeeze);
    const desqResH = cam.res.h;
    
    let finalW, finalH;
    if (desqAR > deliveryRatio) {
        finalW = Math.round(desqResH * deliveryRatio);
        finalH = desqResH;
    } else {
        finalW = desqResW;
        finalH = Math.round(desqResW / deliveryRatio);
    }

    return {
        desqAR,
        desqRes: `${desqResW} x ${desqResH}`,
        finalRes: `${finalW} x ${finalH}`,
        effW: cam.width * squeeze,
        effH: cam.height
    };
  };

  const stats1 = getCamStats(currentCam1);
  const stats2 = isComparing ? getCamStats(currentCam2) : null;

  const widerEffW = (isComparing && showCam2 && showCam1) 
    ? Math.max(stats1.effW, stats2.effW) 
    : (isComparing && showCam2 && !showCam1) ? stats2.effW : stats1.effW;

  const maxEffH = (isComparing && showCam2 && showCam1)
    ? Math.max(stats1.effH, stats2.effH)
    : (isComparing && showCam2 && !showCam1) ? stats2.effH : stats1.effH;

  const masterAR = widerEffW / maxEffH;
  
  const getBoxStyles = (stats) => ({
    width: `${(stats.effW / widerEffW) * 100}%`,
    height: `${(stats.effH / maxEffH) * 100}%`,
    position: 'absolute'
  });

  const getCropMasks = (stats, colorClass) => {
    const isWiderThanDelivery = stats.desqAR > deliveryRatio;
    const activeSizePct = isWiderThanDelivery ? (deliveryRatio / stats.desqAR) * 100 : (stats.desqAR / deliveryRatio) * 100;
    const margin = (100 - activeSizePct) / 2;
    const isBlue = colorClass.includes('blue');

    const shadingStyles = {
        left: { width: isWiderThanDelivery ? `${margin}%` : '0%', height: '100%', left: 0, top: 0 },
        right: { width: isWiderThanDelivery ? `${margin}%` : '0%', height: '100%', right: 0, top: 0 },
        top: { height: isWiderThanDelivery ? '0%' : `${margin}%`, width: '100%', top: 0, left: 0 },
        bottom: { height: isWiderThanDelivery ? '0%' : `${margin}%`, width: '100%', bottom: 0, left: 0 }
    };

    const outlineStyle = isWiderThanDelivery 
        ? { width: `${activeSizePct}%`, height: '100%', left: `${margin}%`, top: 0 }
        : { width: '100%', height: `${activeSizePct}%`, left: 0, top: `${margin}%` };

    return (
        <>
            <div className={`crop-shading left ${colorClass}`} style={shadingStyles.left}></div>
            <div className={`crop-shading right ${colorClass}`} style={shadingStyles.right}></div>
            <div className={`crop-shading top ${colorClass}`} style={shadingStyles.top}></div>
            <div className={`crop-shading bottom ${colorClass}`} style={shadingStyles.bottom}></div>
            <div className={`delivery-outline ${isBlue ? 'bottom-left' : 'top-left'}`} style={outlineStyle}>
                <span className={`crop-tag ${colorClass}`}>Delivery Area ({deliveryRatio}:1)</span>
            </div>
        </>
    );
  };

  const fov1 = 2 * Math.atan((currentCam1.width * squeeze) / (2 * fl)) * (180 / Math.PI);
  const fov2 = isComparing ? 2 * Math.atan((currentCam2.width * squeeze) / (2 * fl)) * (180 / Math.PI) : 0;

  const scale = 320 / 60;
  const diag1 = Math.sqrt(Math.pow(currentCam1.width, 2) + Math.pow(currentCam1.height, 2));
  const diag2 = currentCam2 ? Math.sqrt(Math.pow(currentCam2.width, 2) + Math.pow(currentCam2.height, 2)) : 0;

  const sampleImg = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1200";

  const handleExport = async (format) => {
    if (!reportRef.current) return;
    
    reportRef.current.classList.add('is-exporting');
    
    try {
        const canvas = await html2canvas(reportRef.current, {
            backgroundColor: '#000000',
            scale: 2,
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const fileName = `Atlas_Vision_Report_${model1}${isComparing ? '_vs_' + model2 : ''}`;

        if (format === 'png') {
            const link = document.createElement('a');
            link.download = `${fileName}.png`;
            link.href = imgData;
            link.click();
        } else if (format === 'pdf') {
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${fileName}.pdf`);
        }
    } catch (err) {
        console.error("Export failed:", err);
        alert("Failed to generate report. Please try again.");
    } finally {
        reportRef.current.classList.remove('is-exporting');
    }
  };

  return (
    <div className="sensor-tool-container" id="comparison-tool">
      <div className="tool-header">
        <div className="header-main">
            <h2>Atlas Lens Co. | Vision Tool</h2>
            <p className="description">Advanced Format Comparison & Desqueezed Simulation</p>
        </div>
        <div className="header-actions">
            <div className={`share-dropdown ${isShareOpen ? 'is-open' : ''}`} ref={dropdownRef}>
                <button 
                    className="share-trigger"
                    onClick={() => setIsShareOpen(!isShareOpen)}
                >
                    Share Report
                </button>
                <div className="share-menu">
                    <button className="share-item png" onClick={() => { handleExport('png'); setIsShareOpen(false); }}>Save PNG Image</button>
                    <button className="share-item pdf" onClick={() => { handleExport('pdf'); setIsShareOpen(false); }}>Save PDF Report</button>
                </div>
            </div>
        </div>
      </div>

      <div className="tool-layout">
        <aside className="tool-sidebar">
          <div className="selection-card lens-selection">
            <h3>Lens & Delivery</h3>
            <div className="control-group">
                <label>Atlas Series</label>
                <select value={seriesIdx} onChange={(e) => { setSeriesIdx(parseInt(e.target.value)); setLensIdx(0); }}>
                    {lensData.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
                </select>
            </div>
            <div className="control-group">
                <label>Focal Length</label>
                <select value={lensIdx} onChange={(e) => setLensIdx(parseInt(e.target.value))}>
                    {currentSeries.lenses.map((l, i) => <option key={i} value={i}>{l.fl}mm</option>)}
                </select>
            </div>
            <div className="control-group">
                <label>Target Delivery Ratio</label>
                <select value={deliveryRatio} onChange={(e) => setDeliveryRatio(parseFloat(e.target.value))}>
                    {aspectRatios.map(a => <option key={a.ratio} value={a.ratio}>{a.name}</option>)}
                </select>
            </div>
          </div>

          <div className="selection-card">
            <h3>Primary Camera</h3>
            <div className="control-group">
                <label>Brand</label>
                <select value={brand1} onChange={(e) => { setBrand1(e.target.value); setModel1(Object.keys(cameraData[e.target.value])[0]); setModeIdx1(0); }}>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
            </div>
            <div className="control-group">
                <label>Model</label>
                <select value={model1} onChange={(e) => { setModel1(e.target.value); setModeIdx1(0); }}>
                    {Object.keys(cameraData[brand1]).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div className="control-group">
                <label>Mode</label>
                <select value={modeIdx1} onChange={(e) => setModeIdx1(parseInt(e.target.value))}>
                    {cameraData[brand1][model1].map((m, i) => <option key={i} value={i}>{m.name}</option>)}
                </select>
            </div>
            <div className="anamorphic-status">
                {currentCam1.nativeAnamorphic ? (
                    <span className={`status-tag supported ${currentCam1.supportedSqueezes.includes(squeeze) ? 'match' : 'mismatch'}`}>
                        {currentCam1.supportedSqueezes.includes(squeeze) ? '✓ Native De-squeeze' : `⚠ Native: ${currentCam1.supportedSqueezes.join('x, ')}x`}
                    </span>
                ) : (
                    <span className="status-tag unsupported">External De-squeeze Only</span>
                )}
            </div>
            {!isComparing && (
                <button className="add-compare-btn" onClick={() => { setIsComparing(true); setShowCam2(true); }}>+ Add Comparison Camera</button>
            )}
          </div>

          {isComparing && (
            <div className="selection-card compare-card animate-fade-in">
              <button className="close-btn" onClick={() => { setIsComparing(false); setShowCam2(false); }}>×</button>
              <h3>Comparison Camera</h3>
              <div className="control-group">
                  <label>Brand</label>
                  <select value={brand2} onChange={(e) => { setBrand2(e.target.value); setModel2(Object.keys(cameraData[e.target.value])[0]); setModeIdx2(0); }}>
                      {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
              </div>
              <div className="control-group">
                  <label>Model</label>
                  <select value={model2} onChange={(e) => { setModel2(e.target.value); setModeIdx2(0); }}>
                      {Object.keys(cameraData[brand2]).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
              </div>
              <div className="control-group">
                  <label>Mode</label>
                  <select value={modeIdx2} onChange={(e) => setModeIdx2(parseInt(e.target.value))}>
                      {cameraData[brand2][model2].map((m, i) => <option key={i} value={i}>{m.name}</option>)}
                  </select>
              </div>
              <div className="anamorphic-status">
                {currentCam2.nativeAnamorphic ? (
                    <span className={`status-tag supported ${currentCam2.supportedSqueezes.includes(squeeze) ? 'match' : 'mismatch'}`}>
                        {currentCam2.supportedSqueezes.includes(squeeze) ? '✓ Native De-squeeze' : `⚠ Native: ${currentCam2.supportedSqueezes.join('x, ')}x`}
                    </span>
                ) : (
                    <span className="status-tag unsupported">External De-squeeze Only</span>
                )}
              </div>
            </div>
          )}
        </aside>

        <main className="tool-content" ref={reportRef}>
          <div className="viz-row">
             <div className="viz-box sensor-viz">
                <div className="viz-header">
                    <span className="viz-tag">Format Comparison</span>
                </div>
                <div className="svg-container">
                    <svg viewBox="0 0 400 300" style={{ width: '100%', height: 'auto' }}>
                        <rect width="400" height="300" fill="#050505" />
                        <circle className="image-circle" cx="200" cy="150" r={(imageCircle * scale) / 2} fill="rgba(255,204,0,0.02)" stroke="#333" strokeWidth="1" />
                        <text x="200" y={150 - (imageCircle * scale) / 2 - 10} textAnchor="middle" fill="#555" fontSize="9" className="svg-label">
                            {currentSeries.name} {fl}mm Image Circle ({imageCircle}mm)
                        </text>

                        <rect
                            className="sensor-rect cam1-rect"
                            x={200 - (currentCam1.width * scale) / 2}
                            y={150 - (currentCam1.height * scale) / 2}
                            width={currentCam1.width * scale}
                            height={currentCam1.height * scale}
                            fill="none"
                            stroke="var(--atlas-gold)"
                            strokeWidth="2"
                        />
                        <text x={200 - (currentCam1.width * scale) / 2 + 5} y={150 - (currentCam1.height * scale) / 2 + 15} fill="var(--atlas-gold)" fontSize="9" className="svg-label">{brand1} {model1}</text>

                        {isComparing && (
                            <>
                                <rect
                                    className="sensor-rect cam2-rect animate-fade-in"
                                    x={200 - (currentCam2.width * scale) / 2}
                                    y={150 - (currentCam2.height * scale) / 2}
                                    width={currentCam2.width * scale}
                                    height={currentCam2.height * scale}
                                    fill="none"
                                    stroke="#00ccff"
                                    strokeWidth="2"
                                    strokeDasharray="4,4"
                                />
                                <text x={200 - (currentCam2.width * scale) / 2 + 5} y={150 + (currentCam2.height * scale) / 2 - 5} fill="#00ccff" fontSize="9" className="svg-label">{brand2} {model2}</text>
                            </>
                        )}
                    </svg>
                </div>
                <div className="viz-info">
                    <div className="info-item">
                        <span className="dot gold"></span>
                        <span>{model1}: {currentCam1.width} x {currentCam1.height}mm {diag1 > imageCircle && <span className="v-warn">might vignette!</span>}</span>
                    </div>
                    {isComparing && (
                        <div className="info-item">
                            <span className="dot blue"></span>
                            <span>{model2}: {currentCam2.width} x {currentCam2.height}mm {diag2 > imageCircle && <span className="v-warn">might vignette!</span>}</span>
                        </div>
                    )}
                </div>
             </div>

             <div className="viz-box fov-sim-viz">
                <div className="viz-header">
                    <span className="viz-tag">Desqueezed Output Simulation</span>
                    <div className="fov-toggles">
                        <label className={`toggle gold ${showCam1 ? 'active' : ''}`}>
                            <input type="checkbox" checked={showCam1} onChange={() => setShowCam1(!showCam1)} />
                            <span>Cam 1</span>
                        </label>
                        {isComparing && (
                            <label className={`toggle blue ${showCam2 ? 'active' : ''}`}>
                                <input type="checkbox" checked={showCam2} onChange={() => setShowCam2(!showCam2)} />
                                <span>Cam 2</span>
                            </label>
                        )}
                    </div>
                </div>

                <div className="fov-sim-outer">
                    <div className="fov-sim-master" style={{ 
                        aspectRatio: `${masterAR}`, 
                        backgroundImage: `url(${sampleImg})`,
                        width: masterAR > 1 ? '100%' : 'auto',
                        height: masterAR > 1 ? 'auto' : '100%'
                    }}>
                        {showCam1 && (
                            <div className="fov-frame cam1" style={getBoxStyles(stats1)}>
                                <div className="desq-frame-label gold">{brand1} {model1} ({stats1.desqAR.toFixed(2)}:1)</div>
                                {getCropMasks(stats1, 'gold-mask')}
                            </div>
                        )}
                        {(isComparing && showCam2) && (
                            <div className="fov-frame cam2" style={getBoxStyles(stats2)}>
                                <div className="desq-frame-label blue bottom">{brand2} {model2} ({stats2.desqAR.toFixed(2)}:1)</div>
                                {getCropMasks(stats2, 'blue-mask')}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="tech-summary">
                    {showCam1 && (
                        <div className="summary-col gold">
                            <h4>{brand1} {model1}</h4>
                            <ul>
                                <li>Recorded: {currentCam1.resolution} ({(currentCam1.width / currentCam1.height).toFixed(2)}:1)</li>
                                <li>De-squeezed: {stats1.desqRes} ({stats1.desqAR.toFixed(2)}:1)</li>
                                <li>Final Crop: {stats1.finalRes} ({deliveryRatio}:1)</li>
                                <li>Simulated H-FOV: {fov1.toFixed(1)}°</li>
                            </ul>
                        </div>
                    )}
                    {(isComparing && showCam2) && (
                        <div className="summary-col blue">
                            <h4>{brand2} {model2}</h4>
                            <ul>
                                <li>Recorded: {currentCam2.resolution} ({(currentCam2.width / currentCam2.height).toFixed(2)}:1)</li>
                                <li>De-squeezed: {stats2.desqRes} ({stats2.desqAR.toFixed(2)}:1)</li>
                                <li>Final Crop: {stats2.finalRes} ({deliveryRatio}:1)</li>
                                <li>Simulated H-FOV: {fov2.toFixed(1)}°</li>
                            </ul>
                        </div>
                    )}
                </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SensorComparisonTool;