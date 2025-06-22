import { parseSrt } from "../utils/helpers";

export const translateChunk = async (
  text: string,
  lang: string,
  llmAPIEndpoint: string,
  llmKey: string,
  llmModel: string,
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
          content: `Transcribe the following subtitle text line by line into ${lang}. Ensure that each translated line is corresponds exactly to the original line number. Do not add any additional text or comments. Response format: <number>: <translated text> and seperate each by 2 new lines`,
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

export const translateSrtParallel = async (
  srt: string,
  lang: string,
  keep: boolean,
  llmAPIEndpoint: string,
  llmKey: string,
  llmModel: string,
  setTranslationProgress: (progress: number) => void,
) => {
  const chunks = parseSrt(srt);
  const batchSize = 5;
  const batches = [];

  // Create batches
  for (let i = 0; i < chunks.length; i += batchSize) {
    batches.push(chunks.slice(i, i + batchSize));
  }

  let completed = 0;
  const results = await Promise.all(
    batches.map(async (batch, index) => {
      try {
        const batchText = batch.map((c) => c.text).join("\n\n");
        const translated = await translateChunk(
          batchText,
          lang,
          llmAPIEndpoint,
          llmKey,
          llmModel,
        );
        completed += batch.length;
        setTranslationProgress(Math.round((completed / chunks.length) * 100));
        return { index, translated };
      } catch (error) {
        console.error("Translation failed:", error);
        return { index, translated: "" }; // Add error handling
      }
    }),
  );

  // Merge results
  const translatedChunks = batches.flatMap((batch, i) => {
    let translation: String = results.find((r) => r.index === i)!.translated;

    return batch.map((chunk, j) => ({
      ...chunk,
      text: keep
        ? `${chunk.text}\n${translation.split("\n\n")[j].replace(/^\d+: /, "") || ""}`
        : translation.split("\n\n")[j].replace(/^d+: /, "") || "",
    }));
  });

  return translatedChunks;
};
