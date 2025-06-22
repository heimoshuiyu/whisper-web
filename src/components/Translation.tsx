import { TranslationProps } from "../types";
import { translateSrtParallel } from "../services/translation";
import { buildSrt } from "../utils/helpers";

const Translation: React.FC<TranslationProps> = ({
  result,
  selectResponseFormat,
  targetLanguage,
  setTargetLanguage,
  keepOriginal,
  setKeepOriginal,
  llmAPIEndpoint,
  setLlmAPIEndpoint,
  llmKey,
  setLlmKey,
  llmModel,
  setLlmModel,
  translatedResult,
  setTranslatedResult,
  translationProgress,
  setTranslationProgress,
}) => {
  if (!result || selectResponseFormat !== "srt") return null;

  const handleTranslate = async () => {
    if (!targetLanguage) {
      alert("Please enter target language!");
      return;
    }
    const translated = await translateSrtParallel(
      result,
      targetLanguage,
      keepOriginal,
      llmAPIEndpoint,
      llmKey,
      llmModel,
      setTranslationProgress,
    );
    setTranslatedResult(buildSrt(translated));
  };

  const handleCopyTranslation = () => {
    if (!translatedResult) {
      return;
    }
    if (!navigator.clipboard) {
      alert("Your browser does not support clipboard");
      return;
    }
    navigator.clipboard.writeText(translatedResult);
    alert(`Copied ${translatedResult.length} characters to clipboard`);
  };

  return (
    <div className="mt-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Translate to language:
      </label>
      <input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        value={targetLanguage}
        onChange={(e) => setTargetLanguage(e.target.value)}
      />
      <span className="my-4 w-full block">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Keep original text:
        </label>
        <input
          type="checkbox"
          checked={keepOriginal}
          onChange={(e) => setKeepOriginal(e.target.checked)}
        />
      </span>

      <span className="my-4 w-full block">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          LLM API endpoint:
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          value={llmAPIEndpoint}
          onChange={(e) => setLlmAPIEndpoint(e.target.value)}
        />
      </span>

      <span className="my-4 w-full block">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          LLM API key:
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          value={llmKey}
          onChange={(e) => setLlmKey(e.target.value)}
        />
      </span>

      <span className="my-4 w-full block">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          LLM model:
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          value={llmModel}
          onChange={(e) => setLlmModel(e.target.value)}
        />
      </span>

      <div className="mt-6 flex justify-between space-x-4">
        <button
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleTranslate}
        >
          Translate SRT
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleCopyTranslation}
        >
          Copy output to clipboard
        </button>
      </div>

      {translationProgress > 0 && (
        <div className="mt-2">
          Progress: {translationProgress}%
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-full bg-purple-500 rounded"
              style={{ width: `${translationProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Translation;
