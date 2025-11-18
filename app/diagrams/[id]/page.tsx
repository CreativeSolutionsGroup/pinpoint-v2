'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DiagramCanvas } from '@/components/diagram/diagram-canvas';
import { IconPalette } from '@/components/diagram/icon-palette';
import { PropertiesPanel } from '@/components/diagram/properties-panel';
import { LayersPanel } from '@/components/diagram/layers-panel';
import { DrawingPanel } from '@/components/diagram/drawing-panel';
import { DiagramTabs } from '@/components/diagram/diagram-tabs';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Hand, 
  MousePointer,
  Pencil,
  ChevronDown,
} from 'lucide-react';
import type { DiagramItem, DiagramLayer, DrawingPath, DrawingShape } from '@/lib/types/diagram';
import { getIconById } from '@/lib/icons/icon-library';

// Type for storing complete diagram state
interface DiagramState {
  id: string;
  name: string;
  items: DiagramItem[];
  layers: DiagramLayer[];
  drawingPaths: DrawingPath[];
  drawingShapes: DrawingShape[];
  nextItemId: number;
}

export default function DiagramEditorPage() {
  const router = useRouter();
  
  // Multi-diagram state
  const [diagrams, setDiagrams] = useState<DiagramState[]>([
    {
      id: 'diagram-1',
      name: 'Diagram 1',
      items: [],
      layers: [{ id: 'default', name: 'Default Layer', visible: true, locked: false, order: 0 }],
      drawingPaths: [],
      drawingShapes: [],
      nextItemId: 1,
    }
  ]);
  const [activeDiagramId, setActiveDiagramId] = useState('diagram-1');
  
  // Get active diagram
  const activeDiagram = diagrams.find(d => d.id === activeDiagramId) || diagrams[0];
  
  // Event-level state
  const [diagramName, setDiagramName] = useState('Lake Event Setup');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [imageUrl] = useState('/lake-updated-v2.png');
  const [imageWidth] = useState(1920);
  const [imageHeight] = useState(1080);
  
  // Active diagram state (derived from active diagram)
  const items = activeDiagram.items;
  const layers = activeDiagram.layers;
  const drawingPaths = activeDiagram.drawingPaths;
  const drawingShapes = activeDiagram.drawingShapes;
  const nextItemId = activeDiagram.nextItemId;
  
  // Update functions that modify active diagram
  const setItems = useCallback((updater: React.SetStateAction<DiagramItem[]>) => {
    setDiagrams(prev => prev.map(d => 
      d.id === activeDiagramId 
        ? { ...d, items: typeof updater === 'function' ? updater(d.items) : updater }
        : d
    ));
  }, [activeDiagramId]);
  
  const setLayers = useCallback((updater: React.SetStateAction<DiagramLayer[]>) => {
    setDiagrams(prev => prev.map(d => 
      d.id === activeDiagramId 
        ? { ...d, layers: typeof updater === 'function' ? updater(d.layers) : updater }
        : d
    ));
  }, [activeDiagramId]);
  
  const setDrawingPaths = useCallback((updater: React.SetStateAction<DrawingPath[]>) => {
    setDiagrams(prev => prev.map(d => 
      d.id === activeDiagramId 
        ? { ...d, drawingPaths: typeof updater === 'function' ? updater(d.drawingPaths) : updater }
        : d
    ));
  }, [activeDiagramId]);
  
  const setDrawingShapes = useCallback((updater: React.SetStateAction<DrawingShape[]>) => {
    setDiagrams(prev => prev.map(d => 
      d.id === activeDiagramId 
        ? { ...d, drawingShapes: typeof updater === 'function' ? updater(d.drawingShapes) : updater }
        : d
    ));
  }, [activeDiagramId]);
  
  const setNextItemId = useCallback((value: number) => {
    setDiagrams(prev => prev.map(d => 
      d.id === activeDiagramId 
        ? { ...d, nextItemId: value }
        : d
    ));
  }, [activeDiagramId]);
  
  // UI state
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [selectedDrawingType, setSelectedDrawingType] = useState<'path' | 'shape' | null>(null);
  const [selectedDrawingIds, setSelectedDrawingIds] = useState<Array<{id: string, type: 'path' | 'shape'}>>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string>('default');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<DiagramItem[]>([]);
  const [tool, setTool] = useState<'select' | 'pan' | 'pen' | 'eraser' | 'circle' | 'rectangle' | 'triangle'>('select');
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [drawingWidth, setDrawingWidth] = useState(3);
  const [drawingOpacity, setDrawingOpacity] = useState(1);
  const [drawingFilled, setDrawingFilled] = useState(false);
  const [showIconPalette, setShowIconPalette] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [expandedPanel, setExpandedPanel] = useState<'properties' | 'layers' | 'drawing' | null>('properties');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingLayerName, setIsEditingLayerName] = useState(false);
  const [isEditingProperties, setIsEditingProperties] = useState(false);
  const [isEditingTab, setIsEditingTab] = useState(false);

  // Clear selection when switching diagrams
  useEffect(() => {
    setSelectedItemId(null);
    setSelectedItemIds([]);
    setSelectedDrawingId(null);
    setSelectedDrawingType(null);
    setSelectedDrawingIds([]);
  }, [activeDiagramId]);

  // Diagram tab management
  const handleTabChange = (tabId: string) => {
    setActiveDiagramId(tabId);
  };

  const handleTabAdd = () => {
    const newId = `diagram-${Date.now()}`;
    const newDiagram: DiagramState = {
      id: newId,
      name: `Diagram ${diagrams.length + 1}`,
      items: [],
      layers: [{ id: 'default', name: 'Default Layer', visible: true, locked: false, order: 0 }],
      drawingPaths: [],
      drawingShapes: [],
      nextItemId: 1,
    };
    setDiagrams(prev => [...prev, newDiagram]);
    setActiveDiagramId(newId);
  };

  const handleTabRemove = (tabId: string) => {
    if (diagrams.length <= 1) return;
    
    const index = diagrams.findIndex(d => d.id === tabId);
    const newDiagrams = diagrams.filter(d => d.id !== tabId);
    setDiagrams(newDiagrams);
    
    if (tabId === activeDiagramId) {
      const newIndex = Math.max(0, index - 1);
      setActiveDiagramId(newDiagrams[newIndex].id);
    }
  };

  const handleTabRename = (tabId: string, newName: string) => {
    setDiagrams(prev => prev.map(d => 
      d.id === tabId ? { ...d, name: newName } : d
    ));
  };

  // Switch to select tool when drawing panel is collapsed
  useEffect(() => {
    const drawingTools: typeof tool[] = ['pen', 'eraser', 'circle', 'rectangle', 'triangle'];
    if (expandedPanel !== 'drawing' && drawingTools.includes(tool)) {
      setTool('select');
    }
  }, [expandedPanel, tool]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when editing title, label, layer name, properties, or tabs
      if (isEditingTitle || isEditingLabel || isEditingLayerName || isEditingProperties || isEditingTab) return;
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
      
      // Select All (Ctrl/Cmd + A)
      if (ctrlKey && e.key === 'a') {
        e.preventDefault();
        setSelectedItemIds(items.map(item => item.id));
        setSelectedItemId(items[items.length - 1]?.id || null);
        return;
      }
      
      // Copy (Ctrl/Cmd + C)
      if (ctrlKey && e.key === 'c') {
        e.preventDefault();
        const itemsToCopy = selectedItemIds.length > 0
          ? items.filter(item => selectedItemIds.includes(item.id))
          : selectedItemId
          ? items.filter(item => item.id === selectedItemId)
          : [];
        if (itemsToCopy.length > 0) {
          setClipboard(itemsToCopy);
        }
        return;
      }
      
      // Cut (Ctrl/Cmd + X)
      if (ctrlKey && e.key === 'x') {
        e.preventDefault();
        const itemsToCut = selectedItemIds.length > 0
          ? items.filter(item => selectedItemIds.includes(item.id))
          : selectedItemId
          ? items.filter(item => item.id === selectedItemId)
          : [];
        if (itemsToCut.length > 0) {
          setClipboard(itemsToCut);
          const idsToRemove = itemsToCut.map(item => item.id);
          setItems(prev => prev.filter(item => !idsToRemove.includes(item.id)));
          setSelectedItemId(null);
          setSelectedItemIds([]);
        }
        return;
      }
      
      // Paste (Ctrl/Cmd + V)
      if (ctrlKey && e.key === 'v') {
        e.preventDefault();
        if (clipboard.length > 0) {
          const newItems = clipboard.map(item => ({
            ...item,
            id: `item_${nextItemId + clipboard.indexOf(item)}`,
            x: item.x + 20,
            y: item.y + 20,
          }));
          setItems(prev => [...prev, ...newItems]);
          setSelectedItemIds(newItems.map(item => item.id));
          setSelectedItemId(newItems[newItems.length - 1].id);
          setNextItemId(nextItemId + clipboard.length);
        }
        return;
      }
      
      // Duplicate (Ctrl/Cmd + D)
      if (ctrlKey && e.key === 'd') {
        e.preventDefault();
        const itemsToDuplicate = selectedItemIds.length > 0
          ? items.filter(item => selectedItemIds.includes(item.id))
          : selectedItemId
          ? items.filter(item => item.id === selectedItemId)
          : [];
        if (itemsToDuplicate.length > 0) {
          const newItems = itemsToDuplicate.map(item => ({
            ...item,
            id: `item_${nextItemId + itemsToDuplicate.indexOf(item)}`,
            x: item.x + 20,
            y: item.y + 20,
          }));
          setItems(prev => [...prev, ...newItems]);
          setSelectedItemIds(newItems.map(item => item.id));
          setSelectedItemId(newItems[newItems.length - 1].id);
          setNextItemId(nextItemId + itemsToDuplicate.length);
        }
        return;
      }
      
      // Deselect All (Escape)
      if (e.key === 'Escape') {
        setSelectedItemId(null);
        setSelectedItemIds([]);
        setSelectedDrawingId(null);
        setSelectedDrawingType(null);
        setSelectedDrawingIds([]);
        return;
      }
      
      // Delete selected item or drawing (Delete or Backspace)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        
        let somethingDeleted = false;
        
        // Delete selected drawings (multi-select)
        if (selectedDrawingIds.length > 0) {
          const pathIds = selectedDrawingIds.filter(d => d.type === 'path').map(d => d.id);
          const shapeIds = selectedDrawingIds.filter(d => d.type === 'shape').map(d => d.id);
          
          if (pathIds.length > 0) {
            setDrawingPaths(prev => prev.filter(p => !pathIds.includes(p.id)));
          }
          if (shapeIds.length > 0) {
            setDrawingShapes(prev => prev.filter(s => !shapeIds.includes(s.id)));
          }
          
          setSelectedDrawingIds([]);
          setSelectedDrawingId(null);
          setSelectedDrawingType(null);
          somethingDeleted = true;
        }
        
        // Delete selected drawing (single select)
        if (selectedDrawingId && selectedDrawingType) {
          if (selectedDrawingType === 'path') {
            setDrawingPaths(prev => prev.filter(p => p.id !== selectedDrawingId));
          } else if (selectedDrawingType === 'shape') {
            setDrawingShapes(prev => prev.filter(s => s.id !== selectedDrawingId));
          }
          setSelectedDrawingId(null);
          setSelectedDrawingType(null);
          somethingDeleted = true;
        }
        
        // Delete selected items (icons)
        const idsToDelete = selectedItemIds.length > 0
          ? selectedItemIds
          : selectedItemId
          ? [selectedItemId]
          : [];
        
        if (idsToDelete.length > 0) {
          setItems(prev => prev.filter(item => !idsToDelete.includes(item.id)));
          setSelectedItemId(null);
          setSelectedItemIds([]);
          somethingDeleted = true;
        }
        
        if (somethingDeleted) {
          return;
        }
        return;
      }
      
      // Switch to Select Tool (V)
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setTool('select');
        return;
      }
      
      // Switch to Pan Tool (H or Space)
      if (e.key === 'h' || e.key === 'H' || e.key === ' ') {
        e.preventDefault();
        setTool('pan');
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedItemId, selectedItemIds, selectedDrawingId, selectedDrawingType, selectedDrawingIds, clipboard, nextItemId, isEditingTitle, isEditingLabel, isEditingLayerName, isEditingProperties, isEditingTab, setItems, setDrawingPaths, setDrawingShapes, setNextItemId]);

  const handleCanvasDrop = (x: number, y: number, iconType: string) => {
    const iconDef = getIconById(iconType);
    if (!iconDef) return;

    const newItem: DiagramItem = {
      id: `item_${nextItemId}`,
      diagramId: 'demo',
      iconType,
      name: iconDef.name,
      description: '',
      x,
      y,
      width: iconDef.defaultWidth,
      height: iconDef.defaultHeight,
      rotation: 0,
      color: '#000000',
      opacity: 1.0,
      zIndex: items.length,
      layerId: selectedLayerId, // Assign to selected layer
    };

    setItems([...items, newItem]);
    setSelectedItemId(newItem.id);
    setNextItemId(nextItemId + 1);
  };

  const handleItemUpdate = (itemId: string, updates: Partial<DiagramItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const handleMultiItemUpdate = (itemIds: string[], updates: Partial<DiagramItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (itemIds.includes(item.id)) {
          // For position updates, treat as delta
          if ('x' in updates || 'y' in updates) {
            return {
              ...item,
              x: item.x + (updates.x || 0),
              y: item.y + (updates.y || 0),
            };
          }
          return { ...item, ...updates };
        }
        return item;
      })
    );
  };

  const handleItemDelete = (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setSelectedItemId(null);
  };

  const selectedItem = items.find((item) => item.id === selectedItemId) || null;

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            {isEditingTitle ? (
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={() => {
                  if (tempTitle.trim()) {
                    setDiagramName(tempTitle.trim());
                  }
                  setIsEditingTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (tempTitle.trim()) {
                      setDiagramName(tempTitle.trim());
                    }
                    setIsEditingTitle(false);
                  } else if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="text-lg font-semibold bg-transparent border-b-2 border-blue-500 outline-none px-1"
              />
            ) : (
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => {
                  setTempTitle(diagramName);
                  setIsEditingTitle(true);
                }}
              >
                <h1 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                  {diagramName}
                </h1>
                <Pencil size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {items.length} items • {(selectedItemIds.length > 0 || selectedDrawingIds.length > 0) ? `${selectedItemIds.length + selectedDrawingIds.length} selected • ` : ''}No persistence
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Ctrl+A: Select All • Ctrl+C/X/V: Copy/Cut/Paste • Ctrl+D: Duplicate • V/H: Tools
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tool Selection */}
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={tool === 'select' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setTool('select')}
              title="Select Tool (V)"
            >
              <MousePointer size={18} />
            </Button>
            <Button
              variant={tool === 'pan' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setTool('pan')}
              title="Pan Tool (H)"
            >
              <Hand size={18} />
            </Button>
          </div>

          {/* Panel Toggles */}
          <Button
            variant={showIconPalette ? 'default' : 'outline'}
            onClick={() => setShowIconPalette(!showIconPalette)}
          >
            Icon Library
          </Button>
          <Button
            variant={showRightSidebar ? 'default' : 'outline'}
            onClick={() => setShowRightSidebar(!showRightSidebar)}
          >
            Sidebar
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Icon Palette */}
        {showIconPalette && (
          <div className="w-80 shrink-0">
            <IconPalette />
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <DiagramCanvas
              imageUrl={imageUrl}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              items={items}
              layers={layers}
              selectedLayerId={selectedLayerId}
              drawingPaths={drawingPaths}
              drawingShapes={drawingShapes}
              selectedItemId={selectedItemId}
              selectedItemIds={selectedItemIds}
              selectedDrawingId={selectedDrawingId}
              selectedDrawingType={selectedDrawingType}
              selectedDrawingIds={selectedDrawingIds}
              onItemSelect={setSelectedItemId}
              onMultiSelect={setSelectedItemIds}
              onDrawingSelect={(id, type) => {
                setSelectedDrawingId(id);
                setSelectedDrawingType(type);
                setSelectedDrawingIds([]);
              }}
              onDrawingMultiSelect={(drawings) => {
                setSelectedDrawingIds(drawings);
                // Don't clear icon selection to allow mixed selection
                // Set single selection to last drawing
                if (drawings.length > 0) {
                  const last = drawings[drawings.length - 1];
                  setSelectedDrawingId(last.id);
                  setSelectedDrawingType(last.type);
                } else {
                  setSelectedDrawingId(null);
                  setSelectedDrawingType(null);
                }
              }}
              onItemUpdate={handleItemUpdate}
              onMultiItemUpdate={handleMultiItemUpdate}
              onItemDelete={handleItemDelete}
              onCanvasDrop={handleCanvasDrop}
              onDrawingPathAdd={(path) => setDrawingPaths(prev => [...prev, path])}
              onDrawingPathsUpdate={setDrawingPaths}
              onDrawingShapeAdd={(shape) => setDrawingShapes(prev => [...prev, shape])}
              onDrawingShapesUpdate={setDrawingShapes}
              tool={tool}
              drawingColor={drawingColor}
              drawingWidth={drawingWidth}
              drawingOpacity={drawingOpacity}
              drawingFilled={drawingFilled}
              onLabelEditChange={setIsEditingLabel}
            />
          </div>
          
          {/* Diagram Tabs - Excel style at bottom */}
          <DiagramTabs
            tabs={diagrams.map(d => ({ id: d.id, name: d.name }))}
            activeTabId={activeDiagramId}
            onTabChange={handleTabChange}
            onTabAdd={handleTabAdd}
            onTabRemove={handleTabRemove}
            onTabRename={handleTabRename}
            onEditingChange={setIsEditingTab}
          />
        </div>

        {/* Right Sidebar - Accordion */}
        {showRightSidebar && (
          <div className="w-80 shrink-0 border-l bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
            {/* Properties Accordion Section */}
            <div className="flex flex-col border-b transition-all duration-300 ease-in-out overflow-hidden" style={{ flex: expandedPanel === 'properties' ? '1 1 0' : '0 0 auto' }}>
              <button
                onClick={() => setExpandedPanel(expandedPanel === 'properties' ? null : 'properties')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0"
              >
                <span className="font-semibold text-sm">Properties</span>
                <div className="transition-transform duration-200" style={{ transform: expandedPanel === 'properties' ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                  <ChevronDown size={16} />
                </div>
              </button>
              <div 
                className="border-t overflow-y-auto transition-all duration-300 ease-in-out flex-1 min-h-0"
                style={{ 
                  opacity: expandedPanel === 'properties' ? 1 : 0,
                  maxHeight: expandedPanel === 'properties' ? '100%' : '0'
                }}
              >
                <PropertiesPanel
                  item={selectedItem}
                  items={items}
                  selectedItemIds={selectedItemIds}
                  selectedDrawingIds={selectedDrawingIds}
                  layers={layers}
                  selectedDrawingId={selectedDrawingId}
                  selectedDrawingType={selectedDrawingType}
                  drawingShapes={drawingShapes}
                  drawingPaths={drawingPaths}
                  onEditingChange={setIsEditingProperties}
                  onUpdate={(updates) => {
                    if (selectedItemId) {
                      handleItemUpdate(selectedItemId, updates);
                    }
                  }}
                  onMultiUpdate={(updates) => {
                    setItems(prevItems =>
                      prevItems.map(item =>
                        selectedItemIds.includes(item.id)
                          ? { ...item, ...updates }
                          : item
                      )
                    );
                  }}
                  onDrawingUpdate={(updates) => {
                    if (selectedDrawingType === 'shape' && selectedDrawingId) {
                      setDrawingShapes(prev => prev.map(s => 
                        s.id === selectedDrawingId ? { ...s, ...updates } : s
                      ));
                    } else if (selectedDrawingType === 'path' && selectedDrawingId) {
                      setDrawingPaths(prev => prev.map(p => 
                        p.id === selectedDrawingId ? { ...p, ...updates } : p
                      ));
                    }
                  }}
                  onDrawingMultiUpdate={(shapeUpdates, pathUpdates) => {
                    const shapeIds = selectedDrawingIds.filter(d => d.type === 'shape').map(d => d.id);
                    const pathIds = selectedDrawingIds.filter(d => d.type === 'path').map(d => d.id);
                    
                    if (shapeIds.length > 0 && Object.keys(shapeUpdates).length > 0) {
                      setDrawingShapes(prev => prev.map(s => 
                        shapeIds.includes(s.id) ? { ...s, ...shapeUpdates } : s
                      ));
                    }
                    
                    if (pathIds.length > 0 && Object.keys(pathUpdates).length > 0) {
                      setDrawingPaths(prev => prev.map(p => 
                        pathIds.includes(p.id) ? { ...p, ...pathUpdates } : p
                      ));
                    }
                  }}
                  onDelete={() => {
                    if (selectedItemIds.length > 1) {
                      // Multi-delete
                      setItems(prevItems =>
                        prevItems.filter(item => !selectedItemIds.includes(item.id))
                      );
                      setSelectedItemIds([]);
                      setSelectedItemId(null);
                    } else if (selectedItemId) {
                      // Single delete
                      handleItemDelete(selectedItemId);
                      setSelectedItemId(null);
                      setSelectedItemIds([]);
                    }
                  }}
                  onClose={() => {
                    setSelectedItemId(null);
                    setSelectedItemIds([]);
                  }}
                />
              </div>
            </div>

            {/* Layers Accordion Section */}
            <div className="flex flex-col border-b transition-all duration-300 ease-in-out overflow-hidden" style={{ flex: expandedPanel === 'layers' ? '1 1 0' : '0 0 auto' }}>
              <button
                onClick={() => setExpandedPanel(expandedPanel === 'layers' ? null : 'layers')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0"
              >
                <span className="font-semibold text-sm">Layers</span>
                <div className="transition-transform duration-200" style={{ transform: expandedPanel === 'layers' ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                  <ChevronDown size={16} />
                </div>
              </button>
              <div 
                className="border-t overflow-y-auto transition-all duration-300 ease-in-out flex-1 min-h-0"
                style={{ 
                  opacity: expandedPanel === 'layers' ? 1 : 0,
                  maxHeight: expandedPanel === 'layers' ? '100%' : '0'
                }}
              >
                <LayersPanel
                  layers={layers}
                  items={items}
                  drawingShapes={drawingShapes}
                  drawingPaths={drawingPaths}
                  selectedLayerId={selectedLayerId}
                  onLayersUpdate={setLayers}
                  onItemsUpdate={setItems}
                  onLayerSelect={setSelectedLayerId}
                  onSelectLayerItems={(itemIds, drawingIds) => {
                    setSelectedItemIds(itemIds);
                    setSelectedDrawingIds(drawingIds);
                    // Set last selected for properties panel
                    if (itemIds.length > 0) {
                      setSelectedItemId(itemIds[itemIds.length - 1]);
                    }
                    if (drawingIds.length > 0) {
                      const last = drawingIds[drawingIds.length - 1];
                      setSelectedDrawingId(last.id);
                      setSelectedDrawingType(last.type);
                    }
                  }}
                  onEditingChange={setIsEditingLayerName}
                />
              </div>
            </div>

            {/* Drawing Accordion Section */}
            <div className="flex flex-col border-b transition-all duration-300 ease-in-out overflow-hidden" style={{ flex: expandedPanel === 'drawing' ? '1 1 0' : '0 0 auto' }}>
              <button
                onClick={() => setExpandedPanel(expandedPanel === 'drawing' ? null : 'drawing')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0"
              >
                <span className="font-semibold text-sm">Drawing Tools</span>
                <div className="transition-transform duration-200" style={{ transform: expandedPanel === 'drawing' ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                  <ChevronDown size={16} />
                </div>
              </button>
              <div 
                className="border-t overflow-y-auto transition-all duration-300 ease-in-out flex-1 min-h-0"
                style={{ 
                  opacity: expandedPanel === 'drawing' ? 1 : 0,
                  maxHeight: expandedPanel === 'drawing' ? '100%' : '0'
                }}
              >
                <DrawingPanel
                  drawingPaths={drawingPaths}
                  drawingShapes={drawingShapes}
                  drawingTool={tool === 'pen' || tool === 'eraser' || tool === 'circle' || tool === 'rectangle' || tool === 'triangle' ? tool : null}
                  drawingColor={drawingColor}
                  drawingWidth={drawingWidth}
                  drawingOpacity={drawingOpacity}
                  drawingFilled={drawingFilled}
                  onDrawingToolChange={(newTool) => setTool(newTool || 'select')}
                  onDrawingColorChange={setDrawingColor}
                  onDrawingWidthChange={setDrawingWidth}
                  onDrawingOpacityChange={setDrawingOpacity}
                  onDrawingFilledChange={setDrawingFilled}
                  onClearDrawings={() => {
                    setDrawingPaths([]);
                    setDrawingShapes([]);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
