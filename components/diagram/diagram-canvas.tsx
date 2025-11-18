'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { DiagramItem as DiagramItemType, DiagramLayer, DrawingPath, DrawingShape, Transform } from '@/lib/types/diagram';
import { DiagramItem } from './diagram-item';

interface DiagramCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  items: DiagramItemType[];
  layers: DiagramLayer[];
  selectedLayerId?: string | null;
  drawingPaths: DrawingPath[];
  drawingShapes: DrawingShape[];
  selectedItemId: string | null;
  selectedItemIds: string[];
  selectedDrawingId: string | null;
  selectedDrawingType: 'path' | 'shape' | null;
  selectedDrawingIds: Array<{id: string, type: 'path' | 'shape'}>;
  onItemSelect: (itemId: string | null) => void;
  onMultiSelect: (itemIds: string[]) => void;
  onDrawingSelect: (id: string | null, type: 'path' | 'shape' | null) => void;
  onDrawingMultiSelect: (drawings: Array<{id: string, type: 'path' | 'shape'}>) => void;
  onItemUpdate: (itemId: string, updates: Partial<DiagramItemType>) => void;
  onMultiItemUpdate: (itemIds: string[], updates: Partial<DiagramItemType>) => void;
  onItemDelete: (itemId: string) => void;
  onCanvasDrop: (x: number, y: number, iconType: string) => void;
  onDrawingPathAdd: (path: DrawingPath) => void;
  onDrawingPathsUpdate: (paths: DrawingPath[]) => void;
  onDrawingShapeAdd: (shape: DrawingShape) => void;
  onDrawingShapesUpdate: (shapes: DrawingShape[]) => void;
  tool: 'select' | 'pan' | 'pen' | 'eraser' | 'circle' | 'rectangle' | 'triangle';
  drawingColor: string;
  drawingWidth: number;
  drawingOpacity: number;
  drawingFilled: boolean;
  onLabelEditChange?: (isEditing: boolean) => void;
}

