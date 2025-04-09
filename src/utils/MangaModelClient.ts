
import { MangaModelClient as Client } from './manga/MangaModelClient';
import { useMangaClient as useClient } from './manga/useMangaClient';
import { PredictionResult, Annotation, ModelClientOptions } from './manga/types';
import { fetchImageBlob, dataURLToBlob } from './manga/imageUtils';

// Re-export the class, hooks, and types for backward compatibility
export type { PredictionResult, Annotation };
export type { ModelClientOptions as MangaModelClientOptions };
export const MangaModelClient = Client;
export const useMangaClient = useClient;
