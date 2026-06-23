import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "package.json",
  "package-lock.json",
  "server.js",
  "Swiss-Invest v2.dc.html",
  "support.js",
  "assets/logo-light.svg",
  "assets/logo-dark.svg"
];

const missing = [];
for (const file of requiredFiles) {
  try {
    await access(file);
  } catch {
    missing.push(file);
  }
}

const major = Number.parseInt(process.versions.node.split(".")[0], 10);
const supportedNode = major === 24 || major === 25;
const packageJson = JSON.parse(await readFile("package.json", "utf8"));

console.log(`Node.js: ${process.version}`);
console.log(`Declared engine: ${packageJson.engines.node}`);
console.log(`Required files: ${requiredFiles.length - missing.length}/${requiredFiles.length}`);

if (!supportedNode) {
  console.warn("Run the production deployment on Node.js 24 or 25.");
}

if (missing.length > 0) {
  console.error(`Missing deployment files:\n- ${missing.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("Deployment file check passed.");
}
