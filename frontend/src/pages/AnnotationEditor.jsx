import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { annotationsAPI } from '../services/api';
import Toast from '../components/Toast';

const AnnotationEditor = () => {
  const { projectId, fileId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const file = location.state?.file;
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [annotations, setAnnotations] = useState([]);
  const [currentTool, setCurrentTool] = useState('select');
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [lineWidth, setLineWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [tempAnnotation, setTempAnnotation] = useState(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [toast, setToast] = useState(null);
  const [pencilPath, setPencilPath] = useState([]);
  const [measurementPoints, setMeasurementPoints] = useState([]);
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [savedStatus, setSavedStatus] = useState('saved'); // saved, saving, unsaved

  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', 
    '#00FFFF', '#FFA500', '#800080', '#000000', '#FFFFFF',
    '#FFC0CB', '#A52A2A', '#808080', '#00FF7F', '#4B0082'
  ];

  const tools = [
    { id: 'select', icon: 'fa-mouse-pointer', label: 'Select (S)', hotkey: 'S' },
    { id: 'pan', icon: 'fa-hand-paper', label: 'Pan (H)', hotkey: 'H' },
    { id: 'pencil', icon: 'fa-pencil-alt', label: 'Pencil (P)', hotkey: 'P' },
    { id: 'line', icon: 'fa-minus', label: 'Line (L)', hotkey: 'L' },
    { id: 'arrow', icon: 'fa-arrow-right', label: 'Arrow (A)', hotkey: 'A' },
    { id: 'rectangle', icon: 'fa-square', label: 'Rectangle (R)', hotkey: 'R' },
    { id: 'circle', icon: 'fa-circle', label: 'Circle (C)', hotkey: 'C' },
    { id: 'text', icon: 'fa-font', label: 'Text (T)', hotkey: 'T' },
    { id: 'eraser', icon: 'fa-eraser', label: 'Eraser (E)', hotkey: 'E' },
    { id: 'measure-distance', icon: 'fa-ruler', label: 'Measure Distance (M)', hotkey: 'M' },
    { id: 'measure-angle', icon: 'fa-drafting-compass', label: 'Measure Angle (G)', hotkey: 'G' },
  ];

  useEffect(() => {
    if (file && fileId) {
      loadAnnotations();
    }
  }, [fileId]);

  useEffect(() => {
    drawCanvas();
  }, [annotations, tempAnnotation, scale, panOffset, selectedAnnotation]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const key = e.key.toUpperCase();
      const tool = tools.find(t => t.hotkey === key);
      if (tool) {
        setCurrentTool(tool.id);
      }
      
      // Delete selected annotation with Delete/Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnnotation) {
        handleDeleteAnnotation(selectedAnnotation.id);
      }
      
      // Undo with Ctrl+Z
      if (e.ctrlKey && e.key === 'z' && annotations.length > 0) {
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedAnnotation, annotations]);

  const loadAnnotations = async () => {
    try {
      const response = await annotationsAPI.getByFile(fileId);
      const processedAnnotations = response.data.map(annotation => {
        if (annotation.type === 'pencil' && annotation.text) {
          try {
            annotation.points = JSON.parse(annotation.text);
          } catch (e) {
            console.error('Failed to parse pencil points:', e);
          }
        }
        return annotation;
      });
      setAnnotations(processedAnnotations);
      setSavedStatus('saved');
    } catch (error) {
      if (error.response?.status !== 404) {
        showToast('Failed to load annotations', 'error');
      }
      setAnnotations([]);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(scale, scale);

    // Draw all saved annotations
    annotations.forEach((annotation) => {
      drawAnnotation(ctx, annotation);
    });

    // Draw temporary annotation being created
    if (tempAnnotation) {
      drawAnnotation(ctx, tempAnnotation, true);
    }

    // Draw measurement info
    if (showMeasurement && measurementPoints.length > 0) {
      drawMeasurementInfo(ctx);
    }

    ctx.restore();
  };

  const drawAnnotation = (ctx, annotation, isTemp = false) => {
    ctx.strokeStyle = annotation.color;
    ctx.fillStyle = annotation.color;
    ctx.lineWidth = annotation.lineWidth || lineWidth;

    const x = annotation.x;
    const y = annotation.y;
    const width = annotation.width || 0;
    const height = annotation.height || 0;

    switch (annotation.type) {
      case 'rectangle':
        ctx.strokeRect(x, y, width, height);
        if (selectedAnnotation?.id === annotation.id && !isTemp) {
          drawSelectionHandles(ctx, x, y, width, height);
        }
        break;

      case 'circle':
        const radius = Math.sqrt(width * width + height * height) / 2;
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height / 2, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();
        break;

      case 'arrow':
        drawArrow(ctx, x, y, x + width, y + height);
        break;

      case 'text':
        ctx.font = `${annotation.fontSize || 16}px Inter, Arial, sans-serif`;
        ctx.fillText(annotation.text || '', x, y);
        // Show bounding box for selected text
        if (selectedAnnotation?.id === annotation.id && !isTemp) {
          const metrics = ctx.measureText(annotation.text || '');
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(x - 5, y - 20, metrics.width + 10, 25);
          ctx.setLineDash([]);
        }
        break;

      case 'pencil':
        if (annotation.points && annotation.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
          annotation.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        break;

      case 'measure-distance':
        drawMeasurement(ctx, x, y, x + width, y + height);
        break;

      case 'measure-angle':
        if (annotation.points && annotation.points.length === 3) {
          drawAngleMeasurement(ctx, annotation.points);
        }
        break;

      default:
        break;
    }
  };

  const drawArrow = (ctx, x1, y1, x2, y2) => {
    const headLength = 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const drawMeasurement = (ctx, x1, y1, x2, y2) => {
    // Draw line
    ctx.strokeStyle = '#FF6B00';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate distance
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    
    // Draw distance label
    ctx.fillStyle = '#FF6B00';
    ctx.font = 'bold 14px Inter, Arial, sans-serif';
    const label = `${distance.toFixed(1)}px`;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    // Background for text
    const metrics = ctx.measureText(label);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(midX - metrics.width / 2 - 4, midY - 12, metrics.width + 8, 20);
    
    ctx.fillStyle = '#FF6B00';
    ctx.fillText(label, midX - metrics.width / 2, midY + 4);
  };

  const drawAngleMeasurement = (ctx, points) => {
    if (points.length !== 3) return;

    const [p1, p2, p3] = points;
    
    // Draw lines
    ctx.strokeStyle = '#6B00FF';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate angle
    const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    let angle = Math.abs(angle2 - angle1) * (180 / Math.PI);
    if (angle > 180) angle = 360 - angle;

    // Draw angle arc
    ctx.strokeStyle = '#6B00FF';
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, 30, angle1, angle2, false);
    ctx.stroke();

    // Draw angle label
    ctx.fillStyle = '#6B00FF';
    ctx.font = 'bold 14px Inter, Arial, sans-serif';
    const label = `${angle.toFixed(1)}°`;
    ctx.fillText(label, p2.x + 40, p2.y);
  };

  const drawSelectionHandles = (ctx, x, y, width, height) => {
    ctx.strokeStyle = '#00FF00';
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    const handleSize = 6;

    const handles = [
      { x: x, y: y },
      { x: x + width / 2, y: y },
      { x: x + width, y: y },
      { x: x, y: y + height / 2 },
      { x: x + width, y: y + height / 2 },
      { x: x, y: y + height },
      { x: x + width / 2, y: y + height },
      { x: x + width, y: y + height },
    ];

    handles.forEach(handle => {
      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    });
  };

  const drawMeasurementInfo = (ctx) => {
    measurementPoints.forEach((point, index) => {
      ctx.fillStyle = '#FF6B00';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(index + 1, point.x - 3, point.y + 4);
    });
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - panOffset.x) / scale,
      y: (e.clientY - rect.top - panOffset.y) / scale,
    };
  };

  const handleMouseDown = (e) => {
    const pos = getCanvasCoordinates(e);

    if (currentTool === 'pan') {
      setIsPanning(true);
      setStartPos({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    if (currentTool === 'select') {
      // Check if clicked on annotation
      const clicked = findAnnotationAtPoint(pos);
      setSelectedAnnotation(clicked);
      return;
    }

    if (currentTool === 'eraser') {
      const toDelete = findAnnotationAtPoint(pos);
      if (toDelete) {
        handleDeleteAnnotation(toDelete.id);
      }
      return;
    }

    if (currentTool === 'measure-angle') {
      setMeasurementPoints([...measurementPoints, pos]);
      if (measurementPoints.length === 2) {
        // Save angle measurement
        saveAnnotation({
          type: 'measure-angle',
          points: [...measurementPoints, pos],
          color: '#6B00FF',
          lineWidth: 2,
        });
        setMeasurementPoints([]);
        setShowMeasurement(false);
      } else {
        setShowMeasurement(true);
      }
      return;
    }

    if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text && text.trim()) {
        saveAnnotation({
          type: 'text',
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          text: text,
          color: currentColor,
          lineWidth: lineWidth,
          fontSize: 16,
        });
      }
      return;
    }

    setStartPos(pos);
    setIsDrawing(true);

    if (currentTool === 'pencil') {
      setPencilPath([pos]);
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && startPos) {
      setPanOffset({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
      return;
    }

    if (!isDrawing || !startPos) return;

    const pos = getCanvasCoordinates(e);

    if (currentTool === 'pencil') {
      setPencilPath([...pencilPath, pos]);
      setTempAnnotation({
        type: 'pencil',
        points: [...pencilPath, pos],
        color: currentColor,
        lineWidth: lineWidth,
      });
    } else if (currentTool === 'measure-distance') {
      setTempAnnotation({
        type: 'measure-distance',
        x: startPos.x,
        y: startPos.y,
        width: pos.x - startPos.x,
        height: pos.y - startPos.y,
        color: '#FF6B00',
        lineWidth: 2,
      });
    } else {
      setTempAnnotation({
        type: currentTool,
        x: startPos.x,
        y: startPos.y,
        width: pos.x - startPos.x,
        height: pos.y - startPos.y,
        color: currentColor,
        lineWidth: lineWidth,
      });
    }
  };

  const handleMouseUp = async (e) => {
    if (isPanning) {
      setIsPanning(false);
      setStartPos(null);
      return;
    }

    if (!isDrawing) return;

    setIsDrawing(false);

    if (tempAnnotation && currentTool !== 'text') {
      await saveAnnotation(tempAnnotation);
      setTempAnnotation(null);
      setPencilPath([]);
    }

    setStartPos(null);
  };

  const findAnnotationAtPoint = (point) => {
    for (let i = annotations.length - 1; i >= 0; i--) {
      const a = annotations[i];
      if (a.type === 'rectangle' || a.type === 'line' || a.type === 'arrow') {
        const minX = Math.min(a.x, a.x + a.width);
        const maxX = Math.max(a.x, a.x + a.width);
        const minY = Math.min(a.y, a.y + a.height);
        const maxY = Math.max(a.y, a.y + a.height);
        
        if (point.x >= minX - 10 && point.x <= maxX + 10 &&
            point.y >= minY - 10 && point.y <= maxY + 10) {
          return a;
        }
      }
      // Add more complex hit detection for circles, text, etc.
    }
    return null;
  };

  const saveAnnotation = async (annotationData) => {
    try {
      setSavedStatus('saving');
      const data = {
        project_id: parseInt(projectId),
        file_id: parseInt(fileId),
        type: annotationData.type,
        x: annotationData.x || 0,
        y: annotationData.y || 0,
        width: annotationData.width || 0,
        height: annotationData.height || 0,
        text: annotationData.text || '',
        color: annotationData.color,
        page: 1,
      };

      // For pencil tool, encode points as JSON string
      if (annotationData.type === 'pencil' && annotationData.points) {
        data.text = JSON.stringify(annotationData.points);
      }

      // For angle measurement, encode points
      if (annotationData.type === 'measure-angle' && annotationData.points) {
        data.text = JSON.stringify(annotationData.points);
      }

      const response = await annotationsAPI.create(data);
      
      // Process the response
      const newAnnotation = response.data;
      if (newAnnotation.type === 'pencil' && newAnnotation.text) {
        newAnnotation.points = JSON.parse(newAnnotation.text);
      }
      if (newAnnotation.type === 'measure-angle' && newAnnotation.text) {
        newAnnotation.points = JSON.parse(newAnnotation.text);
      }
      
      setAnnotations([...annotations, newAnnotation]);
      setSavedStatus('saved');
      showToast('Annotation saved', 'success');
    } catch (error) {
      console.error('Failed to save annotation:', error);
      setSavedStatus('unsaved');
      showToast('Failed to save annotation', 'error');
    }
  };

  const handleDeleteAnnotation = async (annotationId) => {
    try {
      await annotationsAPI.delete(annotationId);
      setAnnotations(annotations.filter((a) => a.id !== annotationId));
      setSelectedAnnotation(null);
      showToast('Annotation deleted', 'success');
    } catch (error) {
      console.error('Failed to delete annotation:', error);
      showToast('Failed to delete annotation', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete all annotations? This cannot be undone.')) return;

    try {
      for (const annotation of annotations) {
        await annotationsAPI.delete(annotation.id);
      }
      setAnnotations([]);
      setSelectedAnnotation(null);
      showToast('All annotations cleared', 'success');
    } catch (error) {
      console.error('Failed to clear annotations:', error);
      showToast('Failed to clear annotations', 'error');
    }
  };

  const handleUndo = async () => {
    if (annotations.length === 0) return;
    
    const lastAnnotation = annotations[annotations.length - 1];
    await handleDeleteAnnotation(lastAnnotation.id);
    showToast('Undo successful', 'info');
  };

  const handleSaveAll = async () => {
    showToast('All annotations are auto-saved!', 'success');
  };

  const handleZoom = (delta) => {
    setScale((prev) => Math.max(0.25, Math.min(4, prev + delta)));
  };

  const handleZoomFit = () => {
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  if (!file) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <i className="fas fa-exclamation-triangle text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold mb-2">No File Selected</h2>
          <p className="text-gray-400 mb-6">Please select a file to annotate</p>
          <button
            onClick={() => navigate(`/project/${projectId}`)}
            className="btn-primary"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 text-white">
        {/* Main Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/project/${projectId}`)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors"
            >
              <i className="fas fa-arrow-left"></i>
              <span className="hidden sm:inline">Back to Project</span>
            </button>
            
            <div className="h-8 w-px bg-gray-600"></div>
            
            <div className="flex items-center gap-3">
              <i className="fas fa-file-pdf text-red-400 text-xl"></i>
              <div>
                <h1 className="font-semibold text-white">{file.name}</h1>
                <p className="text-xs text-gray-400">CAD Annotation Editor</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Save Status */}
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded">
              {savedStatus === 'saving' && (
                <>
                  <i className="fas fa-spinner fa-spin text-blue-400"></i>
                  <span className="text-sm text-gray-300">Saving...</span>
                </>
              )}
              {savedStatus === 'saved' && (
                <>
                  <i className="fas fa-check-circle text-green-400"></i>
                  <span className="text-sm text-gray-300">All Changes Saved</span>
                </>
              )}
              {savedStatus === 'unsaved' && (
                <>
                  <i className="fas fa-exclamation-circle text-yellow-400"></i>
                  <span className="text-sm text-gray-300">Unsaved Changes</span>
                </>
              )}
            </div>

            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <i className="fas fa-save"></i>
              <span className="hidden sm:inline">Save Annotations</span>
            </button>
          </div>
        </div>

        {/* Tools Toolbar */}
        <div className="px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            {/* Drawing Tools */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase">Tools</span>
              <div className="flex gap-1">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      currentTool === tool.id
                        ? 'bg-blue-600 text-white shadow-lg scale-110'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={tool.label}
                  >
                    <i className={`fas ${tool.icon}`}></i>
                  </button>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="h-10 w-px bg-gray-600"></div>

            {/* Color Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase">Color</span>
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-10 h-10 rounded-lg border-2 border-gray-600 shadow-sm hover:border-blue-500 transition-colors"
                  style={{ backgroundColor: currentColor }}
                  title="Select Color"
                />
                {showColorPicker && (
                  <div className="absolute top-12 left-0 bg-gray-800 shadow-xl rounded-lg p-3 z-20 border border-gray-600">
                    <div className="grid grid-cols-5 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            setCurrentColor(color);
                            setShowColorPicker(false);
                          }}
                          className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                            currentColor === color ? 'border-blue-400 ring-2 ring-blue-400' : 'border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Separator */}
            <div className="h-10 w-px bg-gray-600"></div>

            {/* Line Width */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase">Width</span>
              <div className="flex gap-1">
                {[1, 2, 4, 6, 8].map((width) => (
                  <button
                    key={width}
                    onClick={() => setLineWidth(width)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      lineWidth === width
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={`${width}px`}
                  >
                    <div 
                      className="rounded-full bg-current" 
                      style={{ width: `${width * 2}px`, height: `${width * 2}px` }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="h-10 w-px bg-gray-600"></div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase">Zoom</span>
              <button
                onClick={() => handleZoom(-0.1)}
                className="w-8 h-8 rounded bg-gray-700 hover:bg-gray-600 flex items-center justify-center"
                title="Zoom Out"
              >
                <i className="fas fa-minus text-sm"></i>
              </button>
              <span className="text-sm font-medium text-gray-300 min-w-[60px] text-center bg-gray-700 px-2 py-1 rounded">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.1)}
                className="w-8 h-8 rounded bg-gray-700 hover:bg-gray-600 flex items-center justify-center"
                title="Zoom In"
              >
                <i className="fas fa-plus text-sm"></i>
              </button>
              <button
                onClick={handleZoomFit}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
                title="Fit to Screen"
              >
                <i className="fas fa-compress-arrows-alt mr-1"></i>
                Fit
              </button>
            </div>

            {/* Separator */}
            <div className="h-10 w-px bg-gray-600"></div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={annotations.length === 0}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo Last (Ctrl+Z)"
              >
                <i className="fas fa-undo mr-1"></i>
                Undo
              </button>
              <button
                onClick={handleClearAll}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                title="Clear All Annotations"
              >
                <i className="fas fa-trash mr-1"></i>
                Clear
              </button>
              <button
                onClick={loadAnnotations}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                title="Refresh"
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>

            {/* Annotation Count */}
            <div className="ml-auto flex items-center gap-2 bg-blue-600 px-3 py-2 rounded-lg">
              <i className="fas fa-layer-group"></i>
              <span className="text-sm font-semibold">
                {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Tool Info Bar */}
        <div className="px-4 py-2 bg-gray-700 text-sm text-gray-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fas fa-info-circle text-blue-400"></i>
              <span>
                {currentTool === 'select' && 'Click annotations to select them. Press Delete to remove.'}
                {currentTool === 'pan' && 'Click and drag to pan the canvas'}
                {currentTool === 'pencil' && 'Click and drag to draw freehand'}
                {currentTool === 'line' && 'Click and drag to draw a straight line'}
                {currentTool === 'arrow' && 'Click and drag to draw an arrow'}
                {currentTool === 'rectangle' && 'Click and drag to draw a rectangle'}
                {currentTool === 'circle' && 'Click and drag to draw a circle'}
                {currentTool === 'text' && 'Click anywhere to add text'}
                {currentTool === 'eraser' && 'Click on annotations to delete them'}
                {currentTool === 'measure-distance' && 'Click and drag to measure distance'}
                {currentTool === 'measure-angle' && 'Click 3 points to measure angle'}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              <i className="fas fa-keyboard mr-1"></i>
              Use hotkeys: S(elect), P(encil), L(ine), A(rrow), R(ectangle), C(ircle), T(ext), E(raser), M(easure), G(Angle)
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-hidden relative bg-gray-800">
        <div className="absolute inset-0 overflow-auto" ref={containerRef}>
          <div 
            className="relative inline-block min-w-full"
            style={{ 
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
          >
            {/* File Display */}
            {file.type === 'pdf' ? (
              <iframe
                ref={imageRef}
                src={file.url}
                className="border-0 bg-white shadow-2xl"
                style={{ 
                  width: `${1000 * scale}px`,
                  height: `${1400 * scale}px`,
                  pointerEvents: 'none',
                }}
                title={file.name}
              />
            ) : (
              <img
                ref={imageRef}
                src={file.url}
                alt={file.name}
                className="bg-white shadow-2xl"
                style={{ 
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              />
            )}

            {/* Drawing Canvas Overlay */}
            <canvas
              ref={canvasRef}
              width={1000}
              height={1400}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="absolute top-0 left-0"
              style={{
                cursor: 
                  currentTool === 'pan' ? 'grab' :
                  isPanning ? 'grabbing' :
                  currentTool === 'select' ? 'default' :
                  currentTool === 'eraser' ? 'not-allowed' :
                  'crosshair',
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Sidebar - Annotations List */}
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 text-white overflow-y-auto">
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-list text-blue-400"></i>
            Annotations List
          </h3>
          
          {annotations.length > 0 ? (
            <div className="space-y-2">
              {annotations.map((annotation, index) => (
                <div
                  key={annotation.id}
                  onClick={() => setSelectedAnnotation(annotation)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedAnnotation?.id === annotation.id
                      ? 'bg-blue-600 ring-2 ring-blue-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-500"
                        style={{ backgroundColor: annotation.color }}
                      />
                      <span className="text-sm font-medium">
                        #{index + 1} {annotation.type.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAnnotation(annotation.id);
                      }}
                      className="text-red-400 hover:text-red-300 px-2 py-1"
                      title="Delete"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                  
                  {annotation.text && annotation.type === 'text' && (
                    <p className="text-xs text-gray-300 truncate">
                      "{annotation.text}"
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-1">
                    by {annotation.user_name || 'You'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <i className="fas fa-layer-group text-3xl mb-3 block"></i>
              <p className="text-sm">No annotations yet</p>
              <p className="text-xs mt-1">Select a tool and start drawing!</p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 p-3 bg-gray-700 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Keyboard Shortcuts</h4>
            <div className="space-y-1 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Select Tool</span>
                <kbd className="px-2 py-0.5 bg-gray-600 rounded">S</kbd>
              </div>
              <div className="flex justify-between">
                <span>Pan Tool</span>
                <kbd className="px-2 py-0.5 bg-gray-600 rounded">H</kbd>
              </div>
              <div className="flex justify-between">
                <span>Undo</span>
                <kbd className="px-2 py-0.5 bg-gray-600 rounded">Ctrl+Z</kbd>
              </div>
              <div className="flex justify-between">
                <span>Delete Selected</span>
                <kbd className="px-2 py-0.5 bg-gray-600 rounded">Del</kbd>
              </div>
            </div>
          </div>

          {/* Current Tool Info */}
          <div className="mt-4 p-3 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-info-circle text-blue-400"></i>
              <h4 className="text-xs font-semibold text-blue-300 uppercase">Active Tool</h4>
            </div>
            <p className="text-sm text-blue-100">
              {tools.find(t => t.id === currentTool)?.label || 'Select'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-blue-300">Color:</span>
              <div 
                className="w-4 h-4 rounded border border-blue-400" 
                style={{ backgroundColor: currentColor }}
              />
              <span className="text-xs text-blue-300 ml-2">Width:</span>
              <span className="text-xs text-blue-100">{lineWidth}px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationEditor;

