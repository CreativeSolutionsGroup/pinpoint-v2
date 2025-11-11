"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrintDialog({ open, onOpenChange }: PrintDialogProps) {
  const handlePrint = () => {
    window.print();
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Print Map</DialogTitle>
            <DialogDescription>
              Print your map with all icons and connectors. The map will be optimized for printing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="text-sm">
              <p className="font-medium mb-2">Print Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Set orientation to Landscape for best results</li>
                <li>Enable background graphics in print settings</li>
                <li>Use &ldquo;Fit to page&rdquo; or adjust scale as needed</li>
                <li>All icons and connectors will be included</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything except the map canvas */
          body * {
            visibility: hidden !important;
          }
          
          #map-canvas-print,
          #map-canvas-print * {
            visibility: visible !important;
          }
          
          #map-canvas-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }

          /* Hide UI controls when printing */
          #map-canvas-print button,
          #map-canvas-print .selection-box,
          #map-canvas-print .instructions {
            display: none !important;
          }

          /* Ensure map fills page */
          @page {
            size: landscape;
            margin: 0.5cm;
          }
        }
      `}</style>
    </>
  );
}
