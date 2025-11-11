'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiagramCanvas } from '@/components/diagram/diagram-canvas';
import { IconPalette } from '@/components/diagram/icon-palette';
import { PropertiesPanel } from '@/components/diagram/properties-panel';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Hand, 
  MousePointer,
} from 'lucide-react';
import type { DiagramItem } from '@/lib/types/diagram';
import { getIconById } from '@/lib/icons/icon-library';

export default function DiagramEditorPage() {
  const router = useRouter();
  
  // Demo diagram with lake image - no persistence, resets on refresh
  const [diagramName] = useState('Lake Event Setup');
  const [imageUrl] = useState('/lake-updated-v2.png');
  const [imageWidth] = useState(1920);
  const [imageHeight] = useState(1080);
  
  const [items, setItems] = useState<DiagramItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'pan'>('select');
  const [showIconPalette, setShowIconPalette] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [nextItemId, setNextItemId] = useState(1);

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
            <h1 className="text-lg font-semibold">{diagramName}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {items.length} items • No persistence (resets on refresh)
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
            variant={showProperties ? 'default' : 'outline'}
            onClick={() => setShowProperties(!showProperties)}
          >
            Properties
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
        <div className="flex-1">
          <DiagramCanvas
            imageUrl={imageUrl}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            items={items}
            selectedItemId={selectedItemId}
            onItemSelect={setSelectedItemId}
            onItemUpdate={handleItemUpdate}
            onItemDelete={handleItemDelete}
            onCanvasDrop={handleCanvasDrop}
            tool={tool}
          />
        </div>

        {/* Properties Panel */}
        {showProperties && (
          <div className="w-80 shrink-0">
            <PropertiesPanel
              item={selectedItem}
              onUpdate={(updates) => {
                if (selectedItemId) {
                  handleItemUpdate(selectedItemId, updates);
                }
              }}
              onDelete={() => {
                if (selectedItemId) {
                  handleItemDelete(selectedItemId);
                }
              }}
              onClose={() => setSelectedItemId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
