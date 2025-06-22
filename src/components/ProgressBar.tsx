interface ProgressBarProps {
  isRunning: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ isRunning }) => {
  if (!isRunning) return null;

  return (
    <div className="w-full max-w-full mx-auto my-4">
      <div className="rounded h-2 bg-blue-200 overflow-hidden">
        <div
          id="progressbar"
          className="rounded overflow-hidden h-full bg-gradient-to-r from-blue-200 via-blue-500 to-blue-200"
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
