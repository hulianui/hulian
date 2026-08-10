import { makeUsers } from "@hulianui/mocks";
import { DOCS_LOCALE } from "../../lib/docs-locale";

// mock① 真实样例数据：faker 确定性种子，一眼看"填满后"的真实观感
const users = makeUsers(8);
const roleLabels = {
  管理员: "Administrator",
  编辑: "Editor",
  访客: "Guest",
} as const;

export function SampleTable() {
  return (
    <table className="w-full text-sm">
      <thead className="text-muted-foreground">
        <tr>
          <th className="p-2 text-left font-medium">{DOCS_LOCALE === "en" ? "Name" : "姓名"}</th>
          <th className="p-2 text-left font-medium">{DOCS_LOCALE === "en" ? "Email" : "邮箱"}</th>
          <th className="p-2 text-left font-medium">{DOCS_LOCALE === "en" ? "Role" : "角色"}</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className="border-t border-border">
            <td className="flex items-center gap-2 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u.avatar} alt="" className="size-6 rounded-full bg-surface-hover" />
              {u.name}
            </td>
            <td className="p-2 text-muted-foreground">{u.email}</td>
            <td className="p-2">
              {DOCS_LOCALE === "en" ? roleLabels[u.role as keyof typeof roleLabels] : u.role}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
