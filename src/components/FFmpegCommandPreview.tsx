interface FFmpegCommandPreviewProps {
  fileName: string | null;
  useFFmpeg: boolean;
  isFFmpegReady: boolean;
}

const FFmpegCommandPreview: React.FC<FFmpegCommandPreviewProps> = ({
  fileName,
  useFFmpeg,
  isFFmpegReady,
}) => {
  if (!useFFmpeg || !fileName) {
    return null;
  }

  const outputFile = fileName + ".webm";
  const ffmpegCommand = [
    "ffmpeg",
    "-i",
    fileName,
    "-vn",
    "-ar",
    "16000",
    "-ac",
    "1",
    "-c:a",
    "libopus",
    "-b:a",
    "64k",
    outputFile,
  ];

  const commandString = ffmpegCommand.join(" ");

  return (
    <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-800">
          FFmpeg Command Preview
        </span>
        <span
          className={`text-xs px-2 py-1 rounded ${
            isFFmpegReady
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {isFFmpegReady ? "Ready" : "Loading..."}
        </span>
      </div>
      <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm overflow-x-auto">
        <code>{commandString}</code>
      </div>
      <div className="mt-2 text-xs text-gray-600">
        <p>
          <strong>Parameters:</strong>
        </p>
        <ul className="list-disc list-inside ml-2 space-y-1">
          <li>
            <code>-i {fileName}</code>: Input file
          </li>
          <li>
            <code>-vn</code>: No video (audio only)
          </li>
          <li>
            <code>-ar 16000</code>: Audio sample rate 16kHz
          </li>
          <li>
            <code>-ac 1</code>: Mono audio (1 channel)
          </li>
          <li>
            <code>-c:a libopus</code>: Audio codec (Opus)
          </li>
          <li>
            <code>-b:a 64k</code>: Audio bitrate 64kbps
          </li>
          <li>
            <code>{outputFile}</code>: Output file
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FFmpegCommandPreview;
