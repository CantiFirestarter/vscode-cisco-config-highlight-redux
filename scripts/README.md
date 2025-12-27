# TextMate Rules Application Script

This script applies TextMate token scope rules from `syntaxes/textMateRules.json` to your VS Code `settings.json`.

## Usage

### Basic Usage
Apply rules to `.vscode/settings.json`:
```bash
npm run apply-token-scopes
```

### Dry Run
Preview changes without writing to file:
```bash
npm run apply-token-scopes:dry-run
```

### Custom Paths (JavaScript)
```bash
node scripts/applyScopeRules.js \
  --settings-path .vscode/settings.json \
  --rules-path syntaxes/textMateRules.json \
  --dry-run
```

### TypeScript Version
Run the TypeScript version:
```bash
npm run apply-token-scopes:ts
```
Note: `ts-node` and Node.js typings are included in devDependencies. Just run `npm install` first.

## Features

- ✅ Merges TextMate rules into existing settings
- ✅ Deduplicates rules by scope (prevents duplicates)
- ✅ Supports dry-run mode to preview changes
- ✅ Preserves existing settings
- ✅ Removes JSON comments before parsing
- ✅ Properly formatted output

## Command Line Options

| Option | Description |
|--------|-------------|
| `--settings-path <path>` | Path to settings.json (default: `.vscode/settings.json`) |
| `--rules-path <path>` | Path to textMateRules.json (default: `syntaxes/textMateRules.json`) |
| `--output <path>` | Output file path (default: same as settings-path) |
| `--dry-run` | Show changes without writing to file |

## Examples

### Apply rules from a custom location
```bash
node scripts/applyScopeRules.js \
  --rules-path ./custom-themes/my-rules.json \
  --settings-path .vscode/settings.json
```

### Output to a different file
```bash
npm run apply-token-scopes -- --output .vscode/settings-new.json
```

### Preview changes first
```bash
npm run apply-token-scopes:dry-run
# Review output, then apply:
npm run apply-token-scopes
```

## How It Works

1. **Reads** `syntaxes/textMateRules.json`
2. **Loads** your current `.vscode/settings.json`
3. **Merges** rules into `editor.tokenColorCustomizations.textMateRules`
4. **Deduplicates** by scope to avoid conflicts
5. **Writes** the updated settings back to the file

## What Gets Merged

- General TextMate rules in the `textMateRules` array

Note: Theme-specific sections (`[*Light*]`, `[*Dark*]`) are not merged.

## Important Notes

- Always backup your `settings.json` before running
- The script preserves existing settings except for conflicting TextMate rules
- Rules with the same scope are overwritten by the new definition
- Comments in JSON files are removed during parsing
