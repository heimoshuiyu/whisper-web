interface ResultDisplayProps {
  result: string;
  translatedResult: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  translatedResult,
}) => {
  return (
    <>
      {result && (
        <div className="mt-6">
          <p className="max-h-64 overflow-scroll whitespace-pre-wrap bg-gray-100 p-4 rounded border border-gray-300">
            {result}
          </p>
        </div>
      )}

      {translatedResult && (
        <div className="mt-6">
          <p className="max-h-64 overflow-scroll whitespace-pre-wrap bg-gray-100 p-4 rounded border border-gray-300">
            {translatedResult}
          </p>
        </div>
      )}
    </>
  );
};

export default ResultDisplay;
