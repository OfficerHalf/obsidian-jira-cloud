import { App, PluginSettingTab, Setting } from 'obsidian';

import { JiraCloudPlugin } from './plugin';

export interface JiraCloudSettings {
  /**
   * Jira API key
   */
  apiKey: string;
  /**
   * Jira username, probably an email address.
   */
  username: string;
  /**
   * Jira URL, of the form https://my-company.atlassian.net
   */
  host: string;
  /**
   * If enabled, HTML content in issues will be rendered to markdown.
   * @default true
   */
  renderToMarkdown: boolean;
  /**
   * Key to add issues to in yaml.
   * @default "issues"
   */
  issueYamlKey: string;
  /**
   * Whether or not to include the _fields property in YAML.
   * @default false
   */
  includeAll: boolean;
}

export const DEFAULT_SETTINGS: JiraCloudSettings = {
  apiKey: '',
  username: '',
  host: '',
  renderToMarkdown: true,
  issueYamlKey: 'issues',
  includeAll: false,
};

export class JiraCloudSettingsTab extends PluginSettingTab {
  constructor(
    public readonly app: App,
    private readonly plugin: JiraCloudPlugin,
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Jira connection' });

    new Setting(containerEl)
      .setName('Host')
      .setDesc('Your Atlassian URI, eg. https://my-company.atlassian.net')
      .addText((text) =>
        text
          .setPlaceholder('https://my-company.atlassian.net')
          .setValue(this.plugin.settings.host)
          .onChange(async (value) => {
            this.plugin.settings.host = value;
            await this.plugin.saveSettings(true);
          }),
      );

    new Setting(containerEl)
      .setName('Username')
      .setDesc('Your Atlassian username, eg. myname@my-company.com')
      .addText((text) =>
        text
          .setPlaceholder('myname@my-company.com')
          .setValue(this.plugin.settings.username)
          .onChange(async (value) => {
            this.plugin.settings.username = value;
            await this.plugin.saveSettings(true);
          }),
      );

    const apiKeyDescription = new DocumentFragment();
    apiKeyDescription.appendText('Your Atlassian API Key, generated here ');
    apiKeyDescription.appendChild(
      apiKeyDescription.createEl('a', {
        href: 'https://id.atlassian.com/manage-profile/security/api-tokens',
        text: 'https://id.atlassian.com/manage-profile/security/api-tokens',
      }),
    );
    new Setting(containerEl)
      .setName('API Key')
      .setDesc(apiKeyDescription)
      .addText((text) =>
        text
          .setPlaceholder('ZnJlZDpmcmVk')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings(true);
          }),
      );

    const verifyContainer = containerEl.createDiv({
      cls: 'ojc-verify-connection',
    });
    const verifyButton = verifyContainer.createEl('button', {
      cls: 'ojc-verify-connection-btn',
      text: 'Verify Connection',
    });
    verifyButton.addEventListener('click', () => {
      this.plugin.api.verifyConnection();
    });

    containerEl.createEl('h2', { text: 'Other options' });

    new Setting(containerEl)
      .setName('Render HTML content to markdown')
      .setDesc(
        'Some fields, like the full description of an issue, are rendered as HTML. If enabled, these will be converted to markdown if possible.',
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.renderToMarkdown ?? true)
          .onChange(async (value) => {
            this.plugin.settings.renderToMarkdown = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('YAML frontmatter issue key')
      .setDesc(
        'Issues will be added under this key in note frontmatter. Use only valid YAML variable names.',
      )
      .addText((text) =>
        text
          .setPlaceholder('issues')
          .setValue(this.plugin.settings.issueYamlKey)
          .onChange(async (value) => {
            this.plugin.settings.issueYamlKey =
              value ?? DEFAULT_SETTINGS.issueYamlKey;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Include full API response in YAML frontmatter')
      .setDesc(
        "If enabled, a special '_fields' property is included in the YAML frontmatter for a given issue which includes ALL non-empty data from the API response. Enabling this will dramatically increase the size of the frontmatter.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.includeAll ?? false)
          .onChange(async (value) => {
            this.plugin.settings.includeAll = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
