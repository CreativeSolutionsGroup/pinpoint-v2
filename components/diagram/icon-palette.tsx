'use client';

import React, { useState } from 'react';
import { ICON_LIBRARY, getAllCategories } from '@/lib/icons/icon-library';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IconPaletteProps {
  onIconSelect?: (iconType: string) => void;
}

export function IconPalette({ onIconSelect }: IconPaletteProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = ['all', ...getAllCategories()];
  const filteredIcons = selectedCategory === 'all' 
    ? ICON_LIBRARY 
    : ICON_LIBRARY.filter(icon => icon.category === selectedCategory);

  const handleDragStart = (e: React.DragEvent, iconType: string) => {
    e.dataTransfer.setData('iconType', iconType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Icon Library</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Drag icons onto the canvas
        </p>
      </div>
      
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
        <div className="border-b px-2">
          <ScrollArea className="w-full">
            <TabsList className="w-full justify-start">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="capitalize text-xs"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>
        
        <ScrollArea className="flex-1">
          <TabsContent value={selectedCategory} className="p-4 mt-0">
            <div className="grid grid-cols-2 gap-3">
              {filteredIcons.map((icon) => (
                <div
                  key={icon.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, icon.id)}
                  onClick={() => onIconSelect?.(icon.id)}
                  className="flex flex-col items-center justify-center p-3 border rounded-lg cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 transition-colors"
                  title={icon.description}
                >
                  <div className="mb-2">
                    {icon.renderIcon({ size: 32, color: 'currentColor' })}
                  </div>
                  <span className="text-xs text-center font-medium">
                    {icon.name}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
