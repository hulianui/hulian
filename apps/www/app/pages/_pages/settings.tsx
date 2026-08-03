/** @jsxImportSource ../../../lib/fixture-jsx */
import { PageHeaderBlock } from "../../blocks/_blocks/page-header";
import { SettingsPanelBlock } from "../../blocks/_blocks/settings-panel";

// 设置页 —— 页头 + 设置分区（Tabs 导航 + 表单 + 开关项），账户 / 团队 / 偏好配置的统一范式。
export function SettingsPage() {
  return (
    <div className="space-y-8 bg-bg px-6 py-8">
      <PageHeaderBlock />
      <SettingsPanelBlock />
    </div>
  );
}
