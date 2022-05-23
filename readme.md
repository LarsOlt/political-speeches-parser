# Exercise: Political Speeches

The goal of this exercise is to calculate some statistics from given input data about
political speeches. The application should handle CSV files (UTF-8 encoded), structured
as below:

```
Speaker, Topic, Date, Words
Alexander Abel, Education Policy, 2012-10-30, 5310
Bernhard Belling, Coal Subsidies, 2012-11-05, 1210
Caesare Collins, Coal Subsidies, 2012-11-06, 1119
Alexander Abel, Internal Security, 2012-12-11, 911
```

The application should provide an HTTP endpoint which accepts one or more given
URLs (http and https) via query parameters at the path:

- GET /evaluation?url=url1&url=url2

The provided CSV files at these URLs should be downloaded, processed and evaluated
to answer the following questions:

1. Which politician gave the most speeches in 2013?
2. Which politician gave the most speeches on the topic „Internal Security"?
3. Which politician used the fewest words (in total)?

The answers should be provided as JSON. If a question cannot be answered or does not
have an unambiguous solution the result for this field should be null.
As an example, for the given input above the expected result is:

```json
{
  "mostSpeeches": null,
  "mostSecurity": "Alexander Abel",
  "leastWordy": "Caesare Collins"
}
```

## Documentation

Requirements:

- Installed Node.js version >= 7.5.0

Usage:

```
npm i
npm run start
```

The following endpoints are available:

- GET /evaluation?url=...&url=...
  - url: string | string[]
- GET /example-file?fileName=original.csv
  - Returns a file with example data
  - fileName?: "original.csv" | "testing.csv"
    - default: "testing.csv"

Example:

`GET: localhost:5000/evaluation?url=http://127.0.0.1:5000/example-file`
