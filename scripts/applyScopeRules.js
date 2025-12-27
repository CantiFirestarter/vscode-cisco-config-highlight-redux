#!/usr/bin/env node

/**
 * Script to apply token scope rules from textMateRules.json to VS Code settings.json
 *
 * Usage: node scripts/applyScopeRules.js [--settings-path <path>] [--rules-path <path>]
 *
 * Options:
 *   --settings-path   Path to settings.json (default: .vscode/settings.json)
 *   --rules-path      Path to textMateRules.json (default: syntaxes/textMateRules.json)
 *   --output          Path to output file (default: overwrites settings.json)
 *   --dry-run         Show changes without writing
 */

const fs = require("fs");
const path = require("path");

// Parse command line arguments
const args = process.argv.slice(2);
const argMap = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    const key = args[i].substring(2);
    argMap[key] = args[i + 1] || true;
    if (args[i + 1] && !args[i + 1].startsWith("--")) {
      i++;
    }
  }
}

const settingsPath = argMap["settings-path"] || ".vscode/settings.json";
const rulesPath = argMap["rules-path"] || "syntaxes/textMateRules.json";
const outputPath = argMap["output"] || settingsPath;
const dryRun = argMap["dry-run"] !== undefined;

function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    // Remove comments before parsing
    const cleaned = content
      .replace(/\/\/.*?$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    return JSON.parse(cleaned);
  } catch (err) {
    console.error(`Error loading ${filePath}:`, err.message);
    process.exit(1);
  }
}

function mergeRules(settings, rules) {
  if (!settings["editor.tokenColorCustomizations"]) {
    settings["editor.tokenColorCustomizations"] = {};
  }

  const customizations = settings["editor.tokenColorCustomizations"];

  // Merge general textMateRules
  if (rules["editor.tokenColorCustomizations"]["textMateRules"]) {
    if (!customizations["textMateRules"]) {
      customizations["textMateRules"] = [];
    }

    // Create a map for existing rules by scope for deduplication
    const existingRulesMap = new Map(
      customizations["textMateRules"].map((rule) => [rule.scope, rule]),
    );

    // Add or update rules
    rules["editor.tokenColorCustomizations"]["textMateRules"].forEach(
      (newRule) => {
        existingRulesMap.set(newRule.scope, newRule);
      },
    );

    // Convert back to array
    customizations["textMateRules"] = Array.from(existingRulesMap.values());
  }

  return settings;
}

function main() {
  console.log(`Loading token scope rules from: ${rulesPath}`);
  const rules = loadJSON(rulesPath);

  console.log(`Loading settings from: ${settingsPath}`);
  const settings = loadJSON(settingsPath);

  console.log("Merging rules...");
  const merged = mergeRules(settings, rules);

  if (dryRun) {
    console.log("\n=== DRY RUN - Changes that would be applied ===\n");
    console.log(JSON.stringify(merged, null, 2));
  } else {
    const output = outputPath === settingsPath ? settingsPath : outputPath;
    fs.writeFileSync(output, JSON.stringify(merged, null, 2) + "\n");
    console.log(`✓ Successfully applied token scope rules to: ${output}`);
    console.log(
      `Total textMateRules: ${merged["editor.tokenColorCustomizations"]["textMateRules"]?.length || 0}`,
    );
  }
}

main();
