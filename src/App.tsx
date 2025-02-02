import { useEffect, useState } from "react";

function App({
  worker,
  isWorkerReady,
  setIsWorkerReady,
  ffmpeg_worker_js_path,
}: any) {
  const loadStringFromLocalStorageWithDefault = (
    key: string,
    defaultValue: string
  ) => {
    const value = window.localStorage.getItem(key);
    return value === null ? defaultValue : value;
  };

  const mockStringStateUpdater = (key: string, setKey: any) => (e: string) => {
    window.localStorage.setItem(key, e);
    setKey(e);
  };

  const [result, setResult] = useState("");
  const [translatedResult, setTranslatedResult] = useState("");
  const setStdout = setResult;
  const [file, setFile] = useState<File | null>(null);

  const [selectResponseFormat, _setSelectResponseFormat] = useState(
    loadStringFromLocalStorageWithDefault("response_format", "text")
  );
  const setSelectResponseFormat = mockStringStateUpdater(
    "response_format",
    _setSelectResponseFormat
  );

  const [isRunning, setIsRunning] = useState(false);

  const [apiEndpoint, _setApiEndpoint] = useState(
    loadStringFromLocalStorageWithDefault(
      "api_endpoint",
      "https://yongyuancv.cn/v1/audio/transcriptions"
    )
  );
  const setApiEndpoint = mockStringStateUpdater(
    "api_endpoint",
    _setApiEndpoint
  );

  const [llmAPIEndpoint, _setLlmAPIEndpoint] = useState(
    loadStringFromLocalStorageWithDefault(
      "llm_api_endpoint",
      "https://api.openai.com/v1/chat/completions"
    )
  );
  const setLlmAPIEndpoint = mockStringStateUpdater(
    "llm_api_endpoint",
    _setLlmAPIEndpoint
  );

  const [llmModel, _setLlmModel] = useState(
    loadStringFromLocalStorageWithDefault("llm_model", "gpt-4o-mini")
  );
  const setLlmModel = mockStringStateUpdater("llm_model", _setLlmModel);

  const [llmKey, _setLlmKey] = useState(
    loadStringFromLocalStorageWithDefault(
      "llm_key",
      "OpenAI Auth Key (if needed)"
    )
  );
  const setLlmKey = mockStringStateUpdater("llm_key", _setLlmKey);

  const [key, _setKey] = useState(
    loadStringFromLocalStorageWithDefault("api_key", "API Key (if needed)")
  );
  const setKey = mockStringStateUpdater("api_key", _setKey);

  const [language, _setLanguage] = useState(
    loadStringFromLocalStorageWithDefault("language", "")
  );
  const setLanguage = mockStringStateUpdater("language", _setLanguage);

  const [useFFmpeg, setUseFFmpeg] = useState(true);

  const [targetLanguage, _setTargetLanguage] = useState(
    loadStringFromLocalStorageWithDefault("target_language", "English")
  );
  const setTargetLanguage = mockStringStateUpdater(
    "target_language",
    _setTargetLanguage
  );

  const [keepOriginal, setKeepOriginal] = useState(true);
  const [translationProgress, setTranslationProgress] = useState(0);

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

  const [showSettings, setShowSettings] = useState(false);

  interface SrtChunk {
    number: string;
    time: string;
    text: string;
  }

  const parseSrt = (srt: string): SrtChunk[] => {
    return srt
      .split("\n\n")
      .filter((chunk) => chunk.trim())
      .map((chunk) => {
        const lines = chunk.split("\n");
        return {
          number: lines[0],
          time: lines[1],
          text: lines.slice(2).join("\n"),
        };
      });
  };

  const buildSrt = (chunks: SrtChunk[]): string => {
    return chunks
      .map((chunk) => `${chunk.number}\n${chunk.time}\n${chunk.text}\n`)
      .join("\n");
  };

  const translateChunk = async (
    text: string,
    lang: string
  ): Promise<string> => {
    const response = await fetch(llmAPIEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${llmKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: llmModel,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `Transcribe the following subtitle text line by line into ${lang}. Ensure that each translated line is corresponds exactly to the original line number`,
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const translateSrtParallel = async (
    srt: string,
    lang: string,
    keep: boolean
  ) => {
    const chunks = parseSrt(srt);
    const batchSize = 5;
    const batches = [];

    // 创建批次
    for (let i = 0; i < chunks.length; i += batchSize) {
      batches.push(chunks.slice(i, i + batchSize));
    }

    let completed = 0;
    const results = await Promise.all(
      batches.map(async (batch, index) => {
        try {
          const batchText = batch.map((c) => c.text).join("\n\n");
          const translated = await translateChunk(batchText, lang);
          completed += batch.length;
          setTranslationProgress(Math.round((completed / chunks.length) * 100));
          return { index, translated };
        } catch (error) {
          console.error("Translation failed:", error);
          return { index, translated: "" }; // 添加错误处理
        }
      })
    );

    // 合并结果
    const translatedChunks = batches.flatMap((batch, i) => {
      const translation = results.find((r) => r.index === i)!.translated;
      return batch.map((chunk, j) => ({
        ...chunk,
        text: keep
          ? `${chunk.text}\n${translation.split("\n\n")[j] || ""}`
          : translation.split("\n\n")[j] || "",
      }));
    });

    return translatedChunks;
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
      <div className="my-4 settings">
        <span className="my-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Response format:
          </label>
          <select
            id="response_format"
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            value={selectResponseFormat}
            onChange={(e) => setSelectResponseFormat(e.target.value)}
          >
            <option value="text">Text</option>
            <option value="srt">SRT</option>
            <option value="vtt">VTT</option>
            <option value="stream">stream</option>
            <option value="json">JSON</option>
          </select>
        </span>
      </div>

      {showSettings && (
        <div className="my-4 settings">
          <span className="my-4">
            <label className="my-4 block text-gray-700 text-sm font-bold mb-2">
              API endpoint:
              <a
                className="ml-2 text-blue-500 underline"
                href="https://github.com/heimoshuiyu/whisper-fastapi/"
                target="_blank"
              >
                How to host your own whisper backend
              </a>
            </label>
            <input
              spellCheck={false}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
            />
          </span>
          <span className="my-4">
            <label className="my-4 block text-gray-700 text-sm font-bold mb-2">
              API key:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </span>
          <span className="my-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Language: (leave blank for auto-detect)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </span>
          <span className="my-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Use FFmpeg.js:
            </label>
            <input
              type="checkbox"
              checked={useFFmpeg}
              onChange={(e) => setUseFFmpeg(e.target.checked)}
            />
          </span>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Select file:
        </label>
        <input
          id="file_input"
          type="file"
          accept="audio/*,video/*"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onChange={(e) => {
            if (e.target.files) {
              setFile(e.target.files[0]);
            }
          }}
        />
      </div>

      <div className="mt-6 flex justify-between space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={useFFmpeg && (!isWorkerReady || !file || isRunning)}
          onClick={async () => {
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
          }}
        >
          Transcribe
        </button>

        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => {
            if (!result) {
              return;
            }
            if (!navigator.clipboard) {
              alert("Your browser does not support clipboard");
              return;
            }
            navigator.clipboard.writeText(result);
            alert(`Copied ${result.length} characters to clipboard`);
          }}
        >
          Copy output to clipboard
        </button>
      </div>

      {isRunning && (
        <div className="w-full max-w-full mx-auto my-4">
          <div className="rounded h-2 bg-blue-200 overflow-hidden">
            <div
              id="progressbar"
              className="rounded overflow-hidden h-full bg-gradient-to-r from-blue-200 via-blue-500 to-blue-200"
            ></div>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6">
          <p className=" max-h-64 overflow-scroll whitespace-pre-wrap bg-gray-100 p-4 rounded border border-gray-300">
            {result}
          </p>
        </div>
      )}

      {result && selectResponseFormat === "srt" && !isRunning && (
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
              onClick={async () => {
                if (!targetLanguage) {
                  alert("Please enter target language!");
                  return;
                }
                const translated = await translateSrtParallel(
                  result,
                  targetLanguage,
                  keepOriginal
                );
                setTranslatedResult(buildSrt(translated));
              }}
            >
              Translate SRT
            </button>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => {
                if (!result) {
                  return;
                }
                if (!navigator.clipboard) {
                  alert("Your browser does not support clipboard");
                  return;
                }
                navigator.clipboard.writeText(translatedResult);
                alert(
                  `Copied ${translatedResult.length} characters to clipboard`
                );
              }}
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
      )}

      {translatedResult && (
        <div className="mt-6">
          <p className=" max-h-64 overflow-scroll whitespace-pre-wrap bg-gray-100 p-4 rounded border border-gray-300">
            {translatedResult}
          </p>
        </div>
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
      res.text()
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
