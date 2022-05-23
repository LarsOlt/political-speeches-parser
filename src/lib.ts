import { parse, Parser } from "csv-parse";
import fs from "fs";
import { Speech } from "./types";
import https from "https";
import http from "http";
import path from "path";
import { nanoid } from "nanoid";

export const parseCsv = <T>(filePath: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    let parser: Parser;
    const data: T[] = [];

    // https://csv.js.org/parse/options/
    parser = parse({
      delimiter: [","],
      columns: true,
      trim: true,
      cast: true,
    });

    const readStream = fs.createReadStream(filePath);

    readStream.pipe(parser);

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

const biggestValue = (obj: Record<string, number>) => {
  return Object.keys(obj).filter((x) => {
    return obj[x] === Math.max.apply(null, Object.values(obj));
  });
};

const smallestValue = (obj: Record<string, number>) => {
  return Object.keys(obj).filter((x) => {
    return obj[x] === Math.min.apply(null, Object.values(obj));
  });
};

export const evaluateSpeeches = (data: Speech[]) => {
  const getTotalPerSpeaker = (data: Speech[], type: "Speeches" | "Words") => {
    return data.reduce<{ [speaker: string]: number }>((prev, current) => {
      if (!prev[current.Speaker]) {
        prev[current.Speaker] = 0;
      }

      prev[current.Speaker] += type === "Speeches" ? 1 : current[type];

      return prev;
    }, {});
  };

  const securitySpeeches = Object.values(data).filter(
    (val) => val.Topic.toLowerCase() === "internal security"
  );
  const speechesIn2013 = Object.values(data).filter((val) => val.Date.includes("2013"));

  const totalSpeechesPerSpeaker = getTotalPerSpeaker(data, "Speeches");

  const totalWordsPerSpeaker = getTotalPerSpeaker(data, "Words");

  return {
    totalSpeechesPerSpeaker,
    totalWordsPerSpeaker,
    leastWordy: smallestValue(totalWordsPerSpeaker),
    mostWordy: biggestValue(totalWordsPerSpeaker),
    mostSpeeches: biggestValue(totalSpeechesPerSpeaker),
    mostSpeechesIn2013: biggestValue(getTotalPerSpeaker(speechesIn2013, "Speeches")),
    mostSecurity: biggestValue(getTotalPerSpeaker(securitySpeeches, "Speeches")),
  };
};

interface DownloadFilesResponse {
  errors: null | string[];
  data: {
    fileLocations: string[];
  } | null;
}

const downloadFile = (url: string): Promise<{ error?: string; fileLocation?: string }> =>
  new Promise((resolve) => {
    const fileLocation = path.join(process.cwd(), `${nanoid()}.csv`);

    const fileStream = fs.createWriteStream(fileLocation, { encoding: "utf8" });

    const protocol = new URL(url).protocol === "https:" ? https : http;

    protocol.get(url, (res) => {
      if (res.statusCode != 200) {
        return resolve({ error: `Received status code ${res.statusCode} from the url ${url}` });
      }

      res.pipe(fileStream);

      // after download completed close filestream
      fileStream.on("finish", () => {
        fileStream.close();
        console.log("Download Completed");
        resolve({ fileLocation });
      });
    });
  });

export const downloadFiles = async (urls: string[]): Promise<DownloadFilesResponse> => {
  const results = await Promise.all(urls.map((url) => downloadFile(url)));

  const merged = results.reduce<DownloadFilesResponse>(
    (prev, current) => {
      if (current.error) {
        if (!prev.errors) {
          prev.errors = [];
        }
        prev.errors.push(current.error);
      }

      if (current.fileLocation) {
        if (!prev.data) {
          prev.data = { fileLocations: [] };
        }
        prev.data.fileLocations.push(current.fileLocation);
      }

      return prev;
    },
    {
      errors: null,
      data: null,
    }
  );

  return merged;
};
