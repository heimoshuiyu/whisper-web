import { formatFileSize } from "../utils/toBlobURL";

interface DownloadProgressProps {
  fileName: string;
  loaded: number;
  total: number;
  percentage: number;
  isVisible: boolean;
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({
  fileName,
  loaded,
  total,
  percentage,
  isVisible,
}) => {
  if (!isVisible) return null;

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
