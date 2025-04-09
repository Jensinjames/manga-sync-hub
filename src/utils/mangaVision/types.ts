
import { PanelLabel } from "@/contexts/pipeline/types";

export type MangaVisionAnnotation = {
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] format
  image?: string;
};

export type MangaVisionPredictionResult = {
  annotations: MangaVisionAnnotation[];
};

export interface MangaVisionConfig {
  spaceName: string;
  modelName: string;
  iouThreshold: number;
  scoreThreshold: number;
  allowDynamic: boolean;
}

export const DEFAULT_CONFIG: MangaVisionConfig = {
  spaceName: "Jensin/manga109_yolo",
  modelName: "v2023.12.07_n_yv11",
  iouThreshold: 0.7,
  scoreThreshold: 0.25,
  allowDynamic: true
};
