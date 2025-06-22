import React from "react";

interface WorkflowFlowchartProps {
  isVisible?: boolean;
}

const WorkflowFlowchart: React.FC<WorkflowFlowchartProps> = ({
  isVisible = true,
}) => {
  if (!isVisible) return null;

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 transition-all duration-300 ease-in-out">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        How Whisper Web Works
      </h2>

      <div className="flex justify-center overflow-x-auto">
        <svg
          width="800"
          height="400"
          viewBox="0 0 800 400"
          className="w-full max-w-4xl min-w-[600px]"
        >
          {/* Background */}
          <rect width="800" height="400" fill="transparent" />

          {/* Flowchart boxes */}
          {/* Step 1: File Upload */}
          <rect
            x="50"
            y="50"
            width="120"
            height="60"
            rx="8"
            fill="#3B82F6"
            stroke="#1E40AF"
            strokeWidth="2"
          />
          <text
            x="110"
            y="85"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            Media File Upload
          </text>
          <text x="110" y="100" textAnchor="middle" fill="white" fontSize="10">
            (Any FFmpeg format)
          </text>

          {/* Arrow 1 */}
          <path
            d="M 170 80 L 200 80"
            stroke="#6B7280"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />

          {/* Step 2: FFmpeg Processing */}
          <rect
            x="220"
            y="50"
            width="120"
            height="60"
            rx="8"
            fill="#10B981"
            stroke="#059669"
            strokeWidth="2"
          />
          <text
            x="280"
            y="85"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            FFmpeg (WASM)
          </text>
          <text x="280" y="100" textAnchor="middle" fill="white" fontSize="10">
            Audio Compression
          </text>

          {/* Arrow 2 */}
          <path
            d="M 340 80 L 370 80"
            stroke="#6B7280"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />

          {/* Step 3: API Upload */}
          <rect
            x="390"
            y="50"
            width="120"
            height="60"
            rx="8"
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth="2"
          />
          <text
            x="450"
            y="85"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            Upload to API
          </text>
          <text x="450" y="100" textAnchor="middle" fill="white" fontSize="10">
            OpenAI Whisper
          </text>

          {/* Arrow 3 */}
          <path
            d="M 510 80 L 540 80"
            stroke="#6B7280"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />

          {/* Step 4: Transcription */}
          <rect
            x="560"
            y="50"
            width="120"
            height="60"
            rx="8"
            fill="#8B5CF6"
            stroke="#7C3AED"
            strokeWidth="2"
          />
          <text
            x="620"
            y="85"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            Transcription
          </text>
          <text x="620" y="100" textAnchor="middle" fill="white" fontSize="10">
            Text Output
          </text>

          {/* Conditional path for SRT format */}
          <path
            d="M 620 110 L 620 140"
            stroke="#6B7280"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />

          {/* Decision diamond */}
          <polygon
            points="620,160 640,180 620,200 600,180"
            fill="#FEF3C7"
            stroke="#F59E0B"
            strokeWidth="2"
          />
          <text
            x="620"
            y="185"
            textAnchor="middle"
            fill="#92400E"
            fontSize="11"
            fontWeight="bold"
          >
            SRT Format?
          </text>

          {/* Yes path */}
          <path
            d="M 640 180 L 680 180"
            stroke="#6B7280"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
          <text
            x="660"
            y="175"
            textAnchor="middle"
            fill="#6B7280"
            fontSize="10"
            fontWeight="bold"
          >
            Yes
          </text>

          {/* Translation step */}
          <rect
            x="700"
            y="160"
            width="120"
            height="60"
            rx="8"
            fill="#EC4899"
            stroke="#DB2777"
            strokeWidth="2"
          />
          <text
            x="760"
            y="185"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            LLM Translation
          </text>
          <text x="760" y="200" textAnchor="middle" fill="white" fontSize="10">
            Batch Processing
          </text>

          {/* No path */}
          <path
            d="M 620 200 L 620 280"
            stroke="#6B7280"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
          <text
            x="625"
            y="240"
            textAnchor="middle"
            fill="#6B7280"
            fontSize="10"
            fontWeight="bold"
          >
            No
          </text>

          {/* Final result */}
          <rect
            x="560"
            y="300"
            width="120"
            height="60"
            rx="8"
            fill="#059669"
            stroke="#047857"
            strokeWidth="2"
          />
          <text
            x="620"
            y="335"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            Final Result
          </text>
          <text x="620" y="350" textAnchor="middle" fill="white" fontSize="10">
            Text/Translation
          </text>

          {/* Arrow from translation to final result */}
          <path
            d="M 760 220 L 680 300"
            stroke="#6B7280"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />

          {/* Arrowhead marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Key Features:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Supports any media format that FFmpeg can process</li>
            <li>Local audio compression using FFmpeg WebAssembly</li>
            <li>Secure transcription via OpenAI Whisper API</li>
            <li>Batch translation for SRT subtitles with context awareness</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Benefits:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>No server-side processing required</li>
            <li>Privacy-focused: audio processing happens locally</li>
            <li>High-quality transcription with multiple output formats</li>
            <li>Intelligent translation with subtitle context preservation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorkflowFlowchart;
