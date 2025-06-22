import { TranslationProps } from "../types";
import { translateSrtParallel } from "../services/translation";
import { buildSrt, getSampleTextFromSrt } from "../utils/helpers";
import LLMPromptPreview from "./LLMPromptPreview";

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
  isRunning,
}) => {
  // Determine if translation is available
  const canTranslate = result && selectResponseFormat === "srt" && !isRunning;

  // Get the reason why translation is disabled
  const getDisabledReason = () => {
    if (!result) return "No transcription result available";
    if (selectResponseFormat !== "srt")
      return `Translation only works with SRT format (current: ${selectResponseFormat})`;
    if (isRunning) return "Transcription in progress";
    return null;
  };

  const disabledReason = getDisabledReason();

  // Get sample text for prompt preview
  const sampleText = getSampleTextFromSrt(result);

  const handleTranslate = async () => {
    if (!canTranslate) return;

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
    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Translation</h3>
        {!canTranslate && disabledReason && (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
            ⚠️ {disabledReason}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Translate to language:
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              !canTranslate ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            type="text"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            disabled={!canTranslate}
            placeholder="e.g., Spanish, French, German..."
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Keep original text:
          </label>
          <input
            type="checkbox"
            checked={keepOriginal}
            onChange={(e) => setKeepOriginal(e.target.checked)}
            disabled={!canTranslate}
            className={!canTranslate ? "cursor-not-allowed opacity-50" : ""}
          />
          <span className="ml-2 text-sm text-gray-600">
            Keep original text alongside translation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              LLM API endpoint:
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                !canTranslate ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              type="text"
              value={llmAPIEndpoint}
              onChange={(e) => setLlmAPIEndpoint(e.target.value)}
              disabled={!canTranslate}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              LLM API key:
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                !canTranslate ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              type="text"
              value={llmKey}
              onChange={(e) => setLlmKey(e.target.value)}
              disabled={!canTranslate}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              LLM model:
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                !canTranslate ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              type="text"
              value={llmModel}
              onChange={(e) => setLlmModel(e.target.value)}
              disabled={!canTranslate}
            />
          </div>
        </div>

        {/* LLM Prompt Preview */}
        <LLMPromptPreview
          targetLanguage={targetLanguage}
          sampleText={sampleText}
          llmModel={llmModel}
          isVisible={Boolean(canTranslate && targetLanguage)}
        />

        <div className="flex justify-between space-x-4">
          <button
            className={`font-bold py-2 px-4 rounded transition-colors ${
              canTranslate
                ? "bg-purple-500 hover:bg-purple-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleTranslate}
            disabled={!canTranslate}
          >
            {canTranslate ? "Translate SRT" : "Translate SRT (Disabled)"}
          </button>
          <button
            className={`font-bold py-2 px-4 rounded transition-colors ${
              translatedResult
                ? "bg-green-500 hover:bg-green-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleCopyTranslation}
            disabled={!translatedResult}
          >
            Copy output to clipboard
          </button>
        </div>

        {translationProgress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Translation Progress</span>
              <span>{translationProgress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-full bg-purple-500 rounded transition-all duration-300"
                style={{ width: `${translationProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {!canTranslate && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Translation Requirements:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-1 list-disc list-inside space-y-1">
              <li>Transcription must be completed</li>
              <li>Response format must be set to "SRT"</li>
              <li>LLM API credentials must be configured</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Translation;
