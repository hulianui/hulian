import { copy } from "./orders.content";
import type { Order, OrderStatus } from "./types";

// 我的订单 mock：覆盖全部订单状态 + 物流轨迹。
export const orders: Order[] = [
  {
    id: "HS2026060300128",
    status: "shipped",
    createdAt: "2026-06-03 10:24",
    items: [{ productId: "p-hp-pro", name: copy("hanphoneProFlagshipCameraPhone"), color: copy("alpineBlue"), size: "16G+512G", qty: 1, price: 4299 }],
    total: 4299,
    receiver: copy("weiZhang1388866"),
    address: copy("hanyunTower969WestWenyiRoadYuhangDistrictHangzhouZhejiang"),
    tracks: [
      { time: "2026-06-04 09:12", text: copy("departedHangzhouTransitCenterNextStopHangzhouYuhangDistributionCenter") },
      { time: "2026-06-03 20:40", text: copy("arrivedAtHangzhouTransitCenter") },
      { time: "2026-06-03 14:05", text: copy("itemLeftTheWarehouseAndIsAwaitingCarrierPickup") },
      { time: "2026-06-03 10:24", text: copy("orderSubmittedAwaitingPaymentConfirmation") },
    ],
  },
  {
    id: "HS2026060200096",
    status: "paid",
    createdAt: "2026-06-02 19:48",
    items: [
      { productId: "p-hs-air", name: copy("hansoundAirActiveNoiseCancelingEarbuds"), color: copy("obsidianBlack"), size: copy("noiseCancelingPro"), qty: 1, price: 899 },
      { productId: "p-ho-bottle", name: copy("hanfieldInsulatedSportsBottle"), color: copy("mintGreen"), size: "900ml", qty: 2, price: 119 },
    ],
    total: 1137,
    receiver: copy("naLi1592030"),
    address: copy("text2BoyunRoadZhangjiangHiTechParkPudongShanghai"),
    tracks: [
      { time: "2026-06-02 19:50", text: copy("paymentReceivedTheSellerIsPreparingYourOrder") },
      { time: "2026-06-02 19:48", text: copy("orderSubmitted") },
    ],
  },
  {
    id: "HS2026053100451",
    status: "completed",
    createdAt: "2026-05-31 08:15",
    items: [{ productId: "p-hy-serum", name: copy("hanlabNiacinamideRepairSerum"), color: copy("text30MlStandard"), size: copy("buyOneGetOneGiftSet"), qty: 1, price: 268 }],
    total: 268,
    receiver: copy("fangWang1375521"),
    address: copy("gaoxinSouth1stRoadNanshanDistrictShenzhenGuangdong"),
    tracks: [
      { time: "2026-06-02 14:30", text: copy("deliveredAndSignedForByRecipientWeLookForwardToYourReview") },
      { time: "2026-06-02 08:20", text: copy("outForDeliveryFromShenzhenNanshanDeliveryCenter") },
      { time: "2026-06-01 22:10", text: copy("arrivedAtShenzhenTransitCenter") },
      { time: "2026-05-31 09:00", text: copy("itemLeftTheWarehouse") },
    ],
  },
  {
    id: "HS2026052800377",
    status: "pending",
    createdAt: "2026-05-28 22:03",
    items: [{ productId: "p-ha-jacket", name: copy("hanwear3In1WeatherproofJacket"), color: copy("armyGreen"), size: "L", qty: 1, price: 699 }],
    total: 699,
    receiver: copy("qiangZhao1889012"),
    address: copy("wangjingSohoT1ChaoyangDistrictBeijing"),
    tracks: [{ time: "2026-05-28 22:03", text: copy("orderSubmittedCompletePaymentWithin30Minutes") }],
  },
  {
    id: "HS2026052000219",
    status: "refunding",
    createdAt: "2026-05-20 11:20",
    items: [{ productId: "p-hy-lip", name: copy("hanlabVelvetMatteLipstick"), color: copy("mapleBrown"), size: copy("standardSize"), qty: 1, price: 159 }],
    total: 159,
    receiver: copy("liSun1357788"),
    address: copy("text100NorthZhongshanRoadGulouDistrictNanjingJiangsu"),
    tracks: [
      { time: "2026-05-22 10:00", text: copy("refundRequestedAwaitingSellerReview") },
      { time: "2026-05-21 16:30", text: copy("delivered") },
      { time: "2026-05-20 11:25", text: copy("itemLeftTheWarehouse") },
    ],
  },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: copy("awaitingPayment"),
  paid: copy("preparingShipment"),
  shipped: copy("inTransit"),
  completed: copy("completed"),
  refunding: copy("refundInProgress"),
  closed: copy("closed"),
};

export const STATUS_TONE: Record<OrderStatus, "warning" | "brand" | "success" | "danger" | "neutral"> = {
  pending: "warning",
  paid: "brand",
  shipped: "brand",
  completed: "success",
  refunding: "danger",
  closed: "neutral",
};
