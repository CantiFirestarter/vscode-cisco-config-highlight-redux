/**
 * TypeScript version of the token scope rules applier
 *
 * Run with: npx ts-node scripts/applyScopeRules.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface TextMateRule {
  scope: string;
  settings: {
    foreground?: string;
    background?: string;
    fontStyle?: string;
  };
}

interface TokenColorCustomizations {
  '[*Light*]'?: {
    textMateRules?: TextMateRule[];
  };
  '[*Dark*]'?: {
    textMateRules?: TextMateRule[];
  };
  textMateRules?: TextMateRule[];
}

interface VSCodeSettings {
  'editor.tokenColorCustomizations'?: TokenColorCustomizations;
  [key: string]: unknown;
}

interface TextMateRulesFile {
  'editor.tokenColorCustomizations': TokenColorCustomizations;
}

function parseJSON<T>(content: string): T {
  // Remove line comments and block comments
  const cleaned = content
    .replace(/\/\/.*?$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove trailing commas
    .replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(cleaned);
}

function loadJSON<T>(filePath: string): T {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return parseJSON<T>(content);
  } catch (err) {
    console.error(`Error loading ${filePath}:`, (err as Error).message);
    process.exit(1);
  }
}

function mergeRules(settings: VSCodeSettings, rules: TextMateRulesFile): VSCodeSettings {
  if (!settings['editor.tokenColorCustomizations']) {
    settings['editor.tokenColorCustomizations'] = {};
  }

  const customizations = settings['editor.tokenColorCustomizations']!;
  const rulesCustomizations = rules['editor.tokenColorCustomizations'];

  // Merge general textMateRules with deduplication
  if (rulesCustomizations.textMateRules) {
    if (!customizations.textMateRules) {
      customizations.textMateRules = [];
    }

    // Create a map for existing rules by scope
    const existingRulesMap = new Map(
      customizations.textMateRules.map(rule => [rule.scope, rule]),
    );

    // Add or update new rules
    rulesCustomizations.textMateRules.forEach(newRule => {
      existingRulesMap.set(newRule.scope, newRule);
    });

    // Convert back to array
    customizations.textMateRules = Array.from(existingRulesMap.values());
  }

  return settings;
}

function main() {
  const args = process.argv.slice(2);
  const argMap: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      argMap[key] = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
    }
  }

  const settingsPath = (argMap['settings-path'] as string) || '.vscode/settings.json';
  const rulesPath = (argMap['rules-path'] as string) || 'syntaxes/textMateRules.json';
  const outputPath = (argMap['output'] as string) || settingsPath;
  const dryRun = argMap['dry-run'] !== undefined;

  console.log(`Loading token scope rules from: ${rulesPath}`);
  const rules = loadJSON<TextMateRulesFile>(rulesPath);

  console.log(`Loading settings from: ${settingsPath}`);
  const settings = loadJSON<VSCodeSettings>(settingsPath);

  console.log('Merging rules...');
  const merged = mergeRules(settings, rules);

  if (dryRun) {
    console.log('\n=== DRY RUN - Changes that would be applied ===\n');
    console.log(JSON.stringify(merged, null, 2));
  } else {
    const output = outputPath === settingsPath ? settingsPath : outputPath;
    fs.writeFileSync(output, JSON.stringify(merged, null, 2) + '\n');
    console.log(`✓ Successfully applied token scope rules to: ${output}`);
    const ruleCount =
      merged['editor.tokenColorCustomizations']?.textMateRules?.length || 0;
    console.log(`Total textMateRules: ${ruleCount}`);
  }
}

main();
