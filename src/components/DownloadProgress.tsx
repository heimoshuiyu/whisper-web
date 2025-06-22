import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  if (!isVisible && !error) return null;

  // Show error message if there's an error
  if (error) {
    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-red-800">
            {t("downloadProgress.ffmpegError")}
          </span>
        </div>
        <div className="text-sm text-red-700 mb-2">
          {error === "SharedArrayBuffer not supported" ? (
            <div>
              <p className="mb-2">
                <strong>
                  {t("downloadProgress.sharedArrayBufferNotSupported")}
                </strong>
              </p>
              <p className="mb-2">{t("downloadProgress.typicalIssue")}</p>
              <p className="mb-2">
                <strong>{t("downloadProgress.solutions")}:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{t("downloadProgress.solution1")}</li>
                <li>{t("downloadProgress.solution2")}</li>
                <li>{t("downloadProgress.solution3")}</li>
                <li>{t("downloadProgress.solution4")}</li>
              </ul>
              <p className="mt-2 text-xs">
                <strong>{t("downloadProgress.note")}:</strong>{" "}
                {t("downloadProgress.noteText")}
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
    : `${formatFileSize(loaded)} ${t("downloadProgress.downloaded")} (${percentage}%)`;

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-800">
          {t("downloadProgress.downloading", { fileName })}
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
          {t("downloadProgress.fileSizeUnknown")}
        </div>
      )}
    </div>
  );
};

export default DownloadProgress;
