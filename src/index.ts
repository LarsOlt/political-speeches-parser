const PORT = 5000;
import express, { RequestHandler } from "express";
import { validationResult, param, query } from "express-validator";
import { downloadFiles, evaluateSpeeches, parseCsv } from "./lib";
import path from "path";
import fs from "fs/promises";

const app = express();

const validate: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

app.get("/evaluation", query("url").isURL({}), validate, async (req, res) => {
  const url = req.query.url;

  const urls = Array.isArray(url) ? url : [url];

  const fileContent = await downloadFiles(urls as string[]);

  let data: any[] = [];
  let errors: string[] = [];

  const fileLocations = fileContent.data?.fileLocations || [];

  for (const [i, file] of fileLocations.entries()) {
    try {
      const parsed = await parseCsv(file);

      if (parsed.length) {
        data = data.concat(parsed);
      }
    } catch (e) {
      errors.push(`Failed to parse the csv file from ${urls[i]}`);
    }

    await fs.rm(file);
  }

  if (!data.length) {
    return res.send({
      data: null,
      errors,
    });
  }

  const evaluation = await evaluateSpeeches(data);

  return res.send({
    data: evaluation,
    errors,
  });
});

app.get("/example-file", async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "test-data", "valid.csv"));
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
