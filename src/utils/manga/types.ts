
// Common types used across manga processing modules

export type Annotation = {
  image?: string;
  label: string;
  confidence?: number;
  bbox?: [number, number, number, number];
};

export type PredictionResult = {
  image?: string;
  image_id?: string;
  annotations: Annotation[];
};

export interface ModelClientOptions {
  onResult?: (result: PredictionResult) => void;
  onError?: (error: unknown) => void;
  meta?: {
    imageUrl: string;
    model_name: string;
    iou_threshold: number;
    score_threshold: number;
    allow_dynamic: boolean;
  };
}
