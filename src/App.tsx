import { useEffect, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { useTranslation } from "react-i18next";
import { AppProps } from "./types";
import { useLocalStorage } from "./hooks";
import { toBlobURL } from "./utils/toBlobURL";
// Components
import {
  Settings,
  Translation,
  FileUpload,
  ResponseFormat,
  ActionButtons,
  ProgressBar,
  ResultDisplay,
  DownloadProgress,
  WorkflowFlowchart,
  Modal,
  LanguageSwitcher,
} from "./components";

function App({ ffmpeg, isFFmpegReady, downloadProgress }: AppProps) {
  const { t } = useTranslation();
  const [result, setResult] = useState("");
  const [translatedResult, setTranslatedResult] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [useFFmpeg, setUseFFmpeg] = useState(true);
  const [keepOriginal, setKeepOriginal] = useState(true);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Local storage hooks
  const [selectResponseFormat, setSelectResponseFormat] = useLocalStorage(
    "response_format",
    "srt",
  );
  const [apiEndpoint, setApiEndpoint] = useLocalStorage(
    "api_endpoint",
    "https://a.yongyuancv.cn/v1/audio/transcriptions",
  );
  const [llmAPIEndpoint, setLlmAPIEndpoint] = useLocalStorage(
    "llm_api_endpoint",
    "https://api.openai.com/v1/chat/completions",
  );
  const [llmModel, setLlmModel] = useLocalStorage("llm_model", "gpt-4o-mini");
  const [llmKey, setLlmKey] = useLocalStorage(
    "llm_key",
    "OpenAI Auth Key (if needed)",
  );
  const [key, setKey] = useLocalStorage("api_key", "API Key (if needed)");
  const [language, setLanguage] = useLocalStorage("language", "");
  const [targetLanguage, setTargetLanguage] = useLocalStorage(
    "target_language",
    "English",
  );

  const setStdout = setResult;

  const transcribe = async (file: any) => {
    setStdout("Uploading to API...");
    setIsRunning(true);
    const form = new FormData();
    form.append("file", new Blob([file]), "audio.webm");
    form.append("response_format", selectResponseFormat);
    form.append("model", "whisper-1");
    if (language) {
      form.append("language", language);
    }
    const resp = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
      },
      body: form,
    });
    // streaming response
    let result = "";
    const reader = resp.body!.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        setIsRunning(false);
        break;
      }
      result = result + value;
      setResult(result);
    }
    setIsRunning(false);
  };

  const handleTranscribe = async () => {
    if (!file) {
      return;
    }

    // skip ffmpeg
    if (!useFFmpeg) {
      await transcribe(file);
      return;
    }

    setResult("");
    console.log("file is", file);
    const outputFile = file.name + ".webm";

    setStdout("Processing with ffmpeg.wasm...");
    setIsRunning(true);

    try {
      // Write the input file to ffmpeg's virtual filesystem
      await ffmpeg.writeFile(file.name, await fetchFile(file));

      // Execute ffmpeg command
      await ffmpeg.exec([
        "-i",
        file.name,
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
      ]);

      // Read the output file
      const data = await ffmpeg.readFile(outputFile);

      // Convert to transcribe
      await transcribe(data);
    } catch (error) {
      console.error("FFmpeg processing error:", error);
      setStdout(
        "Error: FFmpeg processing failed. Please check console for details.",
      );
      setIsRunning(false);
    }
  };

  return (
    <div className="relative">
      <h1 className="text-2xl font-bold mb-4">{t("app.title")}</h1>
      <p className="mb-2 text-gray-600">{t("app.subtitle")}</p>
      <p className="mb-4 text-sm text-gray-500">{t("app.description")}</p>

      <LanguageSwitcher />

      <button
        className="absolute top-0 right-0"
        onClick={() => setShowSettings(!showSettings)}
      >
        <img
          className="w-10 my-0 p-2 border rounded shadow bg-gray-200"
          src="settings.svg"
        />
      </button>

      <button
        className="absolute top-0 right-12"
        onClick={() => setShowWorkflow(!showWorkflow)}
        title="Toggle workflow explanation"
      >
        <svg
          className="w-10 h-10 p-2 border rounded shadow bg-gray-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </button>

      <WorkflowFlowchart isVisible={showWorkflow} />

      <p className="mb-4">
        {t("ffmpeg.status")}{" "}
        {isFFmpegReady ? (
          <span className="text-green-500">{t("ffmpeg.ready")}</span>
        ) : downloadProgress.error === "SharedArrayBuffer not supported" ? (
          <span className="text-red-500">{t("ffmpeg.notAvailable")}</span>
        ) : (
          <span className="text-red-500">{t("ffmpeg.loading")}</span>
        )}
      </p>

      <DownloadProgress
        fileName={downloadProgress.fileName}
        loaded={downloadProgress.loaded}
        total={downloadProgress.total}
        percentage={downloadProgress.percentage}
        isVisible={downloadProgress.isVisible}
        error={downloadProgress.error}
      />

      <ResponseFormat
        selectResponseFormat={selectResponseFormat}
        setSelectResponseFormat={setSelectResponseFormat}
      />

      <Settings
        showSettings={showSettings}
        apiEndpoint={apiEndpoint}
        setApiEndpoint={setApiEndpoint}
        key={key}
        setKey={setKey}
        language={language}
        setLanguage={setLanguage}
        useFFmpeg={useFFmpeg}
        setUseFFmpeg={setUseFFmpeg}
        onOpenModal={() => setIsModalOpen(true)}
      />

      <FileUpload file={file} setFile={setFile} />

      <ActionButtons
        useFFmpeg={useFFmpeg}
        isFFmpegReady={isFFmpegReady}
        file={file}
        isRunning={isRunning}
        result={result}
        onTranscribe={handleTranscribe}
      />

      <ProgressBar isRunning={isRunning} />

      <ResultDisplay result={result} translatedResult="" />

      <Translation
        result={result}
        selectResponseFormat={selectResponseFormat}
        targetLanguage={targetLanguage}
        setTargetLanguage={setTargetLanguage}
        keepOriginal={keepOriginal}
        setKeepOriginal={setKeepOriginal}
        llmAPIEndpoint={llmAPIEndpoint}
        setLlmAPIEndpoint={setLlmAPIEndpoint}
        llmKey={llmKey}
        setLlmKey={setLlmKey}
        llmModel={llmModel}
        setLlmModel={setLlmModel}
        translatedResult={translatedResult}
        setTranslatedResult={setTranslatedResult}
        translationProgress={translationProgress}
        setTranslationProgress={setTranslationProgress}
        isRunning={isRunning}
      />

      <ResultDisplay result="" translatedResult={translatedResult} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t("modal.whisperFastApi.title")}
            </h3>
            <p className="text-gray-600 mb-3">
              {t("modal.whisperFastApi.description")}
            </p>
            <a
              href="https://github.com/heimoshuiyu/whisper-fastapi/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              {t("modal.whisperFastApi.viewProject")}
            </a>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t("modal.contact.title")}
            </h3>
            <p className="text-gray-600 mb-3">
              {t("modal.contact.description")}
            </p>
            <div className="space-y-2">
              <a
                href="mailto:heimoshuiyu@gmail.com"
                className="block text-blue-500 hover:text-blue-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                📧 heimoshuiyu@gmail.com
              </a>
              <a
                href="https://matrix.to/#/@heimoshuiyu:miku.social"
                className="block text-blue-500 hover:text-blue-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 Matrix: @heimoshuiyu:miku.social
              </a>
              <a
                href="https://t.me/heimoshuiyu"
                className="block text-blue-500 hover:text-blue-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 Telegram: @heimoshuiyu
              </a>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t("modal.services.title")}
            </h3>
            <ul className="text-gray-600 space-y-1 list-disc list-inside">
              <li>{t("modal.services.items.api")}</li>
              <li>{t("modal.services.items.setup")}</li>
              <li>{t("modal.services.items.deployment")}</li>
              <li>{t("modal.services.items.consultation")}</li>
            </ul>
          </div>
        </div>
      </Modal>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
        <p>
          {t("footer.openSource")}{" "}
          <a
            href="https://github.com/heimoshuiyu/whisper-web/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {t("footer.github")}
          </a>
        </p>
      </div>
    </div>
  );
}

