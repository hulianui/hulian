// 只触发 warning 级规则，不触发任何 error。
// 内置规则从 0.28.0 起全部是 error（原先那条 warning 是 muted 当背景用，随 #142 的语义反转
// 一起退役），所以这里改用 --config 注入的自定义 warning 规则 —— 顺带把 --config 这条路径
// 也纳入覆盖，它此前没有任何测试。
export const WarnOnly = () => <div className="legacy-grid p-4">分组容器</div>;
