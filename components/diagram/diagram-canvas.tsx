'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { DiagramItem as DiagramItemType, Transform } from '@/lib/types/diagram';
import { DiagramItem } from './diagram-item';

interface DiagramCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  items: DiagramItemType[];
  selectedItemId: string | null;
  onItemSelect: (itemId: string | null) => void;
  onItemUpdate: (itemId: string, updates: Partial<DiagramItemType>) => void;
  onItemDelete: (itemId: string) => void;
  onCanvasDrop: (x: number, y: number, iconType: string) => void;
  tool: 'select' | 'pan';
}

export function DiagramCanvas({
  imageUrl,
  imageWidth,
  imageHeight,
  items,
  selectedItemId,
  onItemSelect,
  onItemUpdate,
  onItemDelete,
  onCanvasDrop,
  tool,
}: DiagramCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: 1,
  });
  
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragStartTransform, setDragStartTransform] = useState<Transform | null>(null);

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.1, transform.scale + delta), 5);
    
    // Zoom towards mouse position
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const scaleRatio = newScale / transform.scale;
      
      setTransform({
        x: mouseX - (mouseX - transform.x) * scaleRatio,
        y: mouseY - (mouseY - transform.y) * scaleRatio,
        scale: newScale,
      });
    }
  }, [transform]);

  // Handle panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (tool === 'pan' || e.button === 1) { // Middle mouse button or pan tool
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setDragStartTransform(transform);
    } else if (tool === 'select' && e.target === canvasRef.current) {
      // Clicked on empty canvas - deselect
      onItemSelect(null);
    }
  }, [tool, transform, onItemSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && dragStartTransform) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      
      setTransform({
        ...dragStartTransform,
        x: dragStartTransform.x + dx,
        y: dragStartTransform.y + dy,
      });
    }
  }, [isPanning, panStart, dragStartTransform]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragStartTransform(null);
  }, []);

  // Handle drop from icon palette
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const iconType = e.dataTransfer.getData('iconType');
    if (!iconType || !canvasRef.current) return;
    
    // Calculate position relative to canvas with transform
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - transform.x) / transform.scale;
    const y = (e.clientY - rect.top - transform.y) / transform.scale;
    
    onCanvasDrop(x, y, iconType);
  }, [transform, onCanvasDrop]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Fit to view on initial load
  useEffect(() => {
    if (containerRef.current && imageWidth && imageHeight) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const scaleX = (containerWidth * 0.9) / imageWidth;
      const scaleY = (containerHeight * 0.9) / imageHeight;
      const scale = Math.min(scaleX, scaleY, 1);
      
      const x = (containerWidth - imageWidth * scale) / 2;
      const y = (containerHeight - imageHeight * scale) / 2;
      
      setTransform({ x, y, scale });
    }
  }, [imageWidth, imageHeight]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-900"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        ref={canvasRef}
        className="absolute inset-0"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          cursor: tool === 'pan' || isPanning ? 'grab' : 'default',
        }}
      >
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            position: 'relative',
            width: imageWidth,
            height: imageHeight,
          }}
        >
          {/* Background Image */}
          <img
            src={imageUrl}
            alt="Diagram background"
            style={{
              width: imageWidth,
              height: imageHeight,
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
            draggable={false}
          />
          
          {/* Diagram Items */}
          <div className="absolute inset-0">
            {items.map((item) => (
              <DiagramItem
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                canvasScale={transform.scale}
                onSelect={() => onItemSelect(item.id)}
                onUpdate={(updates) => onItemUpdate(item.id, updates)}
                onDelete={() => onItemDelete(item.id)}
                disabled={tool === 'pan'}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 px-3 py-2 rounded shadow text-sm">
        {Math.round(transform.scale * 100)}%
      </div>
    </div>
  );
}
