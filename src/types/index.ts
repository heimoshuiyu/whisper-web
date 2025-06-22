import { FFmpeg } from "@ffmpeg/ffmpeg";

export interface SrtChunk {
  number: string;
  time: string;
  text: string;
}

export interface AppProps {
  ffmpeg: FFmpeg;
  isFFmpegReady: boolean;
  setIsFFmpegReady?: (ready: boolean) => void;
}

export interface SettingsProps {
  showSettings: boolean;
  apiEndpoint: string;
  setApiEndpoint: (value: string) => void;
  key: string;
  setKey: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  useFFmpeg: boolean;
  setUseFFmpeg: (value: boolean) => void;
}

export interface TranslationProps {
  result: string;
  selectResponseFormat: string;
  targetLanguage: string;
  setTargetLanguage: (value: string) => void;
  keepOriginal: boolean;
  setKeepOriginal: (value: boolean) => void;
  llmAPIEndpoint: string;
  setLlmAPIEndpoint: (value: string) => void;
  llmKey: string;
  setLlmKey: (value: string) => void;
  llmModel: string;
  setLlmModel: (value: string) => void;
  translatedResult: string;
  setTranslatedResult: (value: string) => void;
  translationProgress: number;
  setTranslationProgress: (value: number) => void;
}
