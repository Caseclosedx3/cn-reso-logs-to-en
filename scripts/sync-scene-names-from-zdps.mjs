#!/usr/bin/env node
/**
 * Sync meter-data SceneName.json names from ZDPS SceneTable.json by scene ID.
 *
 * Source of truth:
 *   ../BPSR-ZDPS/BPSR-ZDPS/Data/SceneTable.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const sceneNamePath = path.join(ROOT, "src-tauri", "meter-data", "SceneName.json");
const zdpsSceneTablePath = path.resolve(ROOT, "..", "BPSR-ZDPS", "BPSR-ZDPS", "Data", "SceneTable.json");
const reportPath = path.join(ROOT, "scripts", "sync-scene-names-from-zdps.report.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

if (!fs.existsSync(zdpsSceneTablePath)) {
  console.error(`ZDPS SceneTable not found: ${zdpsSceneTablePath}`);
  process.exit(1);
}

const sceneName = readJson(sceneNamePath);
const sceneTable = readJson(zdpsSceneTablePath);

const updated = { ...sceneName };
const changed = [];
const unchanged = [];
const missingInSource = [];
const blankInSource = [];

for (const [id, currentName] of Object.entries(sceneName)) {
  const source = sceneTable[id];

  if (!source) {
    missingInSource.push(id);
    continue;
  }

  const sourceName = source.Name ?? "";
  if (!sourceName) {
    blankInSource.push(id);
    continue;
  }

  if (currentName !== sourceName) {
    updated[id] = sourceName;
    changed.push({ id, from: currentName, to: sourceName });
  } else {
    unchanged.push(id);
  }
}

writeJson(sceneNamePath, updated);
writeJson(reportPath, {
  changedCount: changed.length,
  unchangedCount: unchanged.length,
  missingInSourceCount: missingInSource.length,
  blankInSourceCount: blankInSource.length,
  changed,
  missingInSource,
  blankInSource,
});

console.log(`Updated: ${path.relative(ROOT, sceneNamePath)}`);
console.log(`Report:  ${path.relative(ROOT, reportPath)}`);
console.log(`Changed: ${changed.length}, Unchanged: ${unchanged.length}`);
