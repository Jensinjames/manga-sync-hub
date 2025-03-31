
import { Json } from '@/integrations/supabase/types';

// Define the structure of a panel metadata record as returned from the database
export interface PanelMetadataRecord {
  id: string;
  panel_id: string;
  metadata: any; // This will be parsed from the jsonb column
  created_at?: string;
  updated_at?: string;
  action_level?: string;
  content?: string;
  scene_type?: string;
  mood?: string;
  character_count?: number;
}

// Define the expected structure of metadata for a panel
export interface PanelMetadata {
  labels?: {
    class: string;
    confidence: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }[];
  processing?: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    started_at?: string;
    completed_at?: string;
  };
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  content?: string;
  scene_type?: string;
  character_count?: number;
  mood?: string;
  action_level?: string;
  processed_at?: string;
  imageHash?: string;
}

// Function to transform raw metadata from the database into a structured format
export const transformMetadata = (rawData: PanelMetadataRecord | null): PanelMetadata | null => {
  if (!rawData) return null;
  
  const metadata: PanelMetadata = {};
  
  // If the raw data has a metadata property that is an object
  if (rawData.metadata && typeof rawData.metadata === 'object') {
    // Extract labels if they exist
    if (Array.isArray(rawData.metadata.labels)) {
      metadata.labels = rawData.metadata.labels;
    }
    
    // Extract processing status
    if (rawData.metadata.processing && typeof rawData.metadata.processing === 'object') {
      metadata.processing = rawData.metadata.processing;
    }
    
    // Extract error information
    if (rawData.metadata.error && typeof rawData.metadata.error === 'object') {
      metadata.error = rawData.metadata.error;
    }
    
    // Extract content
    if ('content' in rawData.metadata) {
      metadata.content = rawData.metadata.content as string;
    }
    
    // Extract scene type
    if ('scene_type' in rawData.metadata) {
      metadata.scene_type = rawData.metadata.scene_type as string;
    }
    
    // Extract character count
    if ('character_count' in rawData.metadata) {
      metadata.character_count = rawData.metadata.character_count as number;
    }
    
    // Extract mood
    if ('mood' in rawData.metadata) {
      metadata.mood = rawData.metadata.mood as string;
    }
    
    // Extract action level
    if ('action_level' in rawData.metadata) {
      metadata.action_level = rawData.metadata.action_level as string;
    }
    
    // Extract processed timestamp
    if ('processed_at' in rawData.metadata) {
      metadata.processed_at = rawData.metadata.processed_at as string;
    }
    
    // Extract image hash
    if ('imageHash' in rawData.metadata) {
      metadata.imageHash = rawData.metadata.imageHash as string;
    }
  }
  
  // Add direct properties from the record
  if (rawData.content) metadata.content = rawData.content;
  if (rawData.scene_type) metadata.scene_type = rawData.scene_type;
  if (rawData.character_count) metadata.character_count = rawData.character_count;
  if (rawData.mood) metadata.mood = rawData.mood;
  if (rawData.action_level) metadata.action_level = rawData.action_level;
  
  return metadata;
};
