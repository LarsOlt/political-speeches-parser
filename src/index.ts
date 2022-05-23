const PORT = 5000;
import express, { RequestHandler } from "express";
import { query, validationResult } from "express-validator";
import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { downloadFiles, evaluateSpeeches, parseCsv } from "./lib";

const app = express();

const validate: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

app.get("/evaluation", query("url").isURL({}), validate, async (req, res) => {
  try {
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
  } catch (e) {
    res.status(500).send({
      errors: ["Something went wrong"],
    });
  }
});

app.get(
  "/example-file",
  query("fileName").matches(".+\\.csv$").optional(),
  validate,
  async (req, res) => {
    try {
      let fileName = "testing.csv";

      if (typeof req.query.fileName === "string") {
        fileName = req.query.fileName;
      }

      const filePath = path.join(__dirname, "..", "test-data", fileName);

      if (!existsSync(filePath)) {
        return res.send({
          errors: [`File ${fileName} not found`],
        });
      }

      return res.sendFile(filePath);
    } catch (e) {
      res.status(500).send({
        errors: ["Something went wrong"],
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