export function DiagramCanvas({
  imageUrl,
  imageWidth,
  imageHeight,
  items,
  layers,
  selectedLayerId,
  drawingPaths,
  drawingShapes,
  selectedItemId,
  selectedItemIds,
  selectedDrawingId,
  selectedDrawingType,
  selectedDrawingIds,
  onItemSelect,
  onMultiSelect,
  onDrawingSelect,
  onDrawingMultiSelect,
  onItemUpdate,
  onMultiItemUpdate,
  onItemDelete,
  onCanvasDrop,
  onDrawingPathAdd,
  onDrawingPathsUpdate,
  onDrawingShapeAdd,
  onDrawingShapesUpdate,
  tool,
  drawingColor,
  drawingWidth,
  drawingOpacity,
  drawingFilled,
  onLabelEditChange,
}: DiagramCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const drawingBasePositionsRef = useRef<Map<string, { x?: number; y?: number; points?: { x: number; y: number }[] }>>(new Map());
  const drawingLastPositionsRef = useRef<Map<string, { x?: number; y?: number; points?: { x: number; y: number }[] }>>(new Map());
  
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: 1,
  });
  
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragStartTransform, setDragStartTransform] = useState<Transform | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [shapeEnd, setShapeEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingDrawing, setIsDraggingDrawing] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  // Helper function to check if a point is near a line segment
  const isPointNearLineSegment = useCallback((
    px: number, py: number,
    x1: number, y1: number,
    x2: number, y2: number,
    radius: number
  ): boolean => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;
    
    if (lengthSquared === 0) {
      // Line segment is a point
      const distSq = (px - x1) * (px - x1) + (py - y1) * (py - y1);
      return distSq <= radius * radius;
    }
    
    // Calculate the projection of point onto the line segment
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    
    // Calculate distance from point to projection
    const distSq = (px - projX) * (px - projX) + (py - projY) * (py - projY);
    return distSq <= radius * radius;
  }, []);

  // Helper function to check if a point is inside a path's bounding box
  const isPointInPath = useCallback((
    path: DrawingPath,
    px: number,
    py: number,
    threshold: number = 10
  ): boolean => {
    // Check each line segment in the path
    for (let i = 0; i < path.points.length - 1; i++) {
      const p1 = path.points[i];
      const p2 = path.points[i + 1];
      if (isPointNearLineSegment(px, py, p1.x, p1.y, p2.x, p2.y, threshold)) {
        return true;
      }
    }
    return false;
  }, [isPointNearLineSegment]);

  // Helper function to check if a point is inside a shape
  const isPointInShape = useCallback((
    shape: DrawingShape,
    px: number,
    py: number
  ): boolean => {
    const cos = Math.cos(-shape.rotation * Math.PI / 180);
    const sin = Math.sin(-shape.rotation * Math.PI / 180);
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    
    // Rotate point back to align with shape's axes
    const dx = px - cx;
    const dy = py - cy;
    const rotatedX = dx * cos - dy * sin + cx;
    const rotatedY = dx * sin + dy * cos + cy;

    if (shape.type === 'circle') {
      const rx = shape.width / 2;
      const ry = shape.height / 2;
      const normalizedX = (rotatedX - cx) / rx;
      const normalizedY = (rotatedY - cy) / ry;
      return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
    } else if (shape.type === 'rectangle') {
      return rotatedX >= shape.x && 
             rotatedX <= shape.x + shape.width &&
             rotatedY >= shape.y && 
             rotatedY <= shape.y + shape.height;
    } else if (shape.type === 'triangle') {
      const x1 = shape.x + shape.width / 2;
      const y1 = shape.y;
      const x2 = shape.x;
      const y2 = shape.y + shape.height;
      const x3 = shape.x + shape.width;
      const y3 = shape.y + shape.height;
      
      // Use barycentric coordinates
      const denominator = ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
      const a = ((y2 - y3) * (rotatedX - x3) + (x3 - x2) * (rotatedY - y3)) / denominator;
      const b = ((y3 - y1) * (rotatedX - x3) + (x1 - x3) * (rotatedY - y3)) / denominator;
      const c = 1 - a - b;
      
      return a >= 0 && b >= 0 && c >= 0;
    }
    return false;
  }, []);

  // Helper function to check if a shape intersects with selection box
  const isShapeInSelectionBox = useCallback((
    shape: DrawingShape,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
  ): boolean => {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    
    // Check if center is in selection box
    if (cx >= minX && cx <= maxX && cy >= minY && cy <= maxY) {
      return true;
    }
    
    // Check if any corner of the shape's bounding box is in selection
    const corners = [
      { x: shape.x, y: shape.y },
      { x: shape.x + shape.width, y: shape.y },
      { x: shape.x, y: shape.y + shape.height },
      { x: shape.x + shape.width, y: shape.y + shape.height }
    ];
    
    for (const corner of corners) {
      if (corner.x >= minX && corner.x <= maxX && corner.y >= minY && corner.y <= maxY) {
        return true;
      }
    }
    
    return false;
  }, []);

  // Helper function to check if a path intersects with selection box
  const isPathInSelectionBox = useCallback((
    path: DrawingPath,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
  ): boolean => {
    // Check if any point in the path is within the selection box
    for (const point of path.points) {
      if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
        return true;
      }
    }
    return false;
  }, []);

  // Helper function to check if eraser hits a path
  const doesEraserHitPath = useCallback((
    path: DrawingPath,
    eraserX: number,
    eraserY: number,
    eraserRadius: number
  ): boolean => {
    // Check each line segment in the path
    for (let i = 0; i < path.points.length - 1; i++) {
      const p1 = path.points[i];
      const p2 = path.points[i + 1];
      if (isPointNearLineSegment(eraserX, eraserY, p1.x, p1.y, p2.x, p2.y, eraserRadius)) {
        return true;
      }
    }
    return false;
  }, [isPointNearLineSegment]);

  // Helper function to check if eraser hits a shape
  const doesEraserHitShape = useCallback((
    shape: DrawingShape,
    eraserX: number,
    eraserY: number,
    eraserRadius: number
  ): boolean => {
    if (shape.type === 'circle') {
      const cx = shape.x + shape.width / 2;
      const cy = shape.y + shape.height / 2;
      const rx = shape.width / 2;
      const ry = shape.height / 2;
      // Check if eraser point is inside or near the ellipse
      const normalizedX = (eraserX - cx) / rx;
      const normalizedY = (eraserY - cy) / ry;
      const distFromCenter = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
      return distFromCenter <= 1 + (eraserRadius / Math.min(rx, ry));
    } else if (shape.type === 'rectangle') {
      // Check if eraser is inside or near rectangle
      return eraserX >= shape.x - eraserRadius && 
             eraserX <= shape.x + shape.width + eraserRadius &&
             eraserY >= shape.y - eraserRadius && 
             eraserY <= shape.y + shape.height + eraserRadius;
    } else if (shape.type === 'triangle') {
      // Check if eraser is near the triangle
      const x1 = shape.x + shape.width / 2;
      const y1 = shape.y;
      const x2 = shape.x;
      const y2 = shape.y + shape.height;
      const x3 = shape.x + shape.width;
      const y3 = shape.y + shape.height;
      
      // Check distance to each edge of the triangle
      return isPointNearLineSegment(eraserX, eraserY, x1, y1, x2, y2, eraserRadius) ||
             isPointNearLineSegment(eraserX, eraserY, x2, y2, x3, y3, eraserRadius) ||
             isPointNearLineSegment(eraserX, eraserY, x3, y3, x1, y1, eraserRadius);
    }
    return false;
  }, [isPointNearLineSegment]);


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
    } else if (tool === 'pen') {
      // Start drawing a new path
      const target = e.target as HTMLElement;
      if (!target.closest('.diagram-item')) {
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left - transform.x) / transform.scale;
          const y = (e.clientY - rect.top - transform.y) / transform.scale;
          setIsDrawing(true);
          setCurrentPath([{ x, y }]);
        }
      }
    } else if (tool === 'eraser') {
      // Start erasing and erase at initial position
      const target = e.target as HTMLElement;
      if (!target.closest('.diagram-item')) {
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left - transform.x) / transform.scale;
          const y = (e.clientY - rect.top - transform.y) / transform.scale;
          
          // Erase paths at initial click position
          const eraserRadius = 20;
          const filteredPaths = drawingPaths.filter(path => {
            return !doesEraserHitPath(path, x, y, eraserRadius);
          });
          
          const filteredShapes = drawingShapes.filter(shape => {
            return !doesEraserHitShape(shape, x, y, eraserRadius);
          });
          
          if (filteredPaths.length !== drawingPaths.length) {
            onDrawingPathsUpdate(filteredPaths);
          }
          if (filteredShapes.length !== drawingShapes.length) {
            onDrawingShapesUpdate(filteredShapes);
          }
        }
        setIsDrawing(true);
      }
    } else if (tool === 'circle' || tool === 'rectangle' || tool === 'triangle') {
      // Start drawing a shape
      const target = e.target as HTMLElement;
      if (!target.closest('.diagram-item')) {
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left - transform.x) / transform.scale;
          const y = (e.clientY - rect.top - transform.y) / transform.scale;
          setShapeStart({ x, y });
          setShapeEnd({ x, y });
          setIsDrawing(true);
        }
      }
    } else if (tool === 'select') {
      // Check if clicked on background (not on an icon)
      const target = e.target as HTMLElement;
      if (!target.closest('.diagram-item')) {
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left - transform.x) / transform.scale;
          const y = (e.clientY - rect.top - transform.y) / transform.scale;
          
          // Check if clicked on a drawing (shapes first, then paths)
          let clickedOnDrawing = false;
          let clickedId: string | null = null;
          let clickedType: 'path' | 'shape' | null = null;
          
          // Check shapes (iterate backwards to prioritize top shapes)
          for (let i = drawingShapes.length - 1; i >= 0; i--) {
            const shape = drawingShapes[i];
            if (isPointInShape(shape, x, y)) {
              clickedId = shape.id;
              clickedType = 'shape';
              clickedOnDrawing = true;
              break;
            }
          }
          
          // Check paths if no shape was clicked
          if (!clickedOnDrawing) {
            for (let i = drawingPaths.length - 1; i >= 0; i--) {
              const path = drawingPaths[i];
              if (isPointInPath(path, x, y)) {
                clickedId = path.id;
                clickedType = 'path';
                clickedOnDrawing = true;
                break;
              }
            }
          }
          
          // If clicked on a drawing
          if (clickedOnDrawing && clickedId && clickedType) {
            if (e.ctrlKey || e.metaKey) {
              // Multi-select with Ctrl/Cmd
              const isAlreadySelected = selectedDrawingIds.some(d => d.id === clickedId && d.type === clickedType);
              if (isAlreadySelected) {
                // Remove from selection
                const newSelection = selectedDrawingIds.filter(d => !(d.id === clickedId && d.type === clickedType));
                onDrawingMultiSelect(newSelection);
                if (newSelection.length > 0) {
                  const last = newSelection[newSelection.length - 1];
                  onDrawingSelect(last.id, last.type);
                } else {
                  onDrawingSelect(null, null);
                }
              } else {
                // Add to selection
                // If there's a single selection but it's not in the multi-select array, add it first
                const currentSelection = [...selectedDrawingIds];
                if (selectedDrawingId && selectedDrawingType && !selectedDrawingIds.some(d => d.id === selectedDrawingId && d.type === selectedDrawingType)) {
                  currentSelection.push({ id: selectedDrawingId, type: selectedDrawingType });
                }
                onDrawingMultiSelect([...currentSelection, { id: clickedId, type: clickedType }]);
                onDrawingSelect(clickedId, clickedType);
              }
            } else {
              // Check if clicked drawing is part of multi-selection
              const isPartOfMultiSelect = selectedDrawingIds.some(d => d.id === clickedId && d.type === clickedType);
              
              // If clicking on a drawing that's not in multi-selection, select only it and clear icons
              if (!isPartOfMultiSelect) {
                // Only use onDrawingMultiSelect - it will set both single and multi state
                onItemSelect(null);
                onMultiSelect([]);
                onDrawingMultiSelect([{ id: clickedId, type: clickedType }]);
              }
            }
            // Start dragging (will move all multi-selected drawings if applicable)
            setIsDraggingDrawing(true);
            setDragStartPos({ x, y });
            return;
          }
        }
        
        // Start selection box
        if (!e.ctrlKey && !e.metaKey) {
          onItemSelect(null);
          onMultiSelect([]);
          onDrawingSelect(null, null);
        }
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left - transform.x) / transform.scale;
          const y = (e.clientY - rect.top - transform.y) / transform.scale;
          setIsSelecting(true);
          setSelectionStart({ x, y });
          setSelectionEnd({ x, y });
        }
      }
    }
  }, [tool, transform, onItemSelect, onMultiSelect, onDrawingSelect, onDrawingMultiSelect, drawingPaths, drawingShapes, onDrawingPathsUpdate, onDrawingShapesUpdate, doesEraserHitPath, doesEraserHitShape, isPointInPath, isPointInShape, selectedDrawingIds, selectedDrawingId, selectedDrawingType]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && dragStartTransform) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      
      setTransform({
        ...dragStartTransform,
        x: dragStartTransform.x + dx,
        y: dragStartTransform.y + dy,
      });
    } else if (isRotating && selectedDrawingType === 'shape' && selectedDrawingId && canvasRef.current) {
      // Rotating a shape
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - transform.x) / transform.scale;
      const mouseY = (e.clientY - rect.top - transform.y) / transform.scale;
      
      const shape = drawingShapes.find(s => s.id === selectedDrawingId);
      if (shape) {
        const cx = shape.x + shape.width / 2;
        const cy = shape.y + shape.height / 2;
        
        // Calculate angle from center to mouse
        let angle = Math.atan2(mouseY - cy, mouseX - cx) * 180 / Math.PI + 90;
        
        // Normalize angle to 0-360
        angle = (angle + 360) % 360;
        
        // Snap to 90 degree increments if within 10 degrees
        const snapThreshold = 10;
        const snapPoints = [0, 90, 180, 270];
        for (const snapPoint of snapPoints) {
          const distance = Math.abs(angle - snapPoint);
          const wrappedDistance = Math.abs((angle - snapPoint + 360) % 360);
          if (Math.min(distance, wrappedDistance, Math.abs(360 - wrappedDistance)) < snapThreshold) {
            angle = snapPoint;
            break;
          }
        }
        
        // Update shape rotation
        const updatedShapes = drawingShapes.map(s => 
          s.id === selectedDrawingId 
            ? { ...s, rotation: angle }
            : s
        );
        onDrawingShapesUpdate(updatedShapes);
      }
    } else if (isDraggingDrawing && dragStartPos && canvasRef.current) {
      // Dragging selected drawing(s) and possibly icons together
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - transform.x) / transform.scale;
      const y = (e.clientY - rect.top - transform.y) / transform.scale;
      
      const dx = x - dragStartPos.x;
      const dy = y - dragStartPos.y;
      
      // Move selected icons if any (mixed selection)
      if (selectedItemIds.length > 0) {
        onMultiItemUpdate(selectedItemIds, { x: dx, y: dy });
      }
      
      // Move all selected drawings (multi-select or single)
      if (selectedDrawingIds.length > 0) {
        const shapeIds = selectedDrawingIds.filter(d => d.type === 'shape').map(d => d.id);
        const pathIds = selectedDrawingIds.filter(d => d.type === 'path').map(d => d.id);
        
        if (shapeIds.length > 0) {
          const updatedShapes = drawingShapes.map(s => 
            shapeIds.includes(s.id)
              ? { ...s, x: s.x + dx, y: s.y + dy }
              : s
          );
          onDrawingShapesUpdate(updatedShapes);
        }
        
        if (pathIds.length > 0) {
          const updatedPaths = drawingPaths.map(p => 
            pathIds.includes(p.id)
              ? { ...p, points: p.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy })) }
              : p
          );
          onDrawingPathsUpdate(updatedPaths);
        }
      }
      
      // Also handle single drawing selection if not already handled by multi-select
      if (selectedDrawingIds.length === 0) {
        if (selectedDrawingType === 'shape' && selectedDrawingId) {
          // Single shape selected
          const shape = drawingShapes.find(s => s.id === selectedDrawingId);
          if (shape) {
            const updatedShapes = drawingShapes.map(s => 
              s.id === selectedDrawingId 
                ? { ...s, x: s.x + dx, y: s.y + dy }
                : s
            );
            onDrawingShapesUpdate(updatedShapes);
          }
        } else if (selectedDrawingType === 'path' && selectedDrawingId) {
          // Single path selected
          const path = drawingPaths.find(p => p.id === selectedDrawingId);
          if (path) {
            const updatedPaths = drawingPaths.map(p => 
              p.id === selectedDrawingId 
                ? { ...p, points: p.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy })) }
                : p
            );
            onDrawingPathsUpdate(updatedPaths);
          }
        }
      }
      
      setDragStartPos({ x, y });
    } else if (isDrawing && tool === 'pen' && canvasRef.current) {
      // Continue drawing the current path
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - transform.x) / transform.scale;
      const y = (e.clientY - rect.top - transform.y) / transform.scale;
      setCurrentPath(prev => [...prev, { x, y }]);
    } else if (isDrawing && tool === 'eraser' && canvasRef.current) {
      // Erase paths near the cursor
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - transform.x) / transform.scale;
      const y = (e.clientY - rect.top - transform.y) / transform.scale;
      
      // Remove paths that are close to the eraser position
      const eraserRadius = 20;
      const filteredPaths = drawingPaths.filter(path => {
        return !doesEraserHitPath(path, x, y, eraserRadius);
      });
      
      const filteredShapes = drawingShapes.filter(shape => {
        return !doesEraserHitShape(shape, x, y, eraserRadius);
      });
      
      if (filteredPaths.length !== drawingPaths.length) {
        onDrawingPathsUpdate(filteredPaths);
      }
      if (filteredShapes.length !== drawingShapes.length) {
        onDrawingShapesUpdate(filteredShapes);
      }
    } else if (isDrawing && (tool === 'circle' || tool === 'rectangle' || tool === 'triangle') && canvasRef.current) {
      // Update shape end position
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - transform.x) / transform.scale;
      const y = (e.clientY - rect.top - transform.y) / transform.scale;
      setShapeEnd({ x, y });
    } else if (isSelecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - transform.x) / transform.scale;
      const y = (e.clientY - rect.top - transform.y) / transform.scale;
      setSelectionEnd({ x, y });
    }
  }, [isPanning, isDrawing, isSelecting, isDraggingDrawing, isRotating, dragStartPos, selectedDrawingId, selectedDrawingType, selectedDrawingIds, selectedItemIds, panStart, dragStartTransform, transform, tool, drawingPaths, drawingShapes, onDrawingPathsUpdate, onDrawingShapesUpdate, doesEraserHitPath, doesEraserHitShape, onMultiItemUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragStartTransform(null);
    setIsDraggingDrawing(false);
    setDragStartPos(null);
    setIsRotating(false);
    
    // Clear last positions when mouse is released
    lastPositionsRef.current.clear();
    drawingBasePositionsRef.current.clear();
    drawingLastPositionsRef.current.clear();
    
    // Finish drawing
    if (isDrawing && tool === 'pen' && currentPath.length > 1) {
      const newPath: DrawingPath = {
        id: `path-${Date.now()}-${Math.random()}`,
        points: currentPath,
        color: drawingColor,
        width: drawingWidth,
        opacity: drawingOpacity,
        layerId: selectedLayerId || undefined,
      };
      onDrawingPathAdd(newPath);
      setCurrentPath([]);
    } else if (isDrawing && (tool === 'circle' || tool === 'rectangle' || tool === 'triangle') && shapeStart && shapeEnd) {
      // Finish drawing shape
      const x = Math.min(shapeStart.x, shapeEnd.x);
      const y = Math.min(shapeStart.y, shapeEnd.y);
      const width = Math.abs(shapeEnd.x - shapeStart.x);
      const height = Math.abs(shapeEnd.y - shapeStart.y);
      
      // Only create shape if it has some size
      if (width > 5 && height > 5) {
        const newShape: DrawingShape = {
          id: `shape-${Date.now()}-${Math.random()}`,
          type: tool,
          x,
          y,
          width,
          height,
          rotation: 0,
          color: drawingColor,
          strokeWidth: drawingWidth,
          opacity: drawingOpacity,
          filled: drawingFilled,
          layerId: selectedLayerId || undefined,
        };
        onDrawingShapeAdd(newShape);
      }
      setShapeStart(null);
      setShapeEnd(null);
    }
    
    setIsDrawing(false);
    
    if (isSelecting) {
      // Calculate selection box bounds
      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);
      
      // Find items within selection box
      const selectedIds = items
        .filter(item => {
          const itemCenterX = item.x + item.width / 2;
          const itemCenterY = item.y + item.height / 2;
          return itemCenterX >= minX && itemCenterX <= maxX &&
                 itemCenterY >= minY && itemCenterY <= maxY;
        })
        .map(item => item.id);
      
      // Find shapes within selection box
      const selectedShapes = drawingShapes.filter(shape => 
        isShapeInSelectionBox(shape, minX, minY, maxX, maxY)
      );
      
      // Find paths within selection box
      const selectedPaths = drawingPaths.filter(path => 
        isPathInSelectionBox(path, minX, minY, maxX, maxY)
      );
      
      // Select both items and drawings together
      if (selectedIds.length > 0) {
        onMultiSelect(selectedIds);
        onItemSelect(selectedIds[selectedIds.length - 1]);
      } else {
        onMultiSelect([]);
        onItemSelect(null);
      }
      
      const allSelectedDrawings = [
        ...selectedShapes.map(s => ({ id: s.id, type: 'shape' as const })),
        ...selectedPaths.map(p => ({ id: p.id, type: 'path' as const }))
      ];
      
      if (allSelectedDrawings.length > 0) {
        onDrawingMultiSelect(allSelectedDrawings);
      } else {
        onDrawingMultiSelect([]);
      }
      
      setIsSelecting(false);
    }
  }, [isDrawing, isSelecting, selectionStart, selectionEnd, items, tool, currentPath, drawingColor, drawingWidth, drawingOpacity, drawingFilled, shapeStart, shapeEnd, onItemSelect, onMultiSelect, onDrawingPathAdd, onDrawingShapeAdd, drawingPaths, drawingShapes, isPathInSelectionBox, isShapeInSelectionBox, onDrawingMultiSelect, selectedLayerId]);

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
          cursor: tool === 'pan' || isPanning ? 'grab' 
            : tool === 'pen' ? 'crosshair' 
            : tool === 'eraser' ? 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI0IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iOCIgcng9IjIiIGZpbGw9IiNGRjk1QzUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNOCAxMkwxNiAxMiIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIvPjwvc3ZnPg==") 12 12, auto'
            : tool === 'circle' || tool === 'rectangle' || tool === 'triangle' ? 'crosshair'
            : 'default',
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
            {items
              .filter(item => {
                // Filter by layer visibility
                const layer = layers.find(l => l.id === item.layerId);
                return !layer || layer.visible;
              })
              .sort((a, b) => {
                // Sort by layer order first, then by item zIndex
                const layerA = layers.find(l => l.id === a.layerId);
                const layerB = layers.find(l => l.id === b.layerId);
                const orderA = layerA?.order ?? 0;
                const orderB = layerB?.order ?? 0;
                
                if (orderA !== orderB) {
                  return orderA - orderB;
                }
                return a.zIndex - b.zIndex;
              })
              .map((item, index) => {
                const layer = layers.find(l => l.id === item.layerId);
                const isLocked = layer?.locked || false;
                
                // Calculate combined z-index based on rendering order
                // Use the index from the sorted array to ensure proper stacking
                const calculatedZIndex = index;
                
                return (
                  <DiagramItem
                    key={item.id}
                    item={{ ...item, zIndex: calculatedZIndex }}
                    isSelected={selectedItemIds.includes(item.id) || selectedItemId === item.id}
                    isMultiSelected={selectedItemIds.length > 1 && selectedItemIds.includes(item.id)}
                    canvasScale={transform.scale}
                    onLabelEditChange={onLabelEditChange}
                    onSelect={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    // Multi-select with Ctrl/Cmd
                    if (selectedItemIds.includes(item.id)) {
                      const newSelection = selectedItemIds.filter(id => id !== item.id);
                      onMultiSelect(newSelection);
                      if (selectedItemId === item.id) {
                        onItemSelect(newSelection[0] || null);
                      }
                    } else {
                      onMultiSelect([...selectedItemIds, item.id]);
                      onItemSelect(item.id);
                    }
                  } else {
                    // If clicking on an already selected item in a multi-selection, don't deselect
                    if (selectedItemIds.length > 1 && selectedItemIds.includes(item.id)) {
                      // Just set this as the primary selected item, keep multi-selection
                      onItemSelect(item.id);
                    } else {
                      // Single select - clear multi-selection and clear drawing selections
                      onItemSelect(item.id);
                      onMultiSelect([item.id]);
                      onDrawingSelect(null, null);
                      onDrawingMultiSelect([]);
                    }
                  }
                }}
                onUpdate={(updates) => {
                  // Check if we need to move other items or drawings (multi-select or mixed selection)
                  const hasMultipleIcons = selectedItemIds.length > 1 && selectedItemIds.includes(item.id);
                  const hasMixedSelection = selectedItemIds.includes(item.id) && selectedDrawingIds.length > 0;
                  
                  if ((hasMultipleIcons || hasMixedSelection) && ('x' in updates || 'y' in updates)) {
                    const currentItem = items.find(i => i.id === item.id);
                    
                    if (currentItem) {
                      // Store or get last position
                      const lastPos = lastPositionsRef.current.get(item.id);
                      
                      // Initialize base positions on first update in this drag
                      if (!lastPos) {
                        // First movement - store current positions for icon and drawings
                        lastPositionsRef.current.set(item.id, { x: currentItem.x, y: currentItem.y });
                        
                        if (selectedDrawingIds.length > 0) {
                          const shapeIds = selectedDrawingIds.filter(d => d.type === 'shape').map(d => d.id);
                          const pathIds = selectedDrawingIds.filter(d => d.type === 'path').map(d => d.id);
                          
                          shapeIds.forEach(id => {
                            const shape = drawingShapes.find(s => s.id === id);
                            if (shape) {
                              drawingLastPositionsRef.current.set(id, { x: shape.x, y: shape.y });
                            }
                          });
                          
                          pathIds.forEach(id => {
                            const path = drawingPaths.find(p => p.id === id);
                            if (path) {
                              drawingLastPositionsRef.current.set(id, { points: path.points.map(pt => ({ ...pt })) });
                            }
                          });
                        }
                      }
                      
                      // Calculate incremental delta from last frame
                      const prevX = lastPos?.x ?? currentItem.x;
                      const prevY = lastPos?.y ?? currentItem.y;
                      
                      const newX = updates.x ?? currentItem.x;
                      const newY = updates.y ?? currentItem.y;
                      
                      const deltaX = newX - prevX;
                      const deltaY = newY - prevY;
                      
                      // Batch all updates together for smooth movement
                      if (deltaX !== 0 || deltaY !== 0) {
                        // Update the dragged item
                        onItemUpdate(item.id, updates);
                        
                        // Move OTHER selected icons (not the one being dragged)
                        if (hasMultipleIcons) {
                          const otherSelectedIds = selectedItemIds.filter(id => id !== item.id);
                          if (otherSelectedIds.length > 0) {
                            onMultiItemUpdate(otherSelectedIds, { 
                              x: deltaX, 
                              y: deltaY 
                            });
                          }
                        }
                        
                        // Move any selected drawings (mixed selection) - apply incremental delta
                        if (selectedDrawingIds.length > 0) {
                          const shapeIds = selectedDrawingIds.filter(d => d.type === 'shape').map(d => d.id);
                          const pathIds = selectedDrawingIds.filter(d => d.type === 'path').map(d => d.id);
                          
                          if (shapeIds.length > 0) {
                            const updatedShapes = drawingShapes.map(s => {
                              if (shapeIds.includes(s.id)) {
                                const lastPos = drawingLastPositionsRef.current.get(s.id);
                                const newX = (lastPos?.x ?? s.x) + deltaX;
                                const newY = (lastPos?.y ?? s.y) + deltaY;
                                drawingLastPositionsRef.current.set(s.id, { x: newX, y: newY });
                                return { ...s, x: newX, y: newY };
                              }
                              return s;
                            });
                            onDrawingShapesUpdate(updatedShapes);
                          }
                          
                          if (pathIds.length > 0) {
                            const updatedPaths = drawingPaths.map(p => {
                              if (pathIds.includes(p.id)) {
                                const lastPos = drawingLastPositionsRef.current.get(p.id);
                                const newPoints = (lastPos?.points ?? p.points).map(pt => ({ 
                                  x: pt.x + deltaX, 
                                  y: pt.y + deltaY 
                                }));
                                drawingLastPositionsRef.current.set(p.id, { points: newPoints });
                                return { ...p, points: newPoints };
                              }
                              return p;
                            });
                            onDrawingPathsUpdate(updatedPaths);
                          }
                        }
                        
                        // Update last position for next frame
                        lastPositionsRef.current.set(item.id, { x: newX, y: newY });
                      } else {
                        // No delta, just update the dragged item
                        onItemUpdate(item.id, updates);
                      }
                    }
                  } else {
                    // Not multi-dragging, just update the single item
                    onItemUpdate(item.id, updates);
                    // Clear last position when not multi-dragging
                    lastPositionsRef.current.delete(item.id);
                    // Clear drawing position refs
                    drawingBasePositionsRef.current.clear();
                    drawingLastPositionsRef.current.clear();
                  }
                }}
                onDelete={() => onItemDelete(item.id)}
                disabled={tool === 'pan' || isLocked}
              />
            );
          })}
          </div>
          
          {/* Drawing Paths */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{
              width: imageWidth,
              height: imageHeight,
            }}
          >
            {drawingPaths
              .filter(path => {
                // Filter by layer visibility
                const layer = layers.find(l => l.id === path.layerId);
                return !layer || layer.visible;
              })
              .map(path => {
              if (path.points.length < 2) return null;
              
              const pathData = path.points
                .map((point, index) => {
                  if (index === 0) {
                    return `M ${point.x} ${point.y}`;
                  }
                  return `L ${point.x} ${point.y}`;
                })
                .join(' ');
              
              const isSelected = selectedDrawingId === path.id && selectedDrawingType === 'path';
              const isMultiSelected = selectedDrawingIds.some(d => d.id === path.id && d.type === 'path');
              
              return (
                <g key={path.id}>
                  <path
                    d={pathData}
                    stroke={path.color}
                    strokeWidth={path.width}
                    strokeOpacity={path.opacity}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  {(isSelected || isMultiSelected) && (
                    <path
                      d={pathData}
                      stroke="#3b82f6"
                      strokeWidth={path.width + 4}
                      strokeOpacity={0.3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  )}
                </g>
              );
            })}
            
            {/* Drawing Shapes */}
            {drawingShapes
              .filter(shape => {
                // Filter by layer visibility
                const layer = layers.find(l => l.id === shape.layerId);
                return !layer || layer.visible;
              })
              .map(shape => {
              const isSelected = selectedDrawingId === shape.id && selectedDrawingType === 'shape';
              const isMultiSelected = selectedDrawingIds.some(d => d.id === shape.id && d.type === 'shape');
              const cx = shape.x + shape.width / 2;
              const cy = shape.y + shape.height / 2;
              const rotation = shape.rotation || 0;
              
              if (shape.type === 'circle') {
                const rx = shape.width / 2;
                const ry = shape.height / 2;
                return (
                  <g key={shape.id}>
                    <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>
                      <ellipse
                        cx={cx}
                        cy={cy}
                        rx={rx}
                        ry={ry}
                        stroke={shape.color}
                        strokeWidth={shape.strokeWidth}
                        strokeOpacity={shape.opacity}
                        fill={shape.filled ? (shape.fillColor || shape.color) : 'none'}
                        fillOpacity={shape.filled ? (shape.fillOpacity ?? shape.opacity * 0.5) : 0}
                      />
                      {(isSelected || isMultiSelected) && (
                        <ellipse
                          cx={cx}
                          cy={cy}
                          rx={rx + 5}
                          ry={ry + 5}
                          stroke="#3b82f6"
                          strokeWidth={2}
                          strokeDasharray="5,5"
                          fill="none"
                        />
                      )}
                    </g>
                  </g>
                );
              } else if (shape.type === 'rectangle') {
                return (
                  <g key={shape.id}>
                    <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>
                      <rect
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        stroke={shape.color}
                        strokeWidth={shape.strokeWidth}
                        strokeOpacity={shape.opacity}
                        fill={shape.filled ? (shape.fillColor || shape.color) : 'none'}
                        fillOpacity={shape.filled ? (shape.fillOpacity ?? shape.opacity * 0.5) : 0}
                      />
                      {(isSelected || isMultiSelected) && (
                        <rect
                          x={shape.x - 5}
                          y={shape.y - 5}
                          width={shape.width + 10}
                          height={shape.height + 10}
                          stroke="#3b82f6"
                          strokeWidth={2}
                          strokeDasharray="5,5"
                          fill="none"
                        />
                      )}
                    </g>
                  </g>
                );
              } else if (shape.type === 'triangle') {
                const x1 = shape.x + shape.width / 2;
                const y1 = shape.y;
                const x2 = shape.x;
                const y2 = shape.y + shape.height;
                const x3 = shape.x + shape.width;
                const y3 = shape.y + shape.height;
                return (
                  <g key={shape.id}>
                    <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>
                      <polygon
                        points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
                        stroke={shape.color}
                        strokeWidth={shape.strokeWidth}
                        strokeOpacity={shape.opacity}
                        fill={shape.filled ? (shape.fillColor || shape.color) : 'none'}
                        fillOpacity={shape.filled ? (shape.fillOpacity ?? shape.opacity * 0.5) : 0}
                      />
                      {(isSelected || isMultiSelected) && (
                        <polygon
                          points={`${x1},${y1 - 5} ${x2 - 5},${y2 + 5} ${x3 + 5},${y3 + 5}`}
                          stroke="#3b82f6"
                          strokeWidth={2}
                          strokeDasharray="5,5"
                          fill="none"
                        />
                      )}
                    </g>
                  </g>
                );
              }
              return null;
            })}
            
            {/* Rotation handle for selected shape */}
            {selectedDrawingType === 'shape' && selectedDrawingId && (() => {
              const shape = drawingShapes.find(s => s.id === selectedDrawingId);
              if (!shape) return null;
              
              const cx = shape.x + shape.width / 2;
              const cy = shape.y + shape.height / 2;
              const rotation = shape.rotation || 0;
              const handleDistance = Math.max(shape.width, shape.height) / 2 + 30;
              
              // Calculate handle position (rotated)
              const angleRad = (rotation - 90) * Math.PI / 180; // -90 to position handle at top
              const handleX = cx + handleDistance * Math.cos(angleRad);
              const handleY = cy + handleDistance * Math.sin(angleRad);
              
              return (
                <g className="pointer-events-auto">
                  <line
                    x1={cx}
                    y1={cy}
                    x2={handleX}
                    y2={handleY}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="3,3"
                  />
                  <circle
                    cx={handleX}
                    cy={handleY}
                    r={8}
                    fill="white"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    style={{ cursor: 'grab' }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setIsRotating(true);
                    }}
                  />
                </g>
              );
            })()}
            
            {/* Current drawing shape preview */}
            {isDrawing && shapeStart && shapeEnd && (tool === 'circle' || tool === 'rectangle' || tool === 'triangle') && (
              <>
                {tool === 'circle' && (() => {
                  const x = Math.min(shapeStart.x, shapeEnd.x);
                  const y = Math.min(shapeStart.y, shapeEnd.y);
                  const width = Math.abs(shapeEnd.x - shapeStart.x);
                  const height = Math.abs(shapeEnd.y - shapeStart.y);
                  const cx = x + width / 2;
                  const cy = y + height / 2;
                  const rx = width / 2;
                  const ry = height / 2;
                  return (
                    <ellipse
                      cx={cx}
                      cy={cy}
                      rx={rx}
                      ry={ry}
                      stroke={drawingColor}
                      strokeWidth={drawingWidth}
                      strokeOpacity={drawingOpacity}
                      strokeDasharray="5,5"
                      fill={drawingFilled ? drawingColor : 'none'}
                      fillOpacity={drawingFilled ? drawingOpacity * 0.5 : 0}
                    />
                  );
                })()}
                {tool === 'rectangle' && (() => {
                  const x = Math.min(shapeStart.x, shapeEnd.x);
                  const y = Math.min(shapeStart.y, shapeEnd.y);
                  const width = Math.abs(shapeEnd.x - shapeStart.x);
                  const height = Math.abs(shapeEnd.y - shapeStart.y);
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      stroke={drawingColor}
                      strokeWidth={drawingWidth}
                      strokeOpacity={drawingOpacity}
                      strokeDasharray="5,5"
                      fill={drawingFilled ? drawingColor : 'none'}
                      fillOpacity={drawingFilled ? drawingOpacity * 0.5 : 0}
                    />
                  );
                })()}
                {tool === 'triangle' && (() => {
                  const x = Math.min(shapeStart.x, shapeEnd.x);
                  const y = Math.min(shapeStart.y, shapeEnd.y);
                  const width = Math.abs(shapeEnd.x - shapeStart.x);
                  const height = Math.abs(shapeEnd.y - shapeStart.y);
                  const x1 = x + width / 2;
                  const y1 = y;
                  const x2 = x;
                  const y2 = y + height;
                  const x3 = x + width;
                  const y3 = y + height;
                  return (
                    <polygon
                      points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
                      stroke={drawingColor}
                      strokeWidth={drawingWidth}
                      strokeOpacity={drawingOpacity}
                      strokeDasharray="5,5"
                      fill={drawingFilled ? drawingColor : 'none'}
                      fillOpacity={drawingFilled ? drawingOpacity * 0.5 : 0}
                    />
                  );
                })()}
              </>
            )}
            
            {/* Current drawing path */}
            {isDrawing && currentPath.length > 1 && (
              <path
                d={currentPath
                  .map((point, index) => {
                    if (index === 0) {
                      return `M ${point.x} ${point.y}`;
                    }
                    return `L ${point.x} ${point.y}`;
                  })
                  .join(' ')}
                stroke={drawingColor}
                strokeWidth={drawingWidth}
                strokeOpacity={drawingOpacity}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </svg>
          
          {/* Selection Box */}
          {isSelecting && (
            <div
              className="absolute border-2 border-blue-500 bg-blue-200/20 pointer-events-none"
              style={{
                left: Math.min(selectionStart.x, selectionEnd.x),
                top: Math.min(selectionStart.y, selectionEnd.y),
                width: Math.abs(selectionEnd.x - selectionStart.x),
                height: Math.abs(selectionEnd.y - selectionStart.y),
              }}
            />
          )}
        </div>
      </div>
      
      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 px-3 py-2 rounded shadow text-sm">
        {Math.round(transform.scale * 100)}%
      </div>
    </div>
  );
}
