import fs from "node:fs";
import path from "node:path";

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function isAsciiMostly(s) {
  // Treat strings with any CJK as non-ascii for our purposes
  return !/[\u4e00-\u9fff]/.test(s);
}

function fallbackTranslateZhToEn(zh) {
  // Minimal, deterministic fallback translations for common UI-ish labels.
  // Anything unknown stays as-is so we don't invent names incorrectly.
  const dict = new Map([
    ["精英", "Elite"],
    ["首领", "Boss"],
    ["小怪", "Mob"],
    ["副本Boss", "Dungeon Boss"],
    ["测试木桩", "Test Dummy"],
    ["通用木桩属性", "Generic Dummy"],
    ["虚拟体", "Phantom"],
    ["？？？", "???"],
    ["？？？？？", "?????"],
  ]);
  return dict.get(zh) ?? zh;
}

function updateMonsterNameFile({ monsterNamePath, monsterTableById }) {
  const monsterName = readJson(monsterNamePath);
  const updated = { ...monsterName };
  const matched = [];
  const unmatched = [];

  for (const [id, currentName] of Object.entries(monsterName)) {
    const entry = monsterTableById.get(String(id));
    if (entry?.Name && isAsciiMostly(entry.Name)) {
      updated[id] = entry.Name;
      matched.push(id);
    } else {
      updated[id] = fallbackTranslateZhToEn(currentName);
      if (!entry) unmatched.push(id);
    }
  }

  writeJson(monsterNamePath, updated);
  return { matchedCount: matched.length, unmatchedIds: unmatched };
}

// Run this script from the workspace root: `Resonance Logs project`
const repoRoot = process.cwd();
const zdpsMonsterTablePath = path.join(
  repoRoot,
  "BPSR-ZDPS",
  "BPSR-ZDPS",
  "Data",
  "MonsterTable.json",
);

const monsterNamePath = path.join(
  repoRoot,
  "cn-reso-logs-to-en",
  "src-tauri",
  "meter-data",
  "MonsterName.json",
);
const monsterNameBossPath = path.join(
  repoRoot,
  "cn-reso-logs-to-en",
  "src-tauri",
  "meter-data",
  "MonsterNameBoss.json",
);

const monsterTable = readJson(zdpsMonsterTablePath);
const monsterTableById = new Map(Object.entries(monsterTable).map(([k, v]) => [String(k), v]));

const r1 = updateMonsterNameFile({ monsterNamePath, monsterTableById });
const r2 = updateMonsterNameFile({ monsterNamePath: monsterNameBossPath, monsterTableById });

const reportPath = path.join(repoRoot, "cn-reso-logs-to-en", "scripts", "update-monster-names-from-zdps.report.json");
writeJson(reportPath, {
  monsterName: { matchedCount: r1.matchedCount, unmatchedCount: r1.unmatchedIds.length, unmatchedIds: r1.unmatchedIds },
  monsterNameBoss: { matchedCount: r2.matchedCount, unmatchedCount: r2.unmatchedIds.length, unmatchedIds: r2.unmatchedIds },
});

console.log(`Updated: ${path.relative(repoRoot, monsterNamePath)}`);
console.log(`Updated: ${path.relative(repoRoot, monsterNameBossPath)}`);
console.log(`Report:  ${path.relative(repoRoot, reportPath)}`);

