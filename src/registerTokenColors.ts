import * as vscode from 'vscode';

/**
 * Applies custom token colors based on user configuration settings
 */
export function registerTokenColorCustomization(context: vscode.ExtensionContext): void {
  // Apply colors when extension activates
  applyTokenColors();

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('cisco-config-highlight.colors')) {
        applyTokenColors();
      }
    })
  );

  // Register command to manually apply colors
  context.subscriptions.push(
    vscode.commands.registerCommand('cisco-config-highlight.applyColors', () => {
      applyTokenColors();
      vscode.window.showInformationMessage('Cisco Config colors applied!');
    })
  );
}

function applyTokenColors(): void {
  const config = vscode.workspace.getConfiguration('cisco-config-highlight.colors');
  const workspaceConfig = vscode.workspace.getConfiguration();

  // Get current tokenColorCustomizations
  const currentCustomizations = workspaceConfig.get<any>('editor.tokenColorCustomizations', {});
  
  if (!currentCustomizations.textMateRules) {
    currentCustomizations.textMateRules = [];
  }

  // Build rules from configuration
  const rules = buildTokenRulesFromConfig(config);

  // Merge rules (deduplicate by scope)
  const existingRulesMap = new Map(
    currentCustomizations.textMateRules.map((rule: any) => [rule.scope, rule])
  );

  rules.forEach((rule) => {
    existingRulesMap.set(rule.scope, rule);
  });

  currentCustomizations.textMateRules = Array.from(existingRulesMap.values());

  // Apply to workspace settings
  workspaceConfig.update(
    'editor.tokenColorCustomizations',
    currentCustomizations,
    vscode.ConfigurationTarget.Global
  );
}

function buildTokenRulesFromConfig(config: vscode.WorkspaceConfiguration): any[] {
  const rules: any[] = [];

  // Interface colors
  const interfaceEthernet = config.get<string>('interface.ethernet');
  if (interfaceEthernet) {
    rules.push({
      scope: 'entity.name.class.interface.ethernet',
      settings: { foreground: interfaceEthernet }
    });
  }

  const interfaceLoopback = config.get<string>('interface.loopback');
  if (interfaceLoopback) {
    rules.push({
      scope: 'entity.name.class.interface.loopback',
      settings: { foreground: interfaceLoopback }
    });
  }

  const interfaceVlan = config.get<string>('interface.vlan');
  if (interfaceVlan) {
    rules.push({
      scope: 'entity.name.class.interface.vlan',
      settings: { foreground: interfaceVlan }
    });
  }

  // Keyword colors
  const keywordShutdown = config.get<string>('keyword.shutdown');
  if (keywordShutdown) {
    rules.push({
      scope: 'keyword.other.config-keyword.shutdown',
      settings: { foreground: keywordShutdown }
    });
  }

  const keywordPermit = config.get<string>('keyword.permit');
  if (keywordPermit) {
    rules.push({
      scope: 'keyword.other.config-keyword.permit-deny.permit',
      settings: { foreground: keywordPermit }
    });
  }

  const keywordDeny = config.get<string>('keyword.deny');
  if (keywordDeny) {
    rules.push({
      scope: 'keyword.other.config-keyword.permit-deny.deny',
      settings: { foreground: keywordDeny }
    });
  }

  // Address colors
  const addressIpv4 = config.get<string>('address.ipv4');
  if (addressIpv4) {
    rules.push(
      {
        scope: 'keyword.other.address.ipv4.full',
        settings: { foreground: addressIpv4 }
      },
      {
        scope: 'keyword.other.address.ipv4.cidr',
        settings: { foreground: addressIpv4 }
      }
    );
  }

  const addressMac = config.get<string>('address.mac');
  if (addressMac) {
    rules.push({
      scope: 'keyword.other.address.mac',
      settings: { foreground: addressMac }
    });
  }

  // Comment colors
  const comment = config.get<string>('comment');
  if (comment) {
    rules.push(
      {
        scope: 'comment.line.config',
        settings: { foreground: comment }
      },
      {
        scope: 'comment.block.banner',
        settings: { foreground: comment }
      }
    );
  }

  // String colors
  const stringDescription = config.get<string>('string.description');
  if (stringDescription) {
    rules.push({
      scope: 'string.other.description',
      settings: { foreground: stringDescription }
    });
  }

  const stringHostname = config.get<string>('string.hostname');
  if (stringHostname) {
    rules.push({
      scope: 'entity.name.tag.config-string.hostname',
      settings: { foreground: stringHostname }
    });
  }

  return rules;
}
