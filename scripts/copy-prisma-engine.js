// scripts/copy-prisma-engine.js
import fs from "fs";
import path from "path";

const rootDir = process.cwd();

// Detect if we're on Vercel (where node_modules is at /vercel/path0/node_modules)
const nodeModulesPath = fs.existsSync(path.join(rootDir, "node_modules"))
  ? path.join(rootDir, "node_modules")
  : "/vercel/path0/node_modules";

const prismaClientDirs = [
  path.join(nodeModulesPath, ".pnpm"),
  path.join(nodeModulesPath, "@prisma/client"),
  path.join(nodeModulesPath, ".prisma/client"),
];

let found = false;

for (const dir of prismaClientDirs) {
  if (!fs.existsSync(dir)) continue;

  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.name.includes("libquery_engine") && file.name.endsWith(".so.node")) {
        const source = path.join(dir, file.name);
        const target = path.join(
          rootDir,
          "packages/database/src/generated/prisma",
          file.name
        );
        fs.copyFileSync(source, target);
        console.log(`✅ Copied Prisma engine from ${source} → ${target}`);
        found = true;
        break;
      }
    }
  } catch (err) {
    console.warn(`Skipping ${dir}: ${err.message}`);
  }

  if (found) break;
}

if (!found) {
  console.error("❌ Prisma engine file not found in any known directory!");
  process.exit(1);
}
