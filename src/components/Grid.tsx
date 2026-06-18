import { useEffect, useRef, useState } from 'react';
import { ModelType } from '../types';

interface GridProps {
  grid: number[][];
  modelType: ModelType;
  onCellClick: (x: number, y: number, value: number) => void;
  selectedBrush: number; // The state number to write
}

export default function Grid({ grid, modelType, onCellClick, selectedBrush }: GridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const isDrawingRef = useRef(false);
  const lastDrawnCellRef = useRef<{ x: number; y: number } | null>(null);

  const rows = grid.length;
  const cols = grid[0]?.length || 1;

  // Responsive container observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        // Make the grid square or with a nice ratio
        const containerWidth = Math.max(280, width);
        // We set size of canvas to fill container safely
        setDimensions({
          width: containerWidth,
          height: Math.floor(containerWidth * 0.65) // 1.5:1 ratio looks great
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Sync canvas render when dimensions or grid state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const cellWidth = dimensions.width / cols;
    const cellHeight = dimensions.height / rows;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const value = grid[y][x];
        
        // Pick filling styles based on simulation type
        let fillStyle = '#ffffff';
        let strokeStyle = '#e5e7eb'; // Very light border

        if (modelType === 'life') {
          fillStyle = value === 1 ? '#4f46e5' : '#fcfbf7'; // Indigo vs Warm Cream
          strokeStyle = '#f1efeb';
        } else if (modelType === 'elementary') {
          // Time-series waterfall blackboard style
          fillStyle = value === 1 ? '#f59e0b' : '#18181b'; // Amber vs Slate Green/Dark
          strokeStyle = '#27272a';
        } else if (modelType === 'fire') {
          // Fire model states: 0:Empty, 1:Tree, 2:Burning, 3:Ash
          if (value === 0) fillStyle = '#f5f2eb'; // Empty dry land
          else if (value === 1) fillStyle = '#15803d'; // Rich forest pine Green
          else if (value === 2) fillStyle = '#ef4444'; // Bright burning Fire
          else if (value === 3) fillStyle = '#71717a'; // Ash grey
          strokeStyle = '#e2dfd5';
        } else if (modelType === 'sand') {
          // Sand model states: 0:Empty, 1:Sand, 2:Stone, 3:Water
          if (value === 0) fillStyle = '#f0f9ff'; // Airy sky light blue
          else if (value === 1) fillStyle = '#eab308'; // Glowing Sand yellow
          else if (value === 2) fillStyle = '#475569'; // Heavy Stone slate grey
          else if (value === 3) fillStyle = '#0284c7'; // Splashing water blue
          strokeStyle = '#e0f2fe';
        } else if (modelType === 'epidemic') {
          // Epidemic: 0:Susceptible, 1:Infected, 2:Immune, 3:Deceased
          if (value === 0) fillStyle = '#22c55e'; // Green susceptible
          else if (value === 1) fillStyle = '#ef4444'; // Red infected active
          else if (value === 2) fillStyle = '#3b82f6'; // Blue immune/vaxxed
          else if (value === 3) fillStyle = '#374151'; // Deceased dark grey
          strokeStyle = '#dcfce7';
        }

        ctx.fillStyle = fillStyle;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        
        // Draw grid lines
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 1;
        ctx.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }
  }, [grid, dimensions, cols, rows, modelType]);

  // Translate client coordinates on client event to coordinate on 2D grid matrix
  const handleDrawEvent = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const xRatio = canvas.width / rect.width;
    const yRatio = canvas.height / rect.height;

    const mouseX = (clientX - rect.left) * xRatio;
    const mouseY = (clientY - rect.top) * yRatio;

    const cellWidth = dimensions.width / cols;
    const cellHeight = dimensions.height / rows;

    const cellX = Math.floor(mouseX / cellWidth);
    const cellY = Math.floor(mouseY / cellHeight);

    // Guard coordinates inside limits
    if (cellX >= 0 && cellX < cols && cellY >= 0 && cellY < rows) {
      if (
        !lastDrawnCellRef.current ||
        lastDrawnCellRef.current.x !== cellX ||
        lastDrawnCellRef.current.y !== cellY
      ) {
        lastDrawnCellRef.current = { x: cellX, y: cellY };
        onCellClick(cellX, cellY, selectedBrush);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Left click only
    isDrawingRef.current = true;
    lastDrawnCellRef.current = null;
    handleDrawEvent(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    handleDrawEvent(e.clientX, e.clientY);
  };

  // Touch Support for mobile tablets
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    lastDrawnCellRef.current = null;
    if (e.touches[0]) {
      handleDrawEvent(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    if (e.touches[0]) {
      handleDrawEvent(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleDrawEnd = () => {
    isDrawingRef.current = false;
    lastDrawnCellRef.current = null;
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleDrawEnd);
    window.addEventListener('touchend', handleDrawEnd);
    return () => {
      window.removeEventListener('mouseup', handleDrawEnd);
      window.removeEventListener('touchend', handleDrawEnd);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative" id="cellular-grid-container">
      <div className="absolute top-1 right-2 pointer-events-none bg-slate-900/60 backdrop-blur text-[10px] text-white py-0.5 px-2 rounded-full font-mono font-medium tracking-tight">
        {cols}x{rows} cells
      </div>
      <canvas
        id="automata-drawing-canvas"
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className="block border-2 border-slate-700/30 rounded-xl cursor-crosshair shadow-md focus:outline-none transition-shadow"
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'none'
        }}
      />
    </div>
  );
}
