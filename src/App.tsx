import { useEffect, useState } from "react";
import { AppProps } from "./types";
import { useLocalStorage } from "./hooks";
// Components
import {
  Settings,
  Translation,
  FileUpload,
  ResponseFormat,
  ActionButtons,
  ProgressBar,
  ResultDisplay,
} from "./components";

function App({
  worker,
  isWorkerReady,
  setIsWorkerReady,
  ffmpeg_worker_js_path,
}: AppProps) {
  const [result, setResult] = useState("");
  const [translatedResult, setTranslatedResult] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [useFFmpeg, setUseFFmpeg] = useState(true);
  const [keepOriginal, setKeepOriginal] = useState(true);
  const [translationProgress, setTranslationProgress] = useState(0);

  // Local storage hooks
  const [selectResponseFormat, setSelectResponseFormat] = useLocalStorage(
    "response_format",
    "text",
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

  if (worker !== null) {
    worker.onmessage = function (e: any) {
      const msg = e.data;
      console.log(`[${msg.type}] ${msg.data}`);
      switch (msg.type) {
        case "ready":
          setIsWorkerReady(true);
          break;
        case "stdout":
          setStdout(msg.data);
          break;
        case "stderr":
          setStdout(msg.data);
          break;
        case "done":
          console.log("done", msg);
          if (msg.data.MEMFS.length === 0) {
            setStdout("Error: please check F12 console");
            setIsRunning(false);
            break;
          }

          transcribe(msg.data.MEMFS[0].data);
          break;
      }
    };
  }

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
    let fileData = await file.arrayBuffer();
    const outputFile = file.name + ".webm";

    setStdout("Compiling ffmpeg.js...");
    setIsRunning(true);

    // read file data
    worker.postMessage({
      type: "run",
      MEMFS: [{ name: file.name, data: fileData }],
      arguments: [
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
      ],
    });
  };

  return (
    <div className="relative">
      <h1 className="text-2xl font-bold mb-4">Whisper Web</h1>
      <p className="mb-2">Transcribe your media</p>

      <p className="mb-4">
        FFmpeg worker status:{" "}
        {isWorkerReady ? (
          <span className="text-green-500">Ready</span>
        ) : (
          <span className="text-red-500">
            Loading from {ffmpeg_worker_js_path}
          </span>
        )}
      </p>

      <button
        className="absolute top-0 right-0"
        onClick={() => setShowSettings(!showSettings)}
      >
        <img
          className="w-10 my-2 p-2 border rounded shadow bg-gray-200"
          src="settings.svg"
        />
      </button>

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
      />

      <FileUpload file={file} setFile={setFile} />

      <ActionButtons
        useFFmpeg={useFFmpeg}
        isWorkerReady={isWorkerReady}
        file={file}
        isRunning={isRunning}
        result={result}
        onTranscribe={handleTranscribe}
      />

      <ProgressBar isRunning={isRunning} />

      <ResultDisplay result={result} translatedResult={translatedResult} />

      {result && selectResponseFormat === "srt" && !isRunning && (
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
        />
      )}
    </div>
  );
}

function Root() {
  const ffmpeg_worker_js_path =
    "https://cdn.jsdelivr.net/npm/ffmpeg.js@4.2.9003/ffmpeg-worker-webm.js";
  const [worker, setWorker] = useState<any>(null);
  const loadWorker = async () => {
    const jsContent = await fetch(ffmpeg_worker_js_path).then((res) =>
      res.text(),
    );
    const blob = new Blob([jsContent], { type: "application/javascript" });
    setWorker(new Worker(window.URL.createObjectURL(blob)));
  };
  useEffect(() => {
    loadWorker();
  }, []);
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  console.log("worker created");

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white rounded shadow-lg p-6">
        <App
          worker={worker}
          ffmpeg_worker_js_path={ffmpeg_worker_js_path}
          isWorkerReady={isWorkerReady}
          setIsWorkerReady={setIsWorkerReady}
        />
      </div>
    </div>
  );
}

export default Root;
