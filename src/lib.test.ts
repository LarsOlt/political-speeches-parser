import { evaluateSpeeches, parseCsv } from "./lib";
import path from "path";
import fs from "fs";
import { Speech } from "./types";

const readStream = fs.createReadStream(path.join(__dirname, "..", "test-data", "valid.csv"));
let parsedCsv: Speech[] = [];
let evaluation: ReturnType<typeof evaluateSpeeches>;

const expectedData: Speech[] = [
  {
    Speaker: "Alexander Abel",
    Topic: "Education Policy",
    Date: "2012-10-30",
    Words: 5310,
  },
  {
    Speaker: "Bernhard Belling",
    Topic: "Coal Subsidies",
    Date: "2012-11-05",
    Words: 1210,
  },

  {
    Speaker: "Caesare Collins",
    Topic: "Coal Subsidies",
    Date: "2012-11-06",
    Words: 6119,
  },
  {
    Speaker: "Alexander Abel",
    Topic: "Internal Security",
    Date: "2012-12-11",
    Words: 911,
  },
];

beforeAll(async () => {
  parsedCsv = await parseCsv(readStream);
  evaluation = evaluateSpeeches(parsedCsv);
});

describe("CSV Parser", () => {
  it("should correctly parse csv file", () => {
    expect(parsedCsv).toIncludeAllMembers(expectedData);
  });
});

describe("evaluateSpeeches", () => {
  test("leastWordy", () => {
    expect(evaluation.leastWordy).toBe("Alexander Abel");
  });

  test("mostWordy", () => {
    expect(evaluation.mostWordy).toBe("Caesare Collins");
  });

  test("totalSpeechesPerSpeaker", () => {
    expect(evaluation.totalSpeechesPerSpeaker).toStrictEqual({
      "Alexander Abel": 2,
      "Bernhard Belling": 1,
      "Caesare Collins": 1,
    });
  });

  test("mostSpeeches", () => {
    expect(evaluation.mostSpeeches).toBe("Alexander Abel");
  });
});
