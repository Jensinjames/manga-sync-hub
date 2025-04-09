
/**
 * Utility functions for handling images in the manga processing pipeline
 */

/**
 * Fetch an image from a URL and convert to a Blob
 */
export async function fetchImageBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch image blob");
  return await response.blob();
}

/**
 * Convert a data URL to a Blob
 */
export function dataURLToBlob(dataURL: string): Blob {
  const parts = dataURL.split(';base64,');
  if (parts.length !== 2) {
    throw new Error('Invalid data URL format');
  }

  const contentType = parts[0].split(':')[1];
  const raw = atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}
