import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CJK = /[\p{Script=Han}，。！？；：“”‘’（）【】《》〈〉「」『』…]/u;
const HIDDEN = /[\u200B-\u200D\u2060\uFEFF]/u;
const MACHINE_TRANSLATION_PATTERNS = [
  /data will not be forced to be cut off/i,
  /^Poor$/,
  /If you don't want to flood/i,
  /The page is lost/i,
  /what do you call/i,
  /Please fill in/i,
  /Submit requirements/i,
  /delete this product/i,
  /\bgoods\b/i,
  /Hash rate market/i,
  /buried point/i,
  /current limiting/i,
  /grayscaled/i,
  /displays abnormally/i,
  /Demo occupancy/i,
  /global periphery/i,
  /\bWork order\b/i,
  /first-screen/i,
  /clear text logs/i,
  /privatized deployment/i,
  /Product pictures/i,
];

export function auditFixtureEnglish(copy) {
  const findings = [];
  for (const [source, english] of Object.entries(copy)) {
    let reason = "";
    if (typeof english !== "string" || english.trim() === "") reason = "empty value";
    else if (HIDDEN.test(english)) reason = "hidden character";
    else if (CJK.test(english)) reason = "CJK in English value";
    else {
      const pattern = MACHINE_TRANSLATION_PATTERNS.find((candidate) => candidate.test(english));
      if (pattern) reason = `machine-translation pattern ${pattern}`;
    }
    if (reason) findings.push({ source, english, reason });
  }
  return findings;
}

function main() {
  const maps = process.argv.slice(2);
  if (maps.length === 0) {
    maps.push(
      "apps/www/app/blocks/block-fixtures.en.json",
      "apps/www/app/pages/page-fixtures.en.json",
    );
  }
  const findings = maps.flatMap((file) =>
    auditFixtureEnglish(JSON.parse(readFileSync(resolve(file), "utf8"))).map((finding) => ({
      file,
      ...finding,
    })),
  );
  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(
        `[fixture-english] ${finding.file}: ${JSON.stringify(finding.source)} -> ${JSON.stringify(finding.english)} (${finding.reason})`,
      );
    }
    process.exitCode = 1;
    return;
  }
  console.log(`[fixture-english] ${maps.length} canonical maps passed`);
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) main();
