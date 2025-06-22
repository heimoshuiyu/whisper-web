import { SrtChunk } from "../types";

export const loadStringFromLocalStorageWithDefault = (
  key: string,
  defaultValue: string,
): string => {
  const value = window.localStorage.getItem(key);
  return value === null ? defaultValue : value;
};

export const mockStringStateUpdater =
  (key: string, setKey: any) => (e: string) => {
    window.localStorage.setItem(key, e);
    setKey(e);
  };

export const parseSrt = (srt: string): SrtChunk[] => {
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

export const buildSrt = (chunks: SrtChunk[]): string => {
  return chunks
    .map((chunk) => `${chunk.number}\n${chunk.time}\n${chunk.text}\n`)
    .join("\n");
};

export const getSampleTextFromSrt = (
  srt: string,
  maxChunks: number = 3,
): string => {
  if (!srt) return "";

  try {
    const chunks = parseSrt(srt);
    const sampleChunks = chunks.slice(0, maxChunks);

    if (sampleChunks.length === 0) return "";

    return sampleChunks
      .map((chunk) => `${chunk.number}: ${chunk.text}`)
      .join("\n");
  } catch (error) {
    console.error("Error parsing SRT for sample text:", error);
    return "";
  }
};
