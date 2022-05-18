import { parse } from "csv-parse";
import fs from "fs";
import { Speech } from "./types";

export const parseCsv = <T>(readStream: fs.ReadStream): Promise<T[]> => {
  const data: T[] = [];

  // https://csv.js.org/parse/options/
  const parser = parse({
    delimiter: [","],
    columns: true,
    trim: true,
    cast: true,
  });

  readStream.pipe(parser);

  return new Promise((resolve, reject) => {
    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        data.push(record);
      }
    });

    parser.on("error", (err) => {
      reject(err);
    });

    parser.on("end", () => {
      resolve(data);
    });
  });
};

// FIXME: Return null if all values are identical
const getKeyWithBiggestValue = (obj: Record<string, number>) =>
  Object.keys(obj).reduce((prev, current) => (obj[prev] > obj[current] ? prev : current));

export const evaluateSpeeches = (data: Speech[]) => {
  const sortedByWords = data.sort((a, b) => a.Words - b.Words);

  const totalSpeechesPerSpeaker = data.reduce<{ [name: string]: number }>((prev, current) => {
    if (!prev[current.Speaker]) {
      prev[current.Speaker] = 0;
    }

    prev[current.Speaker]++;

    return prev;
  }, {});

  return {
    leastWordy: sortedByWords[0].Speaker,
    mostWordy: sortedByWords[sortedByWords.length - 1].Speaker,
    totalSpeechesPerSpeaker,
    mostSpeeches: getKeyWithBiggestValue(totalSpeechesPerSpeaker),
  };
};
