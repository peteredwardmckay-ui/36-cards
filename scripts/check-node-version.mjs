const major = Number.parseInt(process.versions.node.split(".")[0] ?? "", 10);

if (!Number.isFinite(major) || major < 20 || major >= 23) {
  console.error("");
  console.error("Unsupported Node.js version for 36 Cards.");
  console.error(`Detected: v${process.versions.node}`);
  console.error("Required: >=20 and <23 (recommended: v22)");
  console.error("");
  console.error("Run:");
  console.error("  nvm install 22");
  console.error("  nvm use 22");
  console.error("");
  process.exit(1);
}
