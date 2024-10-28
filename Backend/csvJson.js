import fs from "fs";
import csv from "csv-parser";

function processCsvToJson() {
  const results = [];

  fs.createReadStream("data.csv")
    .pipe(csv({ separator: ";" }))
    .on("data", (data) => {
      const processedData = {
        title: data["Vulnerability Title"],
        description: data.Description.split("\n"),
        ip: data["Impacted IP/URL"],
        cveId: data["CVE-ID"] ? data["CVE-ID"].split(",")[0] : "",
        port: parseInt(data.Port, 10),
        riskLevel: mapRiskLevel(data["Risk Rating"]),
        cvssScore: parseFloat(data["CVSS v2.0 Base Score"]) || null,
        impact: data.Impact.split("\n"),
        recommendations: data.Solutions.split("\n"),
        references: data.Reference ? data.Reference.split(",") : [],
      };
      results.push(processedData);
    })
    .on("end", () => {
      fs.writeFileSync("output.json", JSON.stringify(results, null, 2));
      console.log("Data processed and written to output.json successfully!");
    });
}

function mapRiskLevel(riskRating) {
  switch (riskRating) {
    case "None":
      return 0;
    case "Low":
      return 1;
    case "Medium":
      return 2;
    case "High":
      return 3;
    case "Critical":
      return 4;
    default:
      return null;
  }
}

processCsvToJson();
