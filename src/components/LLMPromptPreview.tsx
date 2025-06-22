interface LLMPromptPreviewProps {
  targetLanguage: string;
  sampleText: string;
  llmModel: string;
  isVisible: boolean;
}

const LLMPromptPreview: React.FC<LLMPromptPreviewProps> = ({
  targetLanguage,
  sampleText,
  llmModel,
  isVisible,
}) => {
  if (!isVisible || !targetLanguage) {
    return null;
  }

  const systemMessage = `Transcribe the following subtitle text line by line into ${targetLanguage}. Ensure that each translated line is corresponds exactly to the original line number`;

  const userMessage = sampleText || "Sample subtitle text will appear here...";

  const promptStructure = {
    model: llmModel,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-blue-800">
          LLM Prompt Preview
        </h4>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
          {llmModel}
        </span>
      </div>

      <div className="space-y-3">
        {/* System Message */}
        <div>
          <div className="flex items-center mb-2">
            <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
              System Message
            </span>
          </div>
          <div className="bg-white border border-blue-200 rounded p-3 text-sm text-gray-800">
            {systemMessage}
          </div>
        </div>

        {/* User Message */}
        <div>
          <div className="flex items-center mb-2">
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
              User Message
            </span>
          </div>
          <div className="bg-white border border-green-200 rounded p-3 text-sm text-gray-800 max-h-32 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans">{userMessage}</pre>
          </div>
        </div>

        {/* JSON Structure */}
        <div>
          <div className="flex items-center mb-2">
            <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
              Full Request Structure
            </span>
          </div>
          <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
            <pre>{JSON.stringify(promptStructure, null, 2)}</pre>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-blue-600">
        <p>
          <strong>Note:</strong> This preview shows the prompt structure that
          will be sent to the LLM API. The actual text content will be the SRT
          subtitles from your transcription.
        </p>
      </div>
    </div>
  );
};

export default LLMPromptPreview;
