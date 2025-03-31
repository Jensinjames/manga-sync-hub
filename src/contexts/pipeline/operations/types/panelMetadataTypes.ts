
import { Json } from '@/integrations/supabase/types';

// Type definition for panel metadata returned from API
export interface PanelMetadata {
  processing?: boolean;
  error?: string; 
  content?: string;
  scene_type?: string;
  character_count?: number;
  mood?: string;
  action_level?: string;
  processed_at?: string;
  labels?: any[];
  imageHash?: string;
}

// Type guard to check if data is a valid metadata object with expected properties
// Using a different approach to fix the TypeScript error
export const isMetadataObject = (data: Json | null | undefined): boolean => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return false;
  }
  
  // Check for basic structure, this doesn't enforce that all properties
  // are present, only that the object has the right shape
  return true;
};

// Helper function to safely access metadata properties with proper typing
export const getMetadataProperty = <K extends keyof PanelMetadata>(
  data: Json | null | undefined, 
  key: K, 
  defaultValue?: PanelMetadata[K]
): PanelMetadata[K] | undefined => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return defaultValue;
  }
  
  const value = (data as Record<string, unknown>)[key];
  return value !== undefined ? value as PanelMetadata[K] : defaultValue;
};

// Helper to convert Json to PanelMetadata with safety checks
export const convertToMetadata = (data: Json): PanelMetadata => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return {}; // Return empty metadata if input is invalid
  }
  
  const metadata: PanelMetadata = {};
  
  // Safely assign each property with appropriate type checking
  if (typeof data.processing === 'boolean') metadata.processing = data.processing;
  if (typeof data.error === 'string') metadata.error = data.error;
  if (typeof data.content === 'string') metadata.content = data.content;
  if (typeof data.scene_type === 'string') metadata.scene_type = data.scene_type;
  if (typeof data.character_count === 'number') metadata.character_count = data.character_count;
  if (typeof data.mood === 'string') metadata.mood = data.mood;
  if (typeof data.action_level === 'string') metadata.action_level = data.action_level;
  if (typeof data.processed_at === 'string') metadata.processed_at = data.processed_at;
  if (typeof data.imageHash === 'string') metadata.imageHash = data.imageHash;
  
  // Handle the labels array specially
  if (Array.isArray(data.labels)) metadata.labels = data.labels;
  
  return metadata;
};
