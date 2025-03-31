
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
  
  // Handle direct metadata object or metadata nested in a property
  const metadataSource = data.metadata || data;
  
  // Safely assign each property with appropriate type checking
  if (typeof metadataSource.processing === 'boolean') metadata.processing = metadataSource.processing;
  if (typeof metadataSource.error === 'string') metadata.error = metadataSource.error;
  if (typeof metadataSource.content === 'string') metadata.content = metadataSource.content;
  if (typeof metadataSource.scene_type === 'string') metadata.scene_type = metadataSource.scene_type;
  if (typeof metadataSource.character_count === 'number') metadata.character_count = metadataSource.character_count;
  if (typeof metadataSource.mood === 'string') metadata.mood = metadataSource.mood;
  if (typeof metadataSource.action_level === 'string') metadata.action_level = metadataSource.action_level;
  if (typeof metadataSource.processed_at === 'string') metadata.processed_at = metadataSource.processed_at;
  if (typeof metadataSource.imageHash === 'string') metadata.imageHash = metadataSource.imageHash;
  
  // Handle the labels array specially
  if (Array.isArray(metadataSource.labels)) metadata.labels = metadataSource.labels;
  
  return metadata;
};
