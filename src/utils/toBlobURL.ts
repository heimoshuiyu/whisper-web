interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface ToBlobURLOptions {
  onProgress?: (progress: DownloadProgress) => void;
  mimeType?: string;
}

export const toBlobURL = async (
  url: string,
  mimeType?: string,
  options: ToBlobURLOptions = {},
): Promise<string> => {
  const { onProgress } = options;

  try {
    console.log(`Starting download of: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentLength = response.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    console.log(`Content-Length header: ${contentLength}, Total: ${total}`);

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    let lastProgressUpdate = 0;

    // Call onProgress immediately with initial state
    if (onProgress) {
      onProgress({
        loaded: 0,
        total,
        percentage: 0,
      });
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      chunks.push(value);
      loaded += value.length;

      // Update progress with throttling to make it more visible
      if (onProgress) {
        const now = Date.now();
        const shouldUpdate =
          total > 0
            ? now - lastProgressUpdate > 100 // Update every 100ms if we have total
            : loaded % 10240 === 0 || now - lastProgressUpdate > 200; // Update every 10KB or 200ms if no total

        if (shouldUpdate) {
          const percentage =
            total > 0
              ? Math.round((loaded / total) * 100)
              : Math.min(95, Math.round((loaded / (1024 * 1024)) * 10)); // Estimate based on 1MB chunks

          console.log(
            `Download progress: ${formatFileSize(loaded)}${total > 0 ? ` / ${formatFileSize(total)}` : ""} (${percentage}%)`,
          );

          onProgress({
            loaded,
            total,
            percentage,
          });

          lastProgressUpdate = now;
        }
      }
    }

    // Final progress update
    if (onProgress) {
      onProgress({
        loaded,
        total,
        percentage: 100,
      });
    }

    console.log(`Download completed: ${formatFileSize(loaded)}`);

    // Combine all chunks
    const blob = new Blob(chunks, { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
