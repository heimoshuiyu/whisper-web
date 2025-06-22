interface ActionButtonsProps {
  useFFmpeg: boolean;
  isFFmpegReady: boolean;
  file: File | null;
  isRunning: boolean;
  result: string;
  onTranscribe: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  useFFmpeg,
  isFFmpegReady,
  file,
  isRunning,
  result,
  onTranscribe,
}) => {
  const handleCopyResult = () => {
    if (!result) {
      return;
    }
    if (!navigator.clipboard) {
      alert("Your browser does not support clipboard");
      return;
    }
    navigator.clipboard.writeText(result);
    alert(`Copied ${result.length} characters to clipboard`);
  };

  return (
    <div className="mt-6 flex justify-between space-x-4">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={useFFmpeg && (!isFFmpegReady || !file || isRunning)}
        onClick={onTranscribe}
      >
        Transcribe
      </button>

      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={handleCopyResult}
      >
        Copy output to clipboard
      </button>
    </div>
  );
};

export default ActionButtons;
