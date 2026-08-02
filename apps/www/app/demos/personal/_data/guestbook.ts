import { copy } from "./guestbook.content";
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
    author: copy("ajie"),
    hue: 222,
    rating: 5,
    content: copy("codeframeSavedMyTechnicalPostsICanFinallyShareCodeScreenshotsWithConfidenceCouldExportsSupportRo"),
    createdAt: "2026-06-03 21:14",
    replies: [
      {
        id: "g1r1",
        author: copy("linYu"),
        hue: 200,
        content: copy("alreadyInProgressForTheNextReleaseThanksForTheSupport"),
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
    content: copy("tideIsTheOnlyFocusAppThatHasStayedOnMyPhoneTheBreathingAnimationIsWonderfullyCalmingPleaseMakeAn"),
    createdAt: "2026-06-02 09:48",
  },
  {
    id: "g3",
    author: copy("laoChen"),
    hue: 150,
    rating: 4,
    content: copy("flowctlHasRunInOurCiForSixMonthsAndHasBeenRockSolidTheDocsCouldGoDeeperThoughNewTeammatesFaceALe"),
    createdAt: "2026-05-30 16:30",
    replies: [
      {
        id: "g3r1",
        author: copy("linYu"),
        hue: 200,
        content: copy("thanksIAmRewritingTheDocsAndWillAddAGettingStartedFromScratchChapter"),
        createdAt: "2026-05-30 18:11",
        byOwner: true,
      },
    ],
  },
  {
    id: "g4",
    author: copy("divingCat"),
    hue: 35,
    rating: 5,
    content: copy("inkbookSLocalFirstApproachResonatesWithMeOwningYourDataMattersAndThe8MbAppSizeIsExcellent"),
    createdAt: "2026-05-28 11:05",
  },
  {
    id: "g5",
    author: "Kevin",
    hue: 264,
    rating: 5,
    content: copy("itIsImpressiveToSeeOnePersonShipSoManyPolishedProductsHowDoYouBalanceProductWorkWithGrowthAsAnIn"),
    createdAt: "2026-05-25 14:20",
  },
];

/** AvatarCircles 最近访客 */
export const recentVisitors: { name: string; hue: number }[] = [
  { name: copy("ajie"), hue: 222 },
  { name: "Mia", hue: 320 },
  { name: copy("laoChen"), hue: 150 },
  { name: copy("divingCat"), hue: 35 },
  { name: "Kevin", hue: 264 },
  { name: "Sara", hue: 12 },
  { name: copy("doudou"), hue: 96 },
  { name: copy("awei"), hue: 280 },
];
