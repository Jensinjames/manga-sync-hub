
import { Json } from '@/integrations/supabase/types';
import { PanelLabel } from '@/contexts/pipeline/types';

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
  processing?: boolean | {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    started_at?: string;
    completed_at?: string;
  };
  error?: string | {
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
    } else if (typeof rawData.metadata.processing === 'boolean') {
      metadata.processing = rawData.metadata.processing;
    }
    
    // Extract error information
    if (rawData.metadata.error && typeof rawData.metadata.error === 'object') {
      metadata.error = rawData.metadata.error;
    } else if (typeof rawData.metadata.error === 'string') {
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

// Convert any data format to a structured PanelMetadata object
export const convertToMetadata = (data: any): PanelMetadata => {
  const metadata: PanelMetadata = {};
  
  if (!data) return metadata;
  
  // Handle labels array if present
  if (Array.isArray(data.labels)) {
    metadata.labels = data.labels;
  }
  
  // Handle processing status
  if (data.processing !== undefined) {
    metadata.processing = data.processing;
  }
  
  // Handle error information
  if (data.error !== undefined) {
    metadata.error = data.error;
  }
  
  // Map simple string and number properties
  const stringProps = ['content', 'scene_type', 'mood', 'action_level', 'processed_at', 'imageHash'] as const;
  stringProps.forEach(prop => {
    if (data[prop] !== undefined) {
      metadata[prop] = data[prop];
    }
  });
  
  // Handle character count
  if (data.character_count !== undefined) {
    metadata.character_count = Number(data.character_count);
  }
  
  return metadata;
};

// Convert the PanelMetadata labels to PanelLabel format for pipeline usage
export const convertLabelsForPipeline = (metadata: PanelMetadata): PanelLabel[] | undefined => {
  if (!metadata.labels) return undefined;
  
  return metadata.labels.map(label => ({
    label: label.class,
    confidence: label.confidence,
    x: label.x1,
    y: label.y1,
    width: label.x2 - label.x1,
    height: label.y2 - label.y1
  }));
};

// Helper to check if an error value has a string representation with length
export const errorHasLength = (error: string | { message: string; code: string; details?: any; } | undefined): boolean => {
  if (!error) return false;
  if (typeof error === 'string') return error.length > 0;
  if (typeof error === 'object' && error.message) return error.message.length > 0;
  return false;
};

// Helper to get error as string regardless of format
export const getErrorString = (error: string | { message: string; code: string; details?: any; } | undefined): string => {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error.message) return error.message;
  return 'Unknown error';
};
