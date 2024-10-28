import fs from "fs";
import csv from "csv-parser";

function Output() {
  fs.createReadStream("data.csv")
    .pipe(csv({ separator: ";" }))
    .on("data", (data) => {
      console.log("Risk level:", data["Risk Rating"]);
      console.log(data["Vulnerability Title"]);
      console.log(data.Description.split("\n"));
      console.log(data["Impacted IP/URL"]);
      console.log(data["CVE-ID"]);
      console.log(data.Port);
      console.log(data["Risk Rating"]);
      console.log(data["CVSS v2.0 Base Score"]);
      console.log(data.Impact);
      console.log(data.Solutions);
      console.log(data.Reference);
    })
    .on("end", () => {
      console.log("Output Successfull");
    });
}

Output();
