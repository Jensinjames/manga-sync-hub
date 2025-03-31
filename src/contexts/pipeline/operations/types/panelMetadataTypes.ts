
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
export const isMetadataObject = (data: Json): data is PanelMetadata => {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
};
