import React, { useState, useEffect, useRef } from 'react';
import { annotationsAPI } from '../services/api';

const AnnotationViewer = ({ file, projectId }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [annotations, setAnnotations] = useState([]);
  const [currentTool, setCurrentTool] = useState('select'); // select, rectangle, circle, line, arrow, text, pencil
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [tempAnnotation, setTempAnnotation] = useState(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState(null);

  if (!file || !projectId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <p>No file selected for annotation</p>
        </div>
      </div>
    );
  }

  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', 
    '#00FFFF', '#FFA500', '#800080', '#000000', '#FFFFFF'
  ];

  const tools = [
    { id: 'select', icon: 'fa-mouse-pointer', label: 'Select', color: 'gray' },
    { id: 'pencil', icon: 'fa-pencil-alt', label: 'Pencil', color: 'blue' },
    { id: 'line', icon: 'fa-minus', label: 'Line', color: 'green' },
    { id: 'arrow', icon: 'fa-arrow-right', label: 'Arrow', color: 'yellow' },
    { id: 'rectangle', icon: 'fa-square', label: 'Rectangle', color: 'purple' },
    { id: 'circle', icon: 'fa-circle', label: 'Circle', color: 'pink' },
    { id: 'text', icon: 'fa-font', label: 'Text', color: 'orange' },
  ];

  useEffect(() => {
    if (file && file.id) {
      loadAnnotations();
    }
  }, [file]);

  useEffect(() => {
    if (canvasRef.current) {
      drawCanvas();
    }
  }, [annotations, tempAnnotation, scale]);

  const loadAnnotations = async () => {
    try {
      setError(null);
      const response = await annotationsAPI.getByFile(file.id);
      // Decode pencil annotation points from JSON
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
    } catch (error) {
      console.error('Failed to load annotations:', error);
      // Don't show error for 404 (just means no annotations yet)
      if (error.response?.status !== 404) {
        setError('Failed to load annotations. Please try again.');
      }
      setAnnotations([]);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all saved annotations
    annotations.forEach((annotation) => {
      drawAnnotation(ctx, annotation);
    });

    // Draw temporary annotation being created
    if (tempAnnotation) {
      drawAnnotation(ctx, tempAnnotation);
    }
  };

  const drawAnnotation = (ctx, annotation) => {
    ctx.strokeStyle = annotation.color;
    ctx.fillStyle = annotation.color;
    ctx.lineWidth = 2;

    const x = annotation.x * scale;
    const y = annotation.y * scale;
    const width = (annotation.width || 0) * scale;
    const height = (annotation.height || 0) * scale;

    switch (annotation.type) {
      case 'rectangle':
        ctx.strokeRect(x, y, width, height);
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
        // Draw line
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(height, width);
        const headlen = 15;
        ctx.beginPath();
        ctx.moveTo(x + width, y + height);
        ctx.lineTo(
          x + width - headlen * Math.cos(angle - Math.PI / 6),
          y + height - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(x + width, y + height);
        ctx.lineTo(
          x + width - headlen * Math.cos(angle + Math.PI / 6),
          y + height - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;

      case 'text':
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText(annotation.text || '', x, y);
        break;

      case 'pencil':
        if (annotation.points && annotation.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(annotation.points[0].x * scale, annotation.points[0].y * scale);
          annotation.points.forEach((point) => {
            ctx.lineTo(point.x * scale, point.y * scale);
          });
          ctx.stroke();
        }
        break;

      default:
        break;
    }

    // Highlight selected annotation
    if (selectedAnnotation && selectedAnnotation.id === annotation.id) {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x - 5, y - 5, width + 10, height + 10);
      ctx.setLineDash([]);
    }
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const handleMouseDown = (e) => {
    if (currentTool === 'select') return;

    const pos = getCanvasCoordinates(e);
    setStartPos(pos);
    setIsDrawing(true);

    if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        saveAnnotation({
          type: 'text',
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          text: text,
          color: currentColor,
        });
      }
      setIsDrawing(false);
    } else if (currentTool === 'pencil') {
      setTempAnnotation({
        type: 'pencil',
        points: [pos],
        color: currentColor,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPos) return;

    const pos = getCanvasCoordinates(e);

    if (currentTool === 'pencil') {
      setTempAnnotation((prev) => ({
        ...prev,
        points: [...prev.points, pos],
      }));
    } else {
      setTempAnnotation({
        type: currentTool,
        x: startPos.x,
        y: startPos.y,
        width: pos.x - startPos.x,
        height: pos.y - startPos.y,
        color: currentColor,
      });
    }
  };

  const handleMouseUp = async (e) => {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (tempAnnotation && currentTool !== 'text') {
      await saveAnnotation(tempAnnotation);
      setTempAnnotation(null);
    }

    setStartPos(null);
  };

  const saveAnnotation = async (annotationData) => {
    try {
      const data = {
        project_id: projectId,
        file_id: file.id,
        type: annotationData.type,
        x: annotationData.x || 0,
        y: annotationData.y || 0,
        width: annotationData.width || 0,
        height: annotationData.height || 0,
        text: annotationData.text || '',
        color: annotationData.color,
        page: 1,
      };

      // For pencil tool, encode points as JSON string in text field
      if (annotationData.type === 'pencil' && annotationData.points) {
        data.text = JSON.stringify(annotationData.points);
      }

      const response = await annotationsAPI.create(data);
      setAnnotations([...annotations, response.data]);
    } catch (error) {
      console.error('Failed to save annotation:', error);
      alert('Failed to save annotation');
    }
  };

  const handleDeleteAnnotation = async (annotationId) => {
    if (!window.confirm('Delete this annotation?')) return;

    try {
      await annotationsAPI.delete(annotationId);
      setAnnotations(annotations.filter((a) => a.id !== annotationId));
      setSelectedAnnotation(null);
    } catch (error) {
      console.error('Failed to delete annotation:', error);
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
    } catch (error) {
      console.error('Failed to clear annotations:', error);
    }
  };

  const handleZoom = (delta) => {
    setScale((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle text-red-500 mr-3"></i>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Drawing Tools */}
          <div className="flex items-center gap-2 border-r pr-4">
            <span className="text-sm font-semibold text-gray-700">Tools:</span>
            <div className="flex gap-1">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    currentTool === tool.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={tool.label}
                >
                  <i className={`fas ${tool.icon}`}></i>
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-2 border-r pr-4">
            <span className="text-sm font-semibold text-gray-700">Color:</span>
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: currentColor }}
              />
              {showColorPicker && (
                <div className="absolute top-12 left-0 bg-white shadow-lg rounded-lg p-3 z-10 border border-gray-200">
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setCurrentColor(color);
                          setShowColorPicker(false);
                        }}
                        className={`w-8 h-8 rounded border-2 ${
                          currentColor === color ? 'border-blue-500' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 border-r pr-4">
            <span className="text-sm font-semibold text-gray-700">Zoom:</span>
            <button
              onClick={() => handleZoom(-0.1)}
              className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              title="Zoom Out"
            >
              <i className="fas fa-minus text-sm"></i>
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[50px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.1)}
              className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              title="Zoom In"
            >
              <i className="fas fa-plus text-sm"></i>
            </button>
            <button
              onClick={() => setScale(1)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium flex items-center gap-2"
              title="Clear All Annotations"
            >
              <i className="fas fa-trash"></i>
              Clear All
            </button>
            <button
              onClick={loadAnnotations}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2"
              title="Refresh"
            >
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
          </div>

          {/* Annotation Count */}
          <div className="ml-auto flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
            <i className="fas fa-layer-group text-blue-600"></i>
            <span className="text-sm font-semibold text-blue-800">
              {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Tool Description */}
        <div className="mt-3 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
          <i className="fas fa-info-circle mr-2"></i>
          {currentTool === 'select' && 'Click on annotations to select and delete them'}
          {currentTool === 'pencil' && 'Click and drag to draw freehand'}
          {currentTool === 'line' && 'Click and drag to draw a straight line'}
          {currentTool === 'arrow' && 'Click and drag to draw an arrow'}
          {currentTool === 'rectangle' && 'Click and drag to draw a rectangle'}
          {currentTool === 'circle' && 'Click and drag to draw a circle'}
          {currentTool === 'text' && 'Click anywhere to add text'}
        </div>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100 relative"
      >
        {/* PDF Background */}
        <div className="relative inline-block min-w-full">
          {file.type === 'pdf' ? (
            <iframe
              src={file.url}
              className="w-full border-0"
              style={{ 
                height: '800px',
                pointerEvents: 'none',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
              title={file.name}
            />
          ) : (
            <img
              src={file.url}
              alt={file.name}
              className="max-w-full"
              style={{ 
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            />
          )}

          {/* Drawing Canvas Overlay */}
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="absolute top-0 left-0 cursor-crosshair"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          />
        </div>
      </div>

      {/* Annotations List Sidebar */}
      <div className="bg-white border-t border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Annotations List</h4>
        {annotations.length > 0 ? (
          <div className="max-h-40 overflow-y-auto space-y-2">
            {annotations.map((annotation, index) => (
              <div
                key={annotation.id}
                className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 ${
                  selectedAnnotation?.id === annotation.id ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: annotation.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {annotation.type.charAt(0).toUpperCase() + annotation.type.slice(1)}
                      {annotation.text && `: "${annotation.text}"`}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {annotation.user_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAnnotation(annotation.id)}
                  className="text-red-500 hover:text-red-700 px-2 py-1"
                  title="Delete"
                >
                  <i className="fas fa-trash text-sm"></i>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No annotations yet. Use the tools above to start annotating!
          </p>
        )}
      </div>
    </div>
  );
};

export default AnnotationViewer;

