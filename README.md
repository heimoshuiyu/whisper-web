# A Web-Based Tool for Transcribing and Translating Media Subtitles via OpenAI's Whisper API

## Overview  

This is a web tool that utilizes OpenAI's Whisper API for transcribing and translating media subtitles. It operates without any custom backend beyond OpenAI's services.

## Key Features  

- **Preprocessing with ffmpeg.js**:  
  Reduces file size by converting media to 16kHz mono audio with libopus codec (64kbps bitrate), optimizing transmission speed to the API.  
  *(Note: ffmpeg.js may occasionally fail to process files; this feature can be disabled in settings.)*  
- **Multiple Output Formats**:  
  Supports plain text, SRT, VTT, and JSON transcription formats.  
- **LLM-Powered SRT Translation**:  
  Rapidly translates subtitles while preserving contextual coherence.  

## Translation Workflow  

1. **SRT Parsing**: Extracts and filters text content from SRT files.  
2. **Batch Processing**: Bundles multi-line subtitles into concurrent translation tasks.  
3. **LLM Optimization**: Leverages parallel API calls for speed (e.g., ~30 seconds for 2-hour subtitles).  
4. **Context Retention**: Maintains contextual flow for natural readability in translated output.  

## Disclaimer:  

90% of the code (includeing this README) is LLM generated BS, don't dig into it, but hey — at least it works.