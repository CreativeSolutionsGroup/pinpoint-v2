"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapIcon as MapIconComponent } from "./map-icon";
import { MapText as MapTextComponent } from "./map-text";
import { MapConnector } from "./map-connector";
import { MapIcon as MapIconType, IconType, Connector, Layer, Drawing, DrawingTool, Position, TextElement } from "./types";
import { 
  ZoomIn, ZoomOut, Maximize2, Link, Undo, Redo, Grid3x3, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { KeyboardShortcutsPanel } from "./keyboard-shortcuts-panel";
import { PrintDialog } from "./print-dialog";

interface MapCanvasProps {
  mapImageUrl: string;
  icons: MapIconType[];
  texts?: TextElement[];
  connectors?: Connector[];
  layers?: Layer[];
  onIconsChange: (icons: MapIconType[]) => void;
  onTextsChange?: (texts: TextElement[]) => void;
  onConnectorsChange?: (connectors: Connector[]) => void;
  onIconMoveComplete?: (icons: MapIconType[]) => void;
  onTextMoveComplete?: (texts: TextElement[]) => void;
  onConnectorMoveComplete?: (connectors: Connector[]) => void;
  onAddIcon?: (iconType: IconType, position: { x: number; y: number }) => void;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onTextSelectionChange?: (selectedTextId: string | null) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  // Drawing props
  drawings?: Drawing[];
  isDrawingMode?: boolean;
  selectedDrawingTool?: DrawingTool;
  drawingColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  enableFill?: boolean;
  onDrawingAdd?: (drawing: Drawing) => void;
  onDrawingsChange?: (drawings: Drawing[]) => void;
}

export function MapCanvas({
  mapImageUrl,
  icons,
  connectors = [],
  layers = [],
  onIconsChange,
  onConnectorsChange,
  onIconMoveComplete,
  onConnectorMoveComplete,
  onAddIcon,
  onSelectionChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  drawings = [],
  isDrawingMode = false,
  selectedDrawingTool = "pen",
  drawingColor = "#000000",
  strokeWidth = 2,
  fillColor = "#ffffff",
  enableFill = false,
  onDrawingAdd,
  onDrawingsChange,
  texts = [],
  onTextsChange,
  onTextMoveComplete,
  onTextSelectionChange,
}: MapCanvasProps) {
  // Filter icons based on layer visibility and sort by layer order
  const visibleLayers = new Set(layers.filter(l => l.visible).map(l => l.id));
  
  // Create a map of layer ID to its index for sorting
  const layerOrderMap = new Map(layers.map((layer, index) => [layer.id, index]));
  
  // Helper function to calculate distance from point to line segment
  const pointToLineDistance = (point: Position, lineStart: Position, lineEnd: Position): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const visibleIcons = icons
    .filter(icon => {
      const iconLayer = icon.layer || "default";
      return visibleLayers.has(iconLayer) || visibleLayers.size === 0;
    })
    .sort((a, b) => {
      // Sort by layer order - lower index = rendered first (bottom layer)
      const layerA = a.layer || "default";
      const layerB = b.layer || "default";
      const orderA = layerOrderMap.get(layerA) ?? -1;
      const orderB = layerOrderMap.get(layerB) ?? -1;
      return orderA - orderB;
    });

  const visibleTexts = texts
    .filter(text => {
      const textLayer = text.layer || "default";
      return visibleLayers.has(textLayer) || visibleLayers.size === 0;
    })
    .sort((a, b) => {
      // Sort by layer order - lower index = rendered first (bottom layer)
      const layerA = a.layer || "default";
      const layerB = b.layer || "default";
      const orderA = layerOrderMap.get(layerA) ?? -1;
      const orderB = layerOrderMap.get(layerB) ?? -1;
      return orderA - orderB;
    });
  
  // Check if icon's layer is locked
  const lockedLayers = new Set(layers.filter(l => l.locked).map(l => l.id));
  const isIconLocked = (icon: MapIconType) => {
    const iconLayer = icon.layer || "default";
    return lockedLayers.has(iconLayer);
  };
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectStartIconId, setConnectStartIconId] = useState<string | null>(null);
  const [copiedIcon, setCopiedIcon] = useState<MapIconType | null>(null);
  const [copiedIcons, setCopiedIcons] = useState<MapIconType[]>([]);
  const [selectedIconIds, setSelectedIconIds] = useState<Set<string>>(new Set());
  const [selectedTextIds, setSelectedTextIds] = useState<Set<string>>(new Set());
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 }); // Track mouse position as percentage
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const gridSize = 2.5; // 2.5% grid spacing (smaller, more precise grid)
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  
  // Drawing state
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [drawingStart, setDrawingStart] = useState<Position | null>(null);
  const [drawingCurrent, setDrawingCurrent] = useState<Position | null>(null);
  const [drawingPath, setDrawingPath] = useState<Position[]>([]);
  const [eraserPath, setEraserPath] = useState<Position[]>([]);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selectedIconIds);
  }, [selectedIconIds, onSelectionChange]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePanStart = (e: React.MouseEvent) => {
    // Prevent panning if text is being dragged
    if (isDraggingText) {
      return;
    }
    
    // If in drawing mode, start drawing instead of panning
    if (isDrawingMode && e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left - pan.x) / zoom / rect.width) * 100;
      const y = ((e.clientY - rect.top - pan.y) / zoom / rect.height) * 100;
      
      console.log('Drawing started:', { x, y, tool: selectedDrawingTool });
      
      setDrawingStart({ x, y });
      setDrawingCurrent({ x, y });
      
      if (selectedDrawingTool === "pen") {
        setDrawingPath([{ x, y }]);
      } else if (selectedDrawingTool === "eraser" || selectedDrawingTool === "partial-eraser") {
        setEraserPath([{ x, y }]);
      }
      
      setCurrentDrawing({
        id: `drawing-${Date.now()}`,
        tool: selectedDrawingTool,
        color: drawingColor,
        strokeWidth,
        fill: enableFill ? fillColor : undefined,
        opacity: 1,
      });
      return;
    }
    
    // Allow panning with left click (unless clicking on an icon or text), middle mouse, or Shift + left click
    if (e.button === 0 || e.button === 1) {
      // Only start panning if clicking on the background (not an icon or text)
      const target = e.target as HTMLElement;
      const clickedOnIcon = target.closest('.map-icon-container');
      const clickedOnText = target.closest('.map-text-container');
      
      // Start drag selection with Ctrl/Cmd key (not shift - that's for pan)
      if (!clickedOnIcon && !clickedOnText && e.button === 0 && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setIsSelecting(true);
        setSelectionStart({ x, y });
        setSelectionEnd({ x, y });
        return; // Important: return early to prevent panning
      }
      
      // Clear selection when clicking on empty space (without Ctrl)
      if (!clickedOnIcon && !clickedOnText && e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        setSelectedIconIds(new Set());
        setSelectedTextIds(new Set());
        onTextSelectionChange?.(null);
      }
      
      // Only start panning if NOT selecting and NOT clicking on text
      if (((!clickedOnIcon && !clickedOnText) || e.button === 1 || e.shiftKey) && !(e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  };

  const handlePanMove = useCallback((e: MouseEvent) => {
    // Handle drawing mode
    if (isDrawingMode && currentDrawing && drawingStart && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left - pan.x) / zoom / rect.width) * 100;
      const y = ((e.clientY - rect.top - pan.y) / zoom / rect.height) * 100;
      
      setDrawingCurrent({ x, y });
      
      if (selectedDrawingTool === "pen") {
        setDrawingPath(prev => [...prev, { x, y }]);
      } else if (selectedDrawingTool === "eraser" || selectedDrawingTool === "partial-eraser") {
        setEraserPath(prev => [...prev, { x, y }]);
        
        const eraserRadius = strokeWidth * 2;
        
        if (selectedDrawingTool === "eraser") {
          // Full eraser - remove entire drawings
          const drawingsToRemove: string[] = [];
          
          drawings.forEach(drawing => {
            let shouldErase = false;
            
            if (drawing.path && drawing.path.points) {
              shouldErase = drawing.path.points.some(point => {
                const dist = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
                return dist < eraserRadius;
              });
            } else if (drawing.startPoint && drawing.endPoint) {
              const distToLine = pointToLineDistance({ x, y }, drawing.startPoint, drawing.endPoint);
              shouldErase = distToLine < eraserRadius;
            } else if (drawing.x !== undefined && drawing.y !== undefined) {
              if (drawing.tool === "rectangle" && drawing.width && drawing.height) {
                const inX = x >= drawing.x && x <= drawing.x + drawing.width;
                const inY = y >= drawing.y && y <= drawing.y + drawing.height;
                shouldErase = inX && inY;
              } else if (drawing.tool === "circle" && drawing.radiusX && drawing.radiusY) {
                const dx = (x - drawing.x) / drawing.radiusX;
                const dy = (y - drawing.y) / drawing.radiusY;
                shouldErase = (dx * dx + dy * dy) <= 1;
              }
            }
            
            if (shouldErase && !drawingsToRemove.includes(drawing.id)) {
              drawingsToRemove.push(drawing.id);
            }
          });
          
          if (drawingsToRemove.length > 0 && onDrawingsChange) {
            const updatedDrawings = drawings.filter(d => !drawingsToRemove.includes(d.id));
            onDrawingsChange(updatedDrawings);
          }
        } else {
          // Partial eraser - split pen strokes only
          const updatedDrawings = drawings.map(drawing => {
            if (drawing.tool === "pen" && drawing.path && drawing.path.points) {
              // Remove points within eraser radius
              const filteredPoints = drawing.path.points.filter(point => {
                const dist = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
                return dist >= eraserRadius;
              });
              
              // If we removed some points but not all, update the drawing
              if (filteredPoints.length > 0 && filteredPoints.length < drawing.path.points.length) {
                return { ...drawing, path: { points: filteredPoints } };
              } else if (filteredPoints.length === 0) {
                // Mark for deletion by returning null
                return null;
              }
            }
            return drawing;
          }).filter((d): d is Drawing => d !== null);
          
          if (updatedDrawings.length !== drawings.length && onDrawingsChange) {
            onDrawingsChange(updatedDrawings);
          }
        }
      }
      return;
    }
    
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (isSelecting && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const selX = e.clientX - rect.left;
      const selY = e.clientY - rect.top;
      setSelectionEnd({ x: selX, y: selY });
    }
  }, [isPanning, panStart, isSelecting, isDrawingMode, currentDrawing, drawingStart, selectedDrawingTool, containerRef, pan, zoom, drawings, onDrawingsChange, strokeWidth]);

  const handlePanEnd = useCallback(() => {
    // Handle eraser tools - clean up after erasing
    if (isDrawingMode && (selectedDrawingTool === "eraser" || selectedDrawingTool === "partial-eraser")) {
      // Reset eraser state
      setCurrentDrawing(null);
      setDrawingStart(null);
      setDrawingCurrent(null);
      setDrawingPath([]);
      setEraserPath([]);
      return;
    }
    
    // Finalize drawing
    if (isDrawingMode && currentDrawing && drawingStart && drawingCurrent && onDrawingAdd) {
      console.log('Drawing ended:', { drawingStart, drawingCurrent, tool: selectedDrawingTool });
      const finalDrawing: Drawing = { ...currentDrawing };
      
      if (selectedDrawingTool === "pen" && drawingPath.length > 1) {
        finalDrawing.path = { points: drawingPath };
      } else if (selectedDrawingTool === "line") {
        finalDrawing.startPoint = drawingStart;
        finalDrawing.endPoint = drawingCurrent;
      } else if (selectedDrawingTool === "rectangle") {
        finalDrawing.x = Math.min(drawingStart.x, drawingCurrent.x);
        finalDrawing.y = Math.min(drawingStart.y, drawingCurrent.y);
        finalDrawing.width = Math.abs(drawingCurrent.x - drawingStart.x);
        finalDrawing.height = Math.abs(drawingCurrent.y - drawingStart.y);
      } else if (selectedDrawingTool === "circle") {
        finalDrawing.x = drawingStart.x;
        finalDrawing.y = drawingStart.y;
        // Use separate radii for x and y to maintain circular appearance
        finalDrawing.radiusX = Math.abs(drawingCurrent.x - drawingStart.x);
        finalDrawing.radiusY = Math.abs(drawingCurrent.y - drawingStart.y);
      } else if (selectedDrawingTool === "arrow") {
        finalDrawing.startPoint = drawingStart;
        finalDrawing.endPoint = drawingCurrent;
      }
      
      // Only add drawing if it has some size (not just a click)
      const hasSize = selectedDrawingTool === "pen" 
        ? drawingPath.length > 1
        : drawingStart && drawingCurrent && (
            Math.abs(drawingCurrent.x - drawingStart.x) > 0.5 || 
            Math.abs(drawingCurrent.y - drawingStart.y) > 0.5
          );
      
      if (hasSize) {
        console.log('✅ Adding drawing:', finalDrawing);
        onDrawingAdd(finalDrawing);
        toast.success("Drawing added");
      } else {
        console.log('❌ Drawing too small, not added');
      }
      
      // Reset drawing state
      setCurrentDrawing(null);
      setDrawingStart(null);
      setDrawingCurrent(null);
      setDrawingPath([]);
      setEraserPath([]);
      return;
    }
    
    setIsPanning(false);
    
    // Finalize selection
    if (isSelecting) {
      setIsSelecting(false);
      
      // Calculate selection bounds in viewport coordinates
      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);
      
      // Find icons within selection bounds
      const selected = new Set<string>();
      icons.forEach(icon => {
        // Convert icon position (percentage) to viewport pixels relative to container
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Icon position formula: (percentage / 100) * canvas_width * zoom + pan
        // Canvas is the size of the container
        const iconX = (icon.position.x / 100) * rect.width * zoom + pan.x;
        const iconY = (icon.position.y / 100) * rect.height * zoom + pan.y;
        
        if (iconX >= minX && iconX <= maxX && iconY >= minY && iconY <= maxY) {
          selected.add(icon.id);
        }
      });
      
      setSelectedIconIds(selected);
      toast.success(`${selected.size} icon${selected.size !== 1 ? 's' : ''} selected`);
    }
  }, [isSelecting, selectionStart, selectionEnd, icons, zoom, pan, isDrawingMode, currentDrawing, drawingStart, drawingCurrent, onDrawingAdd, selectedDrawingTool, drawingPath]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    // Convert mouse position from viewport coordinates to canvas percentage
    // Account for pan and zoom transformations
    const x = (((e.clientX - rect.left) - pan.x) / zoom / rect.width) * 100;
    const y = (((e.clientY - rect.top) - pan.y) / zoom / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const container = canvasRef.current.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate the point under the mouse in the canvas coordinate system
    const pointX = (mouseX - pan.x) / zoom;
    const pointY = (mouseY - pan.y) / zoom;
    
    // Update zoom
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
    
    // Calculate new pan to keep the mouse point in the same position
    const newPan = {
      x: mouseX - pointX * newZoom,
      y: mouseY - pointY * newZoom,
    };
    
    setZoom(newZoom);
    setPan(newPan);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!containerRef.current || !onAddIcon) return;

    try {
      const iconType: IconType = JSON.parse(e.dataTransfer.getData("application/json"));
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate position accounting for zoom and pan
      const x = ((e.clientX - rect.left - pan.x) / zoom / rect.width) * 100;
      const y = ((e.clientY - rect.top - pan.y) / zoom / rect.height) * 100;

      // Clamp position
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      onAddIcon(iconType, { x: clampedX, y: clampedY });
    } catch (error) {
      console.error("Failed to parse dropped icon data:", error);
    }
  };

    // Helper function to snap position to grid
  const snapPosition = (position: { x: number; y: number }) => {
    if (!snapToGrid) return position;
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
  };

  const handleIconDragStart = (id: string) => {
    // Store initial positions for all selected icons when drag starts
    if (selectedIconIds.has(id) && selectedIconIds.size > 1) {
      // Store positions for all selected icons
      const positions = new Map<string, { x: number; y: number }>();
      icons.forEach(icon => {
        if (selectedIconIds.has(icon.id)) {
          positions.set(icon.id, { x: icon.position.x, y: icon.position.y });
        }
      });
      dragStartPositions.current = positions;
    } else {
      // Store position for single icon
      const icon = icons.find(i => i.id === id);
      if (icon) {
        dragStartPositions.current = new Map([[id, { x: icon.position.x, y: icon.position.y }]]);
      }
    }
  };

  const handleIconMove = (id: string, position: { x: number; y: number }) => {
    // Snap position during drag if enabled
    const targetPosition = snapToGrid ? snapPosition(position) : position;
    
    // If the icon being moved is part of a selection, move all selected icons
    if (selectedIconIds.has(id) && selectedIconIds.size > 1) {
      const startPos = dragStartPositions.current.get(id);
      if (!startPos) return;
      
      // Calculate the delta from the dragged icon's start position
      const deltaX = targetPosition.x - startPos.x;
      const deltaY = targetPosition.y - startPos.y;
      
      // Move all selected icons by the same delta
      const updatedIcons = icons.map((icon) => {
        if (selectedIconIds.has(icon.id)) {
          const iconStartPos = dragStartPositions.current.get(icon.id);
          if (iconStartPos) {
            const newPos = {
              x: Math.max(0, Math.min(100, iconStartPos.x + deltaX)),
              y: Math.max(0, Math.min(100, iconStartPos.y + deltaY)),
            };
            return {
              ...icon,
              position: snapToGrid ? snapPosition(newPos) : newPos
            };
          }
        }
        return icon;
      });
      onIconsChange(updatedIcons);
    } else {
      // Single icon movement
      const updatedIcons = icons.map((icon) =>
        icon.id === id ? { ...icon, position: targetPosition } : icon
      );
      onIconsChange(updatedIcons);
    }
  };

  const handleIconMoveComplete = (id: string, position: { x: number; y: number }) => {
    // Snap to grid if enabled
    const snappedPosition = snapPosition(position);
    
    // If the icon being moved is part of a selection, complete move for all selected icons
    if (selectedIconIds.has(id) && selectedIconIds.size > 1) {
      const startPos = dragStartPositions.current.get(id);
      if (!startPos) return;
      
      // Calculate the delta from the dragged icon's start position (using snapped position)
      const deltaX = snappedPosition.x - startPos.x;
      const deltaY = snappedPosition.y - startPos.y;
      
      // Move all selected icons by the same delta
      const updatedIcons = icons.map((icon) => {
        if (selectedIconIds.has(icon.id)) {
          const iconStartPos = dragStartPositions.current.get(icon.id);
          if (iconStartPos) {
            const newPos = {
              x: Math.max(0, Math.min(100, iconStartPos.x + deltaX)),
              y: Math.max(0, Math.min(100, iconStartPos.y + deltaY)),
            };
            return {
              ...icon,
              position: snapPosition(newPos)
            };
          }
        }
        return icon;
      });
      onIconMoveComplete?.(updatedIcons);
      dragStartPositions.current.clear(); // Clear after move complete
    } else {
      // Single icon movement
      const updatedIcons = icons.map((icon) =>
        icon.id === id ? { ...icon, position: snappedPosition } : icon
      );
      onIconMoveComplete?.(updatedIcons);
      dragStartPositions.current.clear(); // Clear after move complete
    }
  };

  const handleIconClick = (iconId: string) => {
    if (isConnectMode) {
      // Connect mode logic
      if (!connectStartIconId) {
        // First icon selected - start connection
        setConnectStartIconId(iconId);
      } else if (connectStartIconId === iconId) {
        // Clicked the same icon - cancel
        setConnectStartIconId(null);
      } else {
        // Check if a connector already exists between these two icons (in either direction)
        const connectorExists = connectors.some(
          (conn) =>
            (conn.startIconId === connectStartIconId && conn.endIconId === iconId) ||
            (conn.startIconId === iconId && conn.endIconId === connectStartIconId)
        );

        if (connectorExists) {
          // Show notification that connector already exists
          toast.info("Connector Already Exists", {
            description: "A connector already exists between these two icons."
          });
          // Reset and exit connect mode
          setConnectStartIconId(null);
          setIsConnectMode(false);
          return;
        }

        // Second icon selected - create connection
        const newConnector: Connector = {
          id: `connector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startIconId: connectStartIconId,
          endIconId: iconId,
          color: "#64748b",
          width: 2,
          style: "solid",
        };

        if (onConnectorsChange) {
          const updatedConnectors = [...connectors, newConnector];
          onConnectorsChange(updatedConnectors);
          onConnectorMoveComplete?.(updatedConnectors);
        }

        // Reset connection state
        setConnectStartIconId(null);
        setIsConnectMode(false);
      }
    } else {
      // Single icon selection mode
      // Toggle selection - if already selected, deselect it; otherwise select only this icon
      if (selectedIconIds.has(iconId)) {
        setSelectedIconIds(new Set());
      } else {
        setSelectedIconIds(new Set([iconId]));
      }
    }
  };

  const handleConnectorUpdate = (id: string, updates: Partial<Connector>) => {
    if (!onConnectorsChange) return;

    const updatedConnectors = connectors.map((conn) =>
      conn.id === id ? { ...conn, ...updates } : conn
    );
    onConnectorsChange(updatedConnectors);
    onConnectorMoveComplete?.(updatedConnectors);
  };

  // Text handlers
  const handleTextMove = (id: string, position: { x: number; y: number }) => {
    if (!onTextsChange) return;
    const updatedTexts = texts.map((text) =>
      text.id === id ? { ...text, position } : text
    );
    onTextsChange(updatedTexts);
  };

  const handleTextMoveComplete = (id: string, position: { x: number; y: number }) => {
    if (!onTextMoveComplete) return;
    const updatedTexts = texts.map((text) =>
      text.id === id ? { ...text, position } : text
    );
    onTextMoveComplete(updatedTexts);
    // Reset text dragging flag
    setIsDraggingText(false);
  };

  const handleTextClick = (textId: string) => {
    // Text selection logic - similar to icons
    if (selectedTextIds.has(textId)) {
      setSelectedTextIds(new Set());
      onTextSelectionChange?.(null);
    } else {
      setSelectedTextIds(new Set([textId]));
      onTextSelectionChange?.(textId);
    }
  };

  const handleTextDragStart = () => {
    setIsDraggingText(true);
  };

  const handleConnectorDelete = (id: string) => {
    if (!onConnectorsChange) return;

    const updatedConnectors = connectors.filter((conn) => conn.id !== id);
    onConnectorsChange(updatedConnectors);
    onConnectorMoveComplete?.(updatedConnectors);
  };

  const toggleConnectMode = () => {
    setIsConnectMode(!isConnectMode);
    setConnectStartIconId(null);
  };

  const handlePaste = useCallback(() => {
    // Handle multi-icon paste
    if (copiedIcons.length > 0) {
      // Calculate centroid of copied icons
      const centroidX = copiedIcons.reduce((sum, icon) => sum + icon.position.x, 0) / copiedIcons.length;
      const centroidY = copiedIcons.reduce((sum, icon) => sum + icon.position.y, 0) / copiedIcons.length;
      
      // Create new icons with positions relative to mouse position
      const newIcons = copiedIcons.map(icon => {
        const offsetX = icon.position.x - centroidX;
        const offsetY = icon.position.y - centroidY;
        
        return {
          ...icon,
          id: `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          position: {
            x: Math.max(0, Math.min(mousePosition.x + offsetX, 100)),
            y: Math.max(0, Math.min(mousePosition.y + offsetY, 100)),
          },
        };
      });
      
      const updatedIcons = [...icons, ...newIcons];
      onIconsChange(updatedIcons);
      onIconMoveComplete?.(updatedIcons);
      toast.success(`${newIcons.length} icon${newIcons.length !== 1 ? 's' : ''} pasted`);
      
      // Clear selection and select newly pasted icons
      setSelectedIconIds(new Set(newIcons.map(icon => icon.id)));
      return;
    }
    
    // Handle single icon paste (legacy)
    if (!copiedIcon) return;

    const newIcon: MapIconType = {
      ...copiedIcon,
      id: `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: Math.max(0, Math.min(mousePosition.x, 100)),
        y: Math.max(0, Math.min(mousePosition.y, 100)),
      },
    };
    const updatedIcons = [...icons, newIcon];
    onIconsChange(updatedIcons);
    onIconMoveComplete?.(updatedIcons);
    toast.success("Icon Pasted");
  }, [copiedIcons, copiedIcon, icons, mousePosition, onIconsChange, onIconMoveComplete]);

  // Handle keyboard shortcuts
  const handleCopy = useCallback(() => {
    if (selectedIconIds.size === 0) return;
    
    const selectedIcons = icons.filter(icon => selectedIconIds.has(icon.id));
    setCopiedIcons(selectedIcons);
    toast.success(`${selectedIcons.length} icon${selectedIcons.length !== 1 ? 's' : ''} copied`);
  }, [selectedIconIds, icons]);

  const handleDeleteSelected = useCallback(() => {
    let deletedCount = 0;
    
    // Delete selected icons
    if (selectedIconIds.size > 0) {
      const updatedIcons = icons.filter(icon => !selectedIconIds.has(icon.id));
      
      // Also delete any connectors attached to the deleted icons
      const updatedConnectors = connectors.filter(
        connector => !selectedIconIds.has(connector.startIconId) && !selectedIconIds.has(connector.endIconId)
      );
      
      onIconsChange(updatedIcons);
      onIconMoveComplete?.(updatedIcons); // Save to history
      
      if (onConnectorsChange && onConnectorMoveComplete) {
        onConnectorsChange(updatedConnectors);
        onConnectorMoveComplete(updatedConnectors); // Save to history
      }
      
      deletedCount = selectedIconIds.size;
      setSelectedIconIds(new Set());
      toast.success(`${deletedCount} icon${deletedCount !== 1 ? 's' : ''} deleted`);
    }
    
    // Delete selected text
    if (selectedTextIds.size > 0 && onTextsChange && onTextMoveComplete) {
      const updatedTexts = texts.filter(text => !selectedTextIds.has(text.id));
      onTextsChange(updatedTexts);
      onTextMoveComplete(updatedTexts); // Save to history
      
      deletedCount = selectedTextIds.size;
      setSelectedTextIds(new Set());
      onTextSelectionChange?.(null);
      toast.success(`${deletedCount} text item${deletedCount !== 1 ? 's' : ''} deleted`);
    }
  }, [selectedIconIds, selectedTextIds, icons, texts, connectors, onIconsChange, onIconMoveComplete, onTextsChange, onTextMoveComplete, onConnectorsChange, onConnectorMoveComplete, onTextSelectionChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses when typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Show keyboard shortcuts panel (use / instead of ? to avoid shift conflict)
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        setShowShortcuts(true);
      } else if (e.key === 'Shift' && !isConnectMode) {
        // Enter connect mode when shift is pressed
        setIsConnectMode(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        onUndo?.();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        onRedo?.();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Ignore keypresses when typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Exit connect mode when shift is released
      if (e.key === 'Shift' && isConnectMode) {
        setIsConnectMode(false);
        setConnectStartIconId(null); // Clear any in-progress connection
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleCopy, handlePaste, handleDeleteSelected, onUndo, onRedo, isConnectMode]);

  // Handle panning, selecting, and drawing with mouse
  useEffect(() => {
    if (isPanning || isSelecting || currentDrawing) {
      window.addEventListener("mousemove", handlePanMove);
      window.addEventListener("mouseup", handlePanEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handlePanMove);
      window.removeEventListener("mouseup", handlePanEnd);
    };
  }, [isPanning, isSelecting, currentDrawing, handlePanMove, handlePanEnd]);

  return (
    <div id="map-canvas-print" className="relative w-full h-full bg-muted rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
        {/* Undo/Redo Controls - Horizontal row at top */}
        {(onUndo || onRedo) && (
          <div className="flex gap-1">
            {onUndo && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo"
              >
                <Undo className="h-3.5 w-3.5" />
              </Button>
            )}
            {onRedo && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo"
              >
                <Redo className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
        {/* Main controls - Vertical stack below, aligned right */}
        <Button
          variant={isConnectMode ? "default" : "secondary"}
          size="icon"
          className="h-8 w-8"
          onClick={toggleConnectMode}
          title={isConnectMode ? "Exit Connect Mode" : "Connect Icons"}
        >
          <Link className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={handleResetView}
          title="Reset View"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowPrintDialog(true)}
          title="Print Map"
        >
          <Printer className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-2 left-2 z-10 bg-secondary px-2 py-1 rounded text-xs font-medium">
        {Math.round(zoom * 100)}%
      </div>

      {/* Grid and Alignment Controls */}
      <div className="absolute top-12 left-2 z-10 flex flex-col gap-1">
        {/* Grid Toggle */}
        <Button
          variant={showGrid ? "default" : "secondary"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid"
        >
          <Grid3x3 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant={snapToGrid ? "default" : "secondary"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setSnapToGrid(!snapToGrid)}
          title="Snap to Grid"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden relative"
        onMouseDown={handlePanStart}
        style={{ cursor: isDrawingMode ? "crosshair" : isPanning ? "grabbing" : "grab" }}
      >
        {/* Selection Box - positioned relative to viewport, not canvas */}
        {isSelecting && (
          <div
            className="absolute border-2 border-blue-400 bg-blue-400/10 pointer-events-none z-20"
            style={{
              left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
              top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
              width: `${Math.abs(selectionEnd.x - selectionStart.x)}px`,
              height: `${Math.abs(selectionEnd.y - selectionStart.y)}px`,
            }}
          />
        )}
        
        <div
          id="map-canvas"
          ref={canvasRef}
          className="relative w-full h-full"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            transition: isPanning ? "none" : "transform 0.1s ease-out",
          }}
        >
          {/* Map Image */}
          <img
            src={mapImageUrl}
            alt="Campus Map"
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />

          {/* Grid Overlay */}
          {showGrid && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern
                  id="grid-pattern"
                  width={gridSize}
                  height={gridSize}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.1"
                    className="text-muted-foreground/30"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid-pattern)" />
            </svg>
          )}

          {/* Connectors Layer - SVG overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ pointerEvents: "none" }}
          >
            <g style={{ pointerEvents: "auto" }}>
              {connectors.map((connector) => {
                const startIcon = icons.find((icon) => icon.id === connector.startIconId);
                const endIcon = icons.find((icon) => icon.id === connector.endIconId);
                return (
                  <MapConnector
                    key={connector.id}
                    connector={connector}
                    startIcon={startIcon}
                    endIcon={endIcon}
                    onUpdate={handleConnectorUpdate}
                    onDelete={handleConnectorDelete}
                  />
                );
              })}
            </g>
          </svg>

          {/* Drawings Layer - SVG overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ pointerEvents: isDrawingMode ? "auto" : "none" }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Render completed drawings */}
            {drawings.map((drawing) => {
              const fillStyle = drawing.fill && drawing.fill !== "transparent" ? drawing.fill : "none";
              const opacity = drawing.opacity ?? 1;

              if (drawing.tool === "pen" && drawing.path) {
                const pathData = drawing.path.points
                  .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`)
                  .join(" ");
                return (
                  <path
                    key={drawing.id}
                    d={pathData}
                    stroke={drawing.color}
                    strokeWidth={drawing.strokeWidth / zoom}
                    fill="none"
                    opacity={opacity}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              }

              if (drawing.tool === "line" && drawing.startPoint && drawing.endPoint) {
                return (
                  <line
                    key={drawing.id}
                    x1={drawing.startPoint.x}
                    y1={drawing.startPoint.y}
                    x2={drawing.endPoint.x}
                    y2={drawing.endPoint.y}
                    stroke={drawing.color}
                    strokeWidth={drawing.strokeWidth / zoom}
                    opacity={opacity}
                    strokeLinecap="round"
                  />
                );
              }

              if (drawing.tool === "rectangle" && drawing.x !== undefined && drawing.y !== undefined && drawing.width && drawing.height) {
                return (
                  <rect
                    key={drawing.id}
                    x={drawing.x}
                    y={drawing.y}
                    width={drawing.width}
                    height={drawing.height}
                    stroke={drawing.color}
                    strokeWidth={drawing.strokeWidth / zoom}
                    fill={fillStyle}
                    opacity={opacity}
                  />
                );
              }

              if (drawing.tool === "circle" && drawing.x !== undefined && drawing.y !== undefined) {
                // Use ellipse with separate radii to maintain circular appearance
                const rx = drawing.radiusX ?? drawing.radius ?? 0;
                const ry = drawing.radiusY ?? drawing.radius ?? 0;
                
                return (
                  <ellipse
                    key={drawing.id}
                    cx={drawing.x}
                    cy={drawing.y}
                    rx={rx}
                    ry={ry}
                    stroke={drawing.color}
                    strokeWidth={drawing.strokeWidth / zoom}
                    fill={fillStyle}
                    opacity={opacity}
                  />
                );
              }

              if (drawing.tool === "arrow" && drawing.startPoint && drawing.endPoint) {
                const dx = drawing.endPoint.x - drawing.startPoint.x;
                const dy = drawing.endPoint.y - drawing.startPoint.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                
                // Scale arrow size based on stroke width, with minimum size
                const arrowLength = Math.max(2, drawing.strokeWidth * 3);
                const arrowWidth = arrowLength * 0.7;
                
                // Shorten the line so it ends at the base of the arrowhead
                const shortenBy = arrowLength * 0.3; // Stop line before arrow tip
                const ratio = Math.max(0, (length - shortenBy) / length);
                const lineEndX = drawing.startPoint.x + dx * ratio;
                const lineEndY = drawing.startPoint.y + dy * ratio;
                
                return (
                  <g key={drawing.id} opacity={opacity}>
                    <line
                      x1={drawing.startPoint.x}
                      y1={drawing.startPoint.y}
                      x2={lineEndX}
                      y2={lineEndY}
                      stroke={drawing.color}
                      strokeWidth={drawing.strokeWidth / zoom}
                      strokeLinecap="round"
                    />
                    <polygon
                      points={`0,0 ${-arrowLength},${-arrowWidth/2} ${-arrowLength},${arrowWidth/2}`}
                      fill={drawing.color}
                      stroke={drawing.color}
                      strokeWidth={(drawing.strokeWidth * 0.3) / zoom}
                      strokeLinejoin="miter"
                      transform={`translate(${drawing.endPoint.x},${drawing.endPoint.y}) rotate(${angle * 180 / Math.PI})`}
                    />
                  </g>
                );
              }

              return null;
            })}

            {/* Render drawing in progress */}
            {currentDrawing && drawingStart && drawingCurrent && (
              <>
                {selectedDrawingTool === "pen" && drawingPath.length > 0 && (
                  <path
                    d={drawingPath.map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")}
                    stroke={drawingColor}
                    strokeWidth={strokeWidth / zoom}
                    fill="none"
                    opacity={0.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {selectedDrawingTool === "line" && (
                  <line
                    x1={drawingStart.x}
                    y1={drawingStart.y}
                    x2={drawingCurrent.x}
                    y2={drawingCurrent.y}
                    stroke={drawingColor}
                    strokeWidth={strokeWidth / zoom}
                    opacity={0.7}
                    strokeLinecap="round"
                  />
                )}
                {selectedDrawingTool === "rectangle" && (
                  <rect
                    x={Math.min(drawingStart.x, drawingCurrent.x)}
                    y={Math.min(drawingStart.y, drawingCurrent.y)}
                    width={Math.abs(drawingCurrent.x - drawingStart.x)}
                    height={Math.abs(drawingCurrent.y - drawingStart.y)}
                    stroke={drawingColor}
                    strokeWidth={strokeWidth / zoom}
                    fill={enableFill ? fillColor : "none"}
                    opacity={0.7}
                  />
                )}
                {selectedDrawingTool === "circle" && (
                  <ellipse
                    cx={drawingStart.x}
                    cy={drawingStart.y}
                    rx={Math.abs(drawingCurrent.x - drawingStart.x)}
                    ry={Math.abs(drawingCurrent.y - drawingStart.y)}
                    stroke={drawingColor}
                    strokeWidth={strokeWidth / zoom}
                    fill={enableFill ? fillColor : "none"}
                    opacity={0.7}
                  />
                )}
                {selectedDrawingTool === "arrow" && (
                  <>
                    {(() => {
                      const dx = drawingCurrent.x - drawingStart.x;
                      const dy = drawingCurrent.y - drawingStart.y;
                      const length = Math.sqrt(dx * dx + dy * dy);
                      const angle = Math.atan2(dy, dx);
                      
                      // Scale arrow size based on stroke width
                      const arrowLength = Math.max(2, strokeWidth * 3);
                      const arrowWidth = arrowLength * 0.7;
                      
                      // Shorten the line so it ends at the base of the arrowhead
                      const shortenBy = arrowLength * 0.3;
                      const ratio = Math.max(0, (length - shortenBy) / length);
                      const lineEndX = drawingStart.x + dx * ratio;
                      const lineEndY = drawingStart.y + dy * ratio;
                      
                      return (
                        <>
                          <line
                            x1={drawingStart.x}
                            y1={drawingStart.y}
                            x2={lineEndX}
                            y2={lineEndY}
                            stroke={drawingColor}
                            strokeWidth={strokeWidth / zoom}
                            opacity={0.7}
                            strokeLinecap="round"
                          />
                          <polygon
                            points={`0,0 ${-arrowLength},${-arrowWidth/2} ${-arrowLength},${arrowWidth/2}`}
                            fill={drawingColor}
                            stroke={drawingColor}
                            strokeWidth={(strokeWidth * 0.3) / zoom}
                            strokeLinejoin="miter"
                            opacity={0.7}
                            transform={`translate(${drawingCurrent.x},${drawingCurrent.y}) rotate(${angle * 180 / Math.PI})`}
                          />
                        </>
                      );
                    })()}
                  </>
                )}
                {(selectedDrawingTool === "eraser" || selectedDrawingTool === "partial-eraser") && eraserPath.length > 0 && (
                  <g>
                    {/* Eraser trail - show the path */}
                    <path
                      d={eraserPath.map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")}
                      stroke="#ff0000"
                      strokeWidth={(strokeWidth * 2) / zoom}
                      fill="none"
                      opacity={0.3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Eraser cursor - circle at current position */}
                    {drawingCurrent && (
                      <circle
                        cx={drawingCurrent.x}
                        cy={drawingCurrent.y}
                        r={(strokeWidth * 2) / zoom}
                        stroke="#ff0000"
                        strokeWidth={0.5 / zoom}
                        fill="rgba(255, 0, 0, 0.1)"
                        opacity={0.5}
                      />
                    )}
                  </g>
                )}
              </>
            )}
          </svg>

          {/* Placed Icons */}
          {visibleIcons.map((icon, index) => {
            const locked = isIconLocked(icon);
            // Calculate z-index based on position in sorted array
            // Start at 10 to leave room below for other elements, each icon gets +1
            const iconZIndex = 10 + index;
            
            return (
              <MapIconComponent
                key={icon.id}
                icon={icon}
                zIndex={iconZIndex}
                onMove={locked ? () => {} : handleIconMove}
                onMoveComplete={locked ? () => {} : handleIconMoveComplete}
                onClick={handleIconClick}
                onDragStart={locked ? () => {} : handleIconDragStart}
                isConnectMode={isConnectMode}
                isConnectStart={connectStartIconId === icon.id}
                isSelected={selectedIconIds.has(icon.id)}
                isDrawingMode={isDrawingMode}
              />
            );
          })}

          {/* Text Elements */}
          {visibleTexts.map((text, index) => {
            // Calculate z-index for texts - start after icons
            const textZIndex = 10 + visibleIcons.length + index;
            
            return (
              <MapTextComponent
                key={text.id}
                text={text}
                zIndex={textZIndex}
                onMove={handleTextMove}
                onMoveComplete={handleTextMoveComplete}
                onClick={handleTextClick}
                onDragStart={handleTextDragStart}
                isSelected={selectedTextIds.has(text.id)}
                isDrawingMode={isDrawingMode}
              />
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-[10px] leading-tight">
        {isConnectMode ? (
          <>
            {connectStartIconId 
              ? "Click another icon to create connector • Click again to cancel"
              : "Click an icon to start connector"
            }
          </>
        ) : (
          "Drag icons to add • Click to select • Ctrl+Drag for group select • Ctrl+C/V to copy/paste • Press / for shortcuts"
        )}
      </div>

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel 
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />

      {/* Print Dialog */}
      <PrintDialog 
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
      />
    </div>
  );
}
