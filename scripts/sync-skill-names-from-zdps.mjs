#!/usr/bin/env node
/**
 * Fix all skill names in Resonance Logs to match ZDPS (reference only, no file copy).
 * - Builds effectId → skillId from ZDPS SkillFightLevelTable
 * - Builds skillId → Name from ZDPS SkillTable + SkillOverrides
 * - Updates RecountTable.json RecountName for every entry that can be resolved
 * - Updates class_skill_configs.json name/derivedName for all skills
 *
 * ZDPS path: set ZDPS_DATA env, or script assumes sibling repo at ../BPSR-ZDPS/BPSR-ZDPS/Data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ZDPS_DATA =
  process.env.ZDPS_DATA ||
  path.resolve(ROOT, '../BPSR-ZDPS/BPSR-ZDPS/Data');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function damageIdToEffectId(damageId) {
  if (damageId < 1000000) return damageId;
  return Math.floor((damageId % 100000000) / 100);
}

function buildEffectToSkill(zdpsData) {
  const table = loadJson(path.join(zdpsData, 'SkillFightLevelTable.json'));
  const map = new Map();
  for (const [id, entry] of Object.entries(table)) {
    if (entry.SkillId != null) map.set(parseInt(id, 10), entry.SkillId);
  }
  return map;
}

function buildSkillNameMap(zdpsData) {
  const skillTable = loadJson(path.join(zdpsData, 'SkillTable.json'));
  const overrides = loadJson(path.join(zdpsData, 'SkillOverrides.en.json'));
  const map = new Map();

  for (const [id, entry] of Object.entries(skillTable)) {
    const name = entry.Name && entry.Name !== '场地标记01' ? entry.Name : entry.NameDesign;
    if (name) map.set(parseInt(id, 10), name);
  }

  for (const [id, entry] of Object.entries(overrides)) {
    if (entry.Name) map.set(parseInt(id, 10), entry.Name);
  }

  // SkillLevelGroup fallback: if a skill still has a CJK name, try using
  // the base skill name from its SkillLevelGroup (stripping "- Stage N" suffixes).
  for (const [id, entry] of Object.entries(skillTable)) {
    const numId = parseInt(id, 10);
    const current = map.get(numId);
    if (!current || !hasCJK(current)) continue;

    const slg = overrides[id]?.SkillLevelGroup ?? entry.SkillLevelGroup;
    if (!slg || slg === numId) continue;

    const baseName = map.get(slg);
    if (baseName && !hasCJK(baseName)) {
      map.set(numId, baseName.replace(/\s*-\s*Stage\s+\d+$/i, ''));
    }
  }

  return map;
}

function hasCJK(str) {
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(str);
}

function updateRecountTable(effectToSkill, skillNames) {
  const recountPath = path.join(ROOT, 'src/lib/config/RecountTable.json');
  const recount = loadJson(recountPath);
  let updated = 0;
  const otherId = 294;

  for (const entry of Object.values(recount)) {
    if (entry.Id === otherId || !entry.DamageId?.length) continue;
    const names = [];
    for (const did of entry.DamageId) {
      const effectId = damageIdToEffectId(did);

      // Try effectId directly first (SkillTable/Overrides often have
      // fight-level entries with more specific English names)
      const effectName = skillNames.get(effectId);
      if (effectName && !hasCJK(effectName)) { names.push(effectName); continue; }

      // Fall back to resolved skillId
      const skillId = effectToSkill.get(effectId);
      const name = skillId != null ? skillNames.get(skillId) : null;
      if (name && !hasCJK(name)) names.push(name);
    }
    if (names.length > 0) {
      const name = names[0];
      if (entry.RecountName !== name) {
        entry.RecountName = name;
        updated++;
      }
    }
  }
  fs.writeFileSync(recountPath, JSON.stringify(recount, null, 2) + '\n', 'utf8');
  console.log('RecountTable.json: updated', updated, 'RecountNames from ZDPS');
}

function updateClassSkillConfigs(skillNames) {
  const configPath = path.join(ROOT, 'src/lib/config/class_skill_configs.json');
  const config = loadJson(configPath);
  let updated = 0;
  for (const classEntry of Object.values(config)) {
    if (classEntry.skills) {
      for (const skill of classEntry.skills) {
        const name = skillNames.get(skill.skillId);
        if (name && skill.name !== name) {
          skill.name = name;
          updated++;
        }
      }
    }
    if (classEntry.derivations) {
      for (const d of classEntry.derivations) {
        const name = skillNames.get(d.derivedSkillId);
        if (name && d.derivedName !== name) {
          d.derivedName = name;
          updated++;
        }
      }
    }
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
  console.log('class_skill_configs.json: updated', updated, 'names');
}

if (!fs.existsSync(ZDPS_DATA)) {
  console.error('ZDPS Data not found at', ZDPS_DATA);
  console.error('Set ZDPS_DATA env to the BPSR-ZDPS/Data path, or ensure ZDPS repo is at ../BPSR-ZDPS');
  process.exit(1);
}

const effectToSkill = buildEffectToSkill(ZDPS_DATA);
const skillNames = buildSkillNameMap(ZDPS_DATA);
console.log('ZDPS: effectToSkill size', effectToSkill.size, ', skill names size', skillNames.size);

updateRecountTable(effectToSkill, skillNames);
updateClassSkillConfigs(skillNames);
