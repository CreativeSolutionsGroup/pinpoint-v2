// Predefined icon library for diagram items
// Using Lucide icons as the base for rendering

import {
  Armchair,
  Box,
  Circle,
  CircleDot,
  Cone,
  Container,
  Cpu,
  Disc,
  DoorOpen,
  Lamp,
  Lightbulb,
  MapPin,
  Mic,
  Monitor,
  Music,
  Package,
  Projector,
  Radio,
  Shapes,
  Sofa,
  Speaker,
  Square,
  Table,
  Triangle,
  Tv,
  Users,
  Warehouse,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import React from 'react';
import type { IconDefinition, IconRenderProps } from '../types/diagram';

// Helper function to create icon definitions
const createIconDef = (
  id: string,
  name: string,
  category: string,
  description: string,
  Icon: LucideIcon,
  defaultWidth = 50,
  defaultHeight = 50
): IconDefinition => ({
  id,
  name,
  category,
  description,
  defaultWidth,
  defaultHeight,
  renderIcon: ({ color = '#000000', size = 24, className = '' }: IconRenderProps) =>
    React.createElement(Icon, {
      color,
      size,
      className,
      strokeWidth: 2,
    }),
});

// Icon categories
export const ICON_CATEGORIES = {
  FURNITURE: 'furniture',
  EQUIPMENT: 'equipment',
  MARKERS: 'markers',
  SHAPES: 'shapes',
  AUDIO_VISUAL: 'audio-visual',
  LIGHTING: 'lighting',
  STAGING: 'staging',
  GENERAL: 'general',
} as const;

// Predefined icon library
export const ICON_LIBRARY: IconDefinition[] = [
  // Furniture
  createIconDef('chair', 'Chair', ICON_CATEGORIES.FURNITURE, 'Standard chair', Armchair, 40, 40),
  createIconDef('sofa', 'Sofa', ICON_CATEGORIES.FURNITURE, 'Couch or sofa', Sofa, 80, 40),
  createIconDef('table', 'Table', ICON_CATEGORIES.FURNITURE, 'Table', Table, 60, 60),
  createIconDef('desk', 'Desk', ICON_CATEGORIES.FURNITURE, 'Desk or work surface', Table, 80, 50),
  
  // Audio Visual Equipment
  createIconDef('speaker', 'Speaker', ICON_CATEGORIES.AUDIO_VISUAL, 'Audio speaker', Speaker, 40, 50),
  createIconDef('microphone', 'Microphone', ICON_CATEGORIES.AUDIO_VISUAL, 'Microphone', Mic, 30, 40),
  createIconDef('monitor', 'Monitor', ICON_CATEGORIES.AUDIO_VISUAL, 'Display monitor', Monitor, 60, 40),
  createIconDef('tv', 'TV', ICON_CATEGORIES.AUDIO_VISUAL, 'Television', Tv, 70, 45),
  createIconDef('projector', 'Projector', ICON_CATEGORIES.AUDIO_VISUAL, 'Projector', Projector, 50, 40),
  createIconDef('radio', 'Radio', ICON_CATEGORIES.AUDIO_VISUAL, 'Radio or wireless equipment', Radio, 40, 40),
  createIconDef('wifi', 'WiFi', ICON_CATEGORIES.EQUIPMENT, 'WiFi access point', Wifi, 40, 40),
  
  // Lighting
  createIconDef('light', 'Light', ICON_CATEGORIES.LIGHTING, 'Light fixture', Lightbulb, 35, 35),
  createIconDef('lamp', 'Lamp', ICON_CATEGORIES.LIGHTING, 'Lamp or standing light', Lamp, 35, 50),
  createIconDef('spotlight', 'Spotlight', ICON_CATEGORIES.LIGHTING, 'Spotlight', Cone, 40, 40),
  
  // Staging
  createIconDef('stage', 'Stage', ICON_CATEGORIES.STAGING, 'Stage platform', Square, 100, 80),
  createIconDef('music', 'Music Equipment', ICON_CATEGORIES.STAGING, 'Musical equipment', Music, 50, 50),
  createIconDef('dj-booth', 'DJ Booth', ICON_CATEGORIES.STAGING, 'DJ booth or console', Cpu, 70, 50),
  
  // Equipment & Storage
  createIconDef('box', 'Box', ICON_CATEGORIES.EQUIPMENT, 'Storage box', Box, 40, 40),
  createIconDef('package', 'Package', ICON_CATEGORIES.EQUIPMENT, 'Package or crate', Package, 45, 45),
  createIconDef('container', 'Container', ICON_CATEGORIES.EQUIPMENT, 'Large container', Container, 60, 50),
  createIconDef('warehouse', 'Storage', ICON_CATEGORIES.EQUIPMENT, 'Storage area', Warehouse, 60, 60),
  
  // Markers & Indicators
  createIconDef('pin', 'Pin', ICON_CATEGORIES.MARKERS, 'Location marker', MapPin, 30, 40),
  createIconDef('dot', 'Dot', ICON_CATEGORIES.MARKERS, 'Point marker', CircleDot, 25, 25),
  createIconDef('people', 'People Area', ICON_CATEGORIES.MARKERS, 'People or seating area', Users, 50, 50),
  
  // Basic Shapes
  createIconDef('circle', 'Circle', ICON_CATEGORIES.SHAPES, 'Circle shape', Circle, 50, 50),
  createIconDef('square', 'Square', ICON_CATEGORIES.SHAPES, 'Square shape', Square, 50, 50),
  createIconDef('triangle', 'Triangle', ICON_CATEGORIES.SHAPES, 'Triangle shape', Triangle, 50, 50),
  createIconDef('disc', 'Disc', ICON_CATEGORIES.SHAPES, 'Disc shape', Disc, 50, 50),
  createIconDef('shapes', 'Shapes', ICON_CATEGORIES.SHAPES, 'Mixed shapes', Shapes, 50, 50),
  
  // General
  createIconDef('door', 'Door', ICON_CATEGORIES.GENERAL, 'Door or entrance', DoorOpen, 40, 60),
];

// Helper functions
export const getIconById = (id: string): IconDefinition | undefined => {
  return ICON_LIBRARY.find((icon) => icon.id === id);
};

export const getIconsByCategory = (category: string): IconDefinition[] => {
  return ICON_LIBRARY.filter((icon) => icon.category === category);
};

export const getAllCategories = (): string[] => {
  return Object.values(ICON_CATEGORIES);
};
