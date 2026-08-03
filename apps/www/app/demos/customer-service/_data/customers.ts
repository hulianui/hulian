import { copy } from "./customers.content";
import type { Customer } from "./types";

// 6 个客户档案，与会话 / 工单关联（customerId）。
export const customers: Customer[] = [
  {
    id: "CU01",
    name: copy("linWanru"),
    avatar: "/demo/avatar-1.jpg",
    level: "金卡",
    phone: "138-0011-2233",
    region: copy("shanghaiPudong"),
    since: "2023-04-18",
    totalSpend: 28640,
    orders: 37,
    tags: [copy("highValue"), copy("repurchase"), copy("clothing")],
    history: [
      { id: "h1", at: "2026-05-30", text: copy("ticketTReturnCompleted") },
      { id: "h2", at: "2026-05-12", text: copy("inquireAboutSizeAndHaveBeenGuided") },
      { id: "h3", at: "2026-04-21", text: copy("goldMembershipUpgrade") },
    ],
  },
  {
    id: "CU02",
    name: copy("zhaoTiezhu"),
    avatar: "/demo/avatar-3.jpg",
    level: "普通",
    phone: "139-2244-5566",
    region: copy("hebeiShijiazhuang"),
    since: "2025-11-03",
    totalSpend: 860,
    orders: 3,
    tags: [copy("digital"), copy("newCustomer")],
    history: [
      { id: "h1", at: "2026-06-01", text: copy("inquireAboutDeliveryTime") },
      { id: "h2", at: "2025-11-03", text: copy("firstOrderRegistration") },
    ],
  },
  {
    id: "CU03",
    name: copy("sunYue"),
    avatar: "/demo/avatar-3.jpg",
    level: "银卡",
    phone: "137-7788-9900",
    region: copy("sichuanChengdu"),
    since: "2024-09-14",
    totalSpend: 6420,
    orders: 14,
    tags: [copy("beauty"), copy("active")],
    history: [
      { id: "h1", at: "2026-05-28", text: copy("workOrderTLogisticsComplaintIsBeing") },
      { id: "h2", at: "2026-03-09", text: copy("participateInBigSale") },
    ],
  },
  {
    id: "CU04",
    name: copy("zhouJie"),
    avatar: "/demo/avatar-4.jpg",
    level: "黑卡",
    phone: "135-3322-1100",
    region: copy("guangdongShenzhen"),
    since: "2022-01-22",
    totalSpend: 96800,
    orders: 88,
    tags: ["VIP", copy("highCustomerOrder"), copy("homeAppliances")],
    history: [
      { id: "h1", at: "2026-05-21", text: copy("dedicatedOneToOneCustomerService") },
      { id: "h2", at: "2026-02-14", text: copy("renewalOfBlackCardRights") },
      { id: "h3", at: "2025-12-01", text: copy("largeOrder") },
    ],
  },
  {
    id: "CU05",
    name: copy("wuMin"),
    avatar: "/demo/avatar-12.jpg",
    level: "普通",
    phone: "136-9988-7766",
    region: copy("beijingChaoyang"),
    since: "2026-05-26",
    totalSpend: 199,
    orders: 1,
    tags: [copy("newCustomer2"), copy("motherAndBaby")],
    history: [{ id: "h1", at: "2026-05-26", text: copy("newUsersRegisterAndPlaceTheirFirst") }],
  },
  {
    id: "CU06",
    name: copy("zhengKai"),
    avatar: "/demo/avatar-2.jpg",
    level: "银卡",
    phone: "133-4455-6677",
    region: copy("zhejiangHangzhou"),
    since: "2024-06-30",
    totalSpend: 5210,
    orders: 11,
    tags: [copy("sports"), copy("manyReturnsAndExchanges")],
    history: [
      { id: "h1", at: "2026-06-02", text: copy("consultAfterSalesPolicy") },
      { id: "h2", at: "2026-01-19", text: copy("workOrderTExchangeCompleted") },
    ],
  },
];

export const customerById = (id: string): Customer | undefined =>
  customers.find((c) => c.id === id);
