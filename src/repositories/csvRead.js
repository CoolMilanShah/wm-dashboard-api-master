const parse = require("csv-parse");
const fs = require("fs");

export default function csvRead(filename, mycallback) {
  const res = [];

  fs.createReadStream(filename)
    .pipe(
      parse({
        columns: true,
        quote: '"',
        ltrim: true,
        rtrim: true,
        delimiter: ",",
        from_line: 1,
        relax: true
      })
    )
    .on("data", data => res.push(data))
    .on("end", () => {
      mycallback(res);
      return res;
    });
}
