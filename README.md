# A Web-Based Tool for Transcribing and Translating Media Subtitles via OpenAI's Whisper API

## Overview  

This is a web tool that utilizes OpenAI's Whisper API for transcribing and translating media subtitles. It operates without any custom backend beyond OpenAI's services.

## Key Features  

- **Preprocessing with ffmpeg.wasm**:  
  Reduces file size by converting media to 16kHz mono audio with libopus codec (64kbps bitrate), optimizing transmission speed to the API.  
  *(Note: ffmpeg.wasm may occasionally fail to process files; this feature can be disabled in settings.)*  
- **Multiple Output Formats**:  
  Supports plain text, SRT, VTT, and JSON transcription formats.  
- **LLM-Powered SRT Translation**:  
  Rapidly translates subtitles while preserving contextual coherence.  

## Translation Workflow  

1. **SRT Parsing**: Extracts and filters text content from SRT files.  
2. **Batch Processing**: Bundles multi-line subtitles into concurrent translation tasks.  
3. **LLM Optimization**: Leverages parallel API calls for speed (e.g., ~30 seconds for 2-hour subtitles).  
4. **Context Retention**: Maintains contextual flow for natural readability in translated output.  

## Deployment

### Important: SharedArrayBuffer Support

This application uses `ffmpeg.wasm` which requires `SharedArrayBuffer` support. This feature requires specific HTTP headers to be set by the hosting server:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

### Hosting Solutions

#### ✅ Recommended (Supports SharedArrayBuffer)
- **Vercel**: Works out of the box with proper CORS headers
- **Netlify**: Works out of the box with proper CORS headers
- **Custom domain with proper CORS configuration**
- **Local development**: Run `npm run dev` for full functionality

#### ⚠️ Limited Support (SharedArrayBuffer not available)
- **GitHub Pages**: Does not support the required CORS headers
  - The app will still work but FFmpeg processing will be disabled
  - Users can upload pre-converted audio files (MP3, WAV, etc.)
  - Enable "Skip FFmpeg" in settings for direct API upload

### Fallback Mode

When SharedArrayBuffer is not supported, the app automatically falls back to a limited mode:
- FFmpeg processing is disabled
- Users can still upload compatible audio files directly
- All other features (transcription, translation) remain functional

## Disclaimer:  

90% of the code (includeing this README) is LLM generated BS, don't dig into it, but hey — at least it works.