
// Re-export everything from the new modular structure
// This maintains backward compatibility with existing code

import { 
  MangaVisionClient, 
  useMangaVisionClient, 
  MangaVisionConverter,
  DEFAULT_CONFIG
} from './mangaVision';

import type { 
  MangaVisionAnnotation, 
  MangaVisionPredictionResult, 
  MangaVisionConfig 
} from './mangaVision/types';

// Re-export types for backward compatibility
export type { 
  MangaVisionAnnotation, 
  MangaVisionPredictionResult, 
  MangaVisionConfig 
};

// Re-export constants
export { DEFAULT_CONFIG };

// Re-export the class and hook
export { MangaVisionClient };
export { useMangaVisionClient };

// For backward compatibility with code using MangaVisionClient.convertToPanelLabels
export const convertToPanelLabels = MangaVisionConverter.convertToPanelLabels;
