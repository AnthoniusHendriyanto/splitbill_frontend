
const { ESLint } = require("eslint");
const path = require("path");

async function run() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles([path.resolve("src/App.jsx")]);
  const formatter = await eslint.loadFormatter("stylish");
  const resultText = formatter.format(results);
  process.stdout.write(resultText);
}

run().catch(console.error);
