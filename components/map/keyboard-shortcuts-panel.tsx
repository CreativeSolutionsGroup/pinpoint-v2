"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KeyboardShortcutsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Shortcut[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "General",
    shortcuts: [
      { keys: ["/"], description: "Show keyboard shortcuts" },
      { keys: ["Ctrl", "Z"], description: "Undo" },
      { keys: ["Ctrl", "Y"], description: "Redo" },
    ],
  },
  {
    title: "Icons",
    shortcuts: [
      { keys: ["Ctrl", "C"], description: "Copy selected icons" },
      { keys: ["Ctrl", "V"], description: "Paste icons at mouse position" },
      { keys: ["Delete"], description: "Delete selected icons" },
      { keys: ["Backspace"], description: "Delete selected icons" },
      { keys: ["Ctrl", "Drag"], description: "Drag-select multiple icons" },
      { keys: ["Drag"], description: "Move selected icons together" },
    ],
  },
  {
    title: "Connectors",
    shortcuts: [
      { keys: ["Shift", "(hold)"], description: "Enter connect mode" },
      { keys: ["Click icon"], description: "Select start/end for connector" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["Scroll"], description: "Zoom in/out" },
      { keys: ["Drag"], description: "Pan around map" },
      { keys: ["Shift", "Drag"], description: "Pan around map" },
    ],
  },
];

export function KeyboardShortcutsPanel({
  open,
  onOpenChange,
}: KeyboardShortcutsPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Quick reference for all available keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-xs text-muted-foreground">
                              +
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
          <p>
            <strong>Tip:</strong> On Mac, use <kbd className="px-1 py-0.5 text-xs font-semibold bg-muted border border-border rounded">Cmd</kbd> instead of <kbd className="px-1 py-0.5 text-xs font-semibold bg-muted border border-border rounded">Ctrl</kbd>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