function Root() {
  const [ffmpeg] = useState(() => new FFmpeg());
  const [isFFmpegReady, setIsFFmpegReady] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({
    isVisible: false,
    fileName: "",
    loaded: 0,
    total: 0,
    percentage: 0,
    error: null as string | null,
  });

  const loadFFmpeg = async () => {
    try {
      // Check for SharedArrayBuffer support (required for ffmpeg.wasm)
      if (typeof SharedArrayBuffer === "undefined") {
        console.error("SharedArrayBuffer is not supported in this browser");
        console.error(
          "Error: SharedArrayBuffer is not supported. Please use a modern browser or enable cross-origin isolation.",
        );
        // Set a flag to indicate SharedArrayBuffer is not available
        setDownloadProgress((prev) => ({
          ...prev,
          isVisible: false,
          error: "SharedArrayBuffer not supported",
        }));
        return;
      }

      // Set up logging
      ffmpeg.on("log", ({ message }) => {
        console.log(message);
      });

      // Load ffmpeg core - use ESM version for better Vite compatibility
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";

      setDownloadProgress({
        isVisible: true,
        fileName: "ffmpeg-core.js",
        loaded: 0,
        total: 0,
        percentage: 0,
        error: null,
      });

      const coreURL = await toBlobURL(
        `${baseURL}/ffmpeg-core.js`,
        "text/javascript",
        {
          onProgress: (progress) => {
            setDownloadProgress((prev) => ({
              ...prev,
              fileName: "ffmpeg-core.js",
              loaded: progress.loaded,
              total: progress.total,
              percentage: progress.percentage,
            }));
          },
        },
      );

      setDownloadProgress((prev) => ({
        ...prev,
        fileName: "ffmpeg-core.wasm",
        loaded: 0,
        total: 0,
        percentage: 0,
      }));

      const wasmURL = await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
        {
          onProgress: (progress) => {
            setDownloadProgress((prev) => ({
              ...prev,
              fileName: "ffmpeg-core.wasm",
              loaded: progress.loaded,
              total: progress.total,
              percentage: progress.percentage,
            }));
          },
        },
      );

      await ffmpeg.load({
        coreURL,
        wasmURL,
      });

      setDownloadProgress((prev) => ({
        ...prev,
        isVisible: false,
        error: null,
      }));
      setIsFFmpegReady(true);
      console.log("FFmpeg loaded successfully");
    } catch (error) {
      console.error("Failed to load FFmpeg:", error);
      setDownloadProgress((prev) => ({
        ...prev,
        isVisible: false,
        error: "Failed to load FFmpeg",
      }));

      // Try fallback to UMD version if ESM fails
      try {
        console.log("Trying fallback to UMD version...");
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

        setDownloadProgress({
          isVisible: true,
          fileName: "ffmpeg-core.js (UMD)",
          loaded: 0,
          total: 0,
          percentage: 0,
          error: null,
        });

        const coreURL = await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript",
          {
            onProgress: (progress) => {
              setDownloadProgress((prev) => ({
                ...prev,
                fileName: "ffmpeg-core.js (UMD)",
                loaded: progress.loaded,
                total: progress.total,
                percentage: progress.percentage,
              }));
            },
          },
        );

        setDownloadProgress((prev) => ({
          ...prev,
          fileName: "ffmpeg-core.wasm (UMD)",
          loaded: 0,
          total: 0,
          percentage: 0,
        }));

        const wasmURL = await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm",
          {
            onProgress: (progress) => {
              setDownloadProgress((prev) => ({
                ...prev,
                fileName: "ffmpeg-core.wasm (UMD)",
                loaded: progress.loaded,
                total: progress.total,
                percentage: progress.percentage,
              }));
            },
          },
        );

        await ffmpeg.load({
          coreURL,
          wasmURL,
        });

        setDownloadProgress((prev) => ({
          ...prev,
          isVisible: false,
          error: null,
        }));
        setIsFFmpegReady(true);
        console.log("FFmpeg loaded successfully with UMD fallback");
      } catch (fallbackError) {
        console.error("Failed to load FFmpeg with fallback:", fallbackError);
        setDownloadProgress((prev) => ({
          ...prev,
          isVisible: false,
          error: "FFmpeg failed to load",
        }));
      }
    }
  };

  useEffect(() => {
    loadFFmpeg();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white rounded shadow-lg p-6">
        <App
          ffmpeg={ffmpeg}
          isFFmpegReady={isFFmpegReady}
          downloadProgress={downloadProgress}
        />
      </div>
    </div>
  );
}

export default Root;
