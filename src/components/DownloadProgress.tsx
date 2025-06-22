import { formatFileSize } from "../utils/toBlobURL";

interface DownloadProgressProps {
  fileName: string;
  loaded: number;
  total: number;
  percentage: number;
  isVisible: boolean;
  error?: string | null;
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({
  fileName,
  loaded,
  total,
  percentage,
  isVisible,
  error,
}) => {
  if (!isVisible && !error) return null;

  // Show error message if there's an error
  if (error) {
    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-red-800">FFmpeg Error</span>
        </div>
        <div className="text-sm text-red-700 mb-2">
          {error === "SharedArrayBuffer not supported" ? (
            <div>
              <p className="mb-2">
                <strong>
                  SharedArrayBuffer is not supported in this environment.
                </strong>
              </p>
              <p className="mb-2">
                This typically happens when deploying to GitHub Pages or other
                static hosting services that don't support the required CORS
                headers.
              </p>
              <p className="mb-2">
                <strong>Solutions:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  Use the app locally (run{" "}
                  <code className="bg-gray-100 px-1 rounded">npm run dev</code>)
                </li>
                <li>
                  Deploy to a service that supports CORS headers (Vercel,
                  Netlify, etc.)
                </li>
                <li>Use a custom domain with proper CORS configuration</li>
                <li>
                  Disable FFmpeg processing in settings and upload pre-converted
                  audio files
                </li>
              </ul>
              <p className="mt-2 text-xs">
                <strong>Note:</strong> You can still use the app without FFmpeg
                by uploading audio files that are already in a compatible format
                (MP3, WAV, etc.).
              </p>
            </div>
          ) : (
            error
          )}
        </div>
      </div>
    );
  }

  const showTotal = total > 0;
  const progressText = showTotal
    ? `${formatFileSize(loaded)} / ${formatFileSize(total)} (${percentage}%)`
    : `${formatFileSize(loaded)} downloaded (${percentage}%)`;

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-800">
          Downloading {fileName}...
        </span>
        <span className="text-sm text-blue-600">{progressText}</span>
      </div>
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!showTotal && (
        <div className="mt-1 text-xs text-blue-600">
          File size unknown - showing estimated progress
        </div>
      )}
    </div>
  );
};

export default DownloadProgress;
