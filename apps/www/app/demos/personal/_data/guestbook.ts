// 留言板种子数据。guestbook 页用 useMockData 异步加载它，演完整交互链。

export interface GuestReply {
  id: string;
  author: string;
  hue: number;
  content: string;
  createdAt: string;
  /** 站长本人回复（高亮） */
  byOwner?: boolean;
}

export interface GuestEntry {
  id: string;
  author: string;
  hue: number;
  /** 1–5 星评分，喂 Rating */
  rating: number;
  /** markdown 内容 */
  content: string;
  createdAt: string;
  replies?: GuestReply[];
  /** 标记「我刚发的」→ 可删（Popconfirm 二次确认） */
  own?: boolean;
}

export const guestbookSeed: GuestEntry[] = [
  {
    id: "g1",
    author: "阿杰",
    hue: 222,
    rating: 5,
    content: "码尺真的救了我的技术推！现在发代码截图终于不丢人了 🎉 顺便问下导出能加圆角窗口吗？",
    createdAt: "2026-06-03 21:14",
    replies: [
      {
        id: "g1r1",
        author: "林屿",
        hue: 200,
        content: "已经在做了，下个版本上 😄 谢谢支持！",
        createdAt: "2026-06-03 22:02",
        byOwner: true,
      },
    ],
  },
  {
    id: "g2",
    author: "Mia",
    hue: 320,
    rating: 5,
    content: "潮汐是我手机里唯一没被卸载的专注 APP。那个呼吸动效太治愈了，求出 iPad 版！",
    createdAt: "2026-06-02 09:48",
  },
  {
    id: "g3",
    author: "老陈",
    hue: 150,
    rating: 4,
    content: "flowctl 在我们团队 CI 里跑了半年，稳得一批。文档可以再细点，新人上手有点门槛。",
    createdAt: "2026-05-30 16:30",
    replies: [
      {
        id: "g3r1",
        author: "林屿",
        hue: 200,
        content: "收到，文档站正在重写，会补一章「从零开始」。",
        createdAt: "2026-05-30 18:11",
        byOwner: true,
      },
    ],
  },
  {
    id: "g4",
    author: "潜水的猫",
    hue: 35,
    rating: 5,
    content: "墨册的本地优先理念深得我心，数据握在自己手里太重要了。8MB 包体是真的香。",
    createdAt: "2026-05-28 11:05",
  },
  {
    id: "g5",
    author: "Kevin",
    hue: 264,
    rating: 5,
    content: "一个人能做出这么多打磨到位的产品，佩服。请问独立开发怎么平衡做产品和做增长？",
    createdAt: "2026-05-25 14:20",
  },
];

/** AvatarCircles 最近访客 */
export const recentVisitors: { name: string; hue: number }[] = [
  { name: "阿杰", hue: 222 },
  { name: "Mia", hue: 320 },
  { name: "老陈", hue: 150 },
  { name: "潜水的猫", hue: 35 },
  { name: "Kevin", hue: 264 },
  { name: "Sara", hue: 12 },
  { name: "豆豆", hue: 96 },
  { name: "阿伟", hue: 280 },
];
