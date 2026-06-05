import { makeUsers } from "@hulianui/mocks";

// mock① 真实样例数据：faker 确定性种子，一眼看"填满后"的真实观感
const users = makeUsers(8);

export function SampleTable() {
  return (
    <table className="w-full text-sm">
      <thead className="text-muted">
        <tr>
          <th className="p-2 text-left font-medium">姓名</th>
          <th className="p-2 text-left font-medium">邮箱</th>
          <th className="p-2 text-left font-medium">角色</th>
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
            <td className="p-2 text-muted">{u.email}</td>
            <td className="p-2">{u.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
