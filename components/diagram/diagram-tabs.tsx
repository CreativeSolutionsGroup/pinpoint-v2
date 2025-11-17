'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DiagramTab {
  id: string;
  name: string;
}

interface DiagramTabsProps {
  tabs: DiagramTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabAdd: () => void;
  onTabRemove: (tabId: string) => void;
  onTabRename: (tabId: string, newName: string) => void;
  onTabReorder?: (fromIndex: number, toIndex: number) => void;
  onEditingChange?: (isEditing: boolean) => void;
}

export function DiagramTabs({
  tabs,
  activeTabId,
  onTabChange,
  onTabAdd,
  onTabRemove,
  onTabRename,
  onTabReorder,
  onEditingChange,
}: DiagramTabsProps) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleDoubleClick = (tab: DiagramTab) => {
    setEditingTabId(tab.id);
    setEditingValue(tab.name);
    onEditingChange?.(true);
  };

  const handleRenameSubmit = () => {
    if (editingTabId && editingValue.trim()) {
      onTabRename(editingTabId, editingValue.trim());
    }
    setEditingTabId(null);
    setEditingValue('');
    onEditingChange?.(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
      setEditingValue('');
      onEditingChange?.(false);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-muted/50 border-t px-2 py-1 overflow-x-auto">
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "relative flex items-center gap-1 px-3 py-1.5 min-w-[100px] max-w-[200px] rounded-t-md border border-b-0 transition-colors cursor-pointer group",
              activeTabId === tab.id
                ? "bg-background border-border"
                : "bg-muted/30 border-transparent hover:bg-muted"
            )}
            onClick={() => onTabChange(tab.id)}
          >
            {onTabReorder && (
              <GripVertical className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            )}
            
            {editingTabId === tab.id ? (
              <Input
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleRenameKeyDown}
                className="h-6 px-1 py-0 text-sm flex-1 min-w-0"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="text-sm truncate flex-1 min-w-0"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleDoubleClick(tab);
                }}
              >
                {tab.name}
              </span>
            )}
            
            {tabs.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabRemove(tab.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={onTabAdd}
        title="Add new diagram"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
