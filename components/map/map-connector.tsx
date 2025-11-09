"use client";

import { Connector, MapIcon } from "./types";
import { useState } from "react";
import { ConnectorEditMenu } from "./connector-edit-menu";

interface MapConnectorProps {
  connector: Connector;
  startIcon: MapIcon | undefined;
  endIcon: MapIcon | undefined;
  onUpdate: (id: string, updates: Partial<Connector>) => void;
  onDelete: (id: string) => void;
}

export function MapConnector({ 
  connector, 
  startIcon, 
  endIcon,
  onUpdate,
  onDelete,
}: MapConnectorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // If either icon is missing, don't render
  if (!startIcon || !endIcon) {
    return null;
  }

  const color = connector.color || "#64748b";
  const width = connector.width || 2;
  const style = connector.style || "solid";

  // Get stroke-dasharray based on style
  const getDashArray = () => {
    switch (style) {
      case "dashed":
        return "8,4";
      case "dotted":
        return "2,2";
      default:
        return "none";
    }
  };

  // Calculate midpoint for label
  const midX = (startIcon.position.x + endIcon.position.x) / 2;
  const midY = (startIcon.position.y + endIcon.position.y) / 2;

  return (
    <g>
      {/* Invisible wider line for easier hover/click detection */}
      <line
        x1={`${startIcon.position.x}%`}
        y1={`${startIcon.position.y}%`}
        x2={`${endIcon.position.x}%`}
        y2={`${endIcon.position.y}%`}
        stroke="transparent"
        strokeWidth={Math.max(12, width + 8)}
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
      {/* Actual visible line */}
      <line
        x1={`${startIcon.position.x}%`}
        y1={`${startIcon.position.y}%`}
        x2={`${endIcon.position.x}%`}
        y2={`${endIcon.position.y}%`}
        stroke={color}
        strokeWidth={isHovered ? width + 1 : width}
        strokeDasharray={getDashArray()}
        style={{ 
          pointerEvents: "none",
          transition: "stroke-width 0.15s ease",
        }}
      />

      {/* Label */}
      {connector.label && (
        <text
          x={`${midX}%`}
          y={`${midY}%`}
          fill="currentColor"
          fontSize="10"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground"
          style={{ pointerEvents: "none" }}
        >
          <tspan
            className="bg-background px-1 py-0.5 rounded"
            style={{
              paintOrder: "stroke",
              stroke: "hsl(var(--background))",
              strokeWidth: "3px",
            }}
          >
            {connector.label}
          </tspan>
        </text>
      )}

      {/* Edit menu when hovered - with expanded hover area */}
      {(isHovered || isMenuOpen) && (
        <foreignObject
          x={`${midX}%`}
          y={`${midY}%`}
          width="1"
          height="1"
          style={{ overflow: "visible" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Invisible hover bridge area to prevent menu from disappearing */}
          <div 
            style={{ 
              position: "absolute",
              transform: "translate(-50%, 0%)",
              width: "20px",
              height: "60px",
              top: "-40px",
              left: "0",
              pointerEvents: "auto",
            }}
          />
          <div style={{ 
            position: "absolute",
            left: "0",
            top: "-36px",
            transform: "translateX(-50%)"
          }}>
            <ConnectorEditMenu
              connector={connector}
              onUpdate={(updates: Partial<Connector>) => onUpdate(connector.id, updates)}
              onDelete={() => onDelete(connector.id)}
              onOpenChange={setIsMenuOpen}
            />
          </div>
        </foreignObject>
      )}
    </g>
  );
}
