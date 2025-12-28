import * as vscode from 'vscode';
import { registerOutlineSymbolProvider } from './registerOutlineSymbol';
import { registerUpdateInfo } from './registerUpdateInfo';
import { registerTokenColorCustomization } from './registerTokenColors';

export const outputChannel = vscode.window.createOutputChannel('Cisco Config Highlight');

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  try {
    await registerUpdateInfo(context);
  } catch (err) {
    outputChannel.append(String(err));
  }
  registerOutlineSymbolProvider(context);

  // Register token color customization (Option 2)
  registerTokenColorCustomization(context);
}
