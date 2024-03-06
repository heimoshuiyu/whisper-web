import { useEffect, useState } from "react";

function App({
  worker,
  isWorkerReady,
  setIsWorkerReady,
  ffmpeg_worker_js_path,
}: any) {
  const [result, setResult] = useState("");
  const setStdout = setResult;
  const [file, setFile] = useState<File | null>(null);
  const [selectResponseFormat, setSelectResponseFormat] = useState("text");
  const [isRunning, setIsRunning] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState(
    "https://yongyuancv.cn/v1/audio/transcriptions"
  );
  const [key, setKey] = useState("OpenAI Auth Key (if needed)");
  const [language, setLanguage] = useState("");
  const [useFFmpeg, setUseFFmpeg] = useState(true);

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
              return
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

      <div className="mt-6">
        <p className=" max-h-64 overflow-scroll whitespace-pre-wrap bg-gray-100 p-4 rounded border border-gray-300">
          {result}
        </p>
      </div>
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
