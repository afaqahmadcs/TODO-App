import { ESLint } from "eslint";

async function run() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(["src/**/*.{ts,tsx}"]);
  const formatter = await eslint.loadFormatter("stylish");
  const resultText = formatter.format(results);
  
  if (resultText) {
    console.log(resultText);
  }
  
  const errorCount = results.reduce((acc, r) => acc + r.errorCount, 0);
  const warningCount = results.reduce((acc, r) => acc + r.warningCount, 0);
  console.log(`[ESLint] Total errors: ${errorCount}, warnings: ${warningCount}`);
  process.exit(errorCount > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
