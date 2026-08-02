import { PageHeaderBlock } from "../../blocks/_blocks/page-header.en";
import { SettingsPanelBlock } from "../../blocks/_blocks/settings-panel.en";
export function SettingsPage() {
    return (<div className="space-y-8 bg-bg px-6 py-8">
      <PageHeaderBlock />
      <SettingsPanelBlock />
    </div>);
}
