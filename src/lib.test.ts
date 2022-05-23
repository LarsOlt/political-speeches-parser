import path from "path";
import { evaluateSpeeches, parseCsv } from "./lib";
import { Speech } from "./types";

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
    Words: 9119,
  },
  {
    Speaker: "Alexander Abel",
    Topic: "Internal Security",
    Date: "2012-12-11",
    Words: 911,
  },
  {
    Speaker: "Bernhard Belling",
    Topic: "Internal Security",
    Date: "2013-11-05",
    Words: 3123,
  },
];

beforeAll(async () => {
  parsedCsv = await parseCsv(path.join(__dirname, "..", "test-data", "testing.csv"));
  evaluation = evaluateSpeeches(parsedCsv);
});

describe("parseCsv", () => {
  it("should correctly parse csv file", () => {
    expect(parsedCsv).toIncludeAllMembers(expectedData);
  });
});

describe("evaluateSpeeches", () => {
  test("totalSpeechesPerSpeaker", () => {
    expect(evaluation.totalSpeechesPerSpeaker).toStrictEqual({
      "Alexander Abel": 2,
      "Bernhard Belling": 2,
      "Caesare Collins": 1,
    });
  });

  test("totalWordsPerSpeaker", () => {
    expect(evaluation.totalWordsPerSpeaker).toStrictEqual({
      "Alexander Abel": 6221,
      "Bernhard Belling": 4333,
      "Caesare Collins": 9119,
    });
  });

  test("leastWordy", () => {
    expect(evaluation.leastWordy).toStrictEqual(["Bernhard Belling"]);
  });

  test("mostWordy", () => {
    expect(evaluation.mostWordy).toStrictEqual(["Caesare Collins"]);
  });

  test("mostSpeeches", () => {
    expect(evaluation.mostSpeeches).toStrictEqual(["Alexander Abel", "Bernhard Belling"]);
  });

  test("mostSpeechesIn2013", () => {
    expect(evaluation.mostSpeechesIn2013).toStrictEqual(["Bernhard Belling"]);
  });
  test("mostSecurity", () => {
    expect(evaluation.mostSecurity).toStrictEqual(["Alexander Abel", "Bernhard Belling"]);
  });
});
