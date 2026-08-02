import { copy } from "./status.content";
import type {
  CheckoutStatus,
  InvoiceType,
  InvoiceStatus,
  PayMethod,
  Payment,
  PaymentStatus,
  PhotoTag,
  ProjectEvent,
  ProjectStage,
  ProjectStatus,
  QuoteStatus,
} from "./types";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

// 统一的状态 → Tag 色调映射 + 金额格式化（各页复用，单一口径）。

type Tone = "brand" | "success" | "warning" | "danger" | "neutral";

export const projectStageLabel: Record<ProjectStage, string> = {
  勘测: copy("stageSurvey"),
  报价: copy("stageQuote"),
  进场: copy("stageMobilization"),
  施工: copy("stageConstruction"),
  验收: copy("stageAcceptance"),
  结算: copy("stageSettlement"),
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  待开工: copy("statusNotStarted"),
  进行中: copy("statusInProgress"),
  已暂停: copy("statusPaused"),
  已完工: copy("statusCompleted"),
  已结算: copy("statusSettled"),
};

export const quoteStatusLabel: Record<QuoteStatus, string> = {
  草稿: copy("quoteDraft"),
  已发送: copy("quoteSent"),
  已确认: copy("quoteAccepted"),
  已失效: copy("quoteExpired"),
};

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  待开: copy("invoicePending"),
  已开: copy("invoiceIssued"),
  已寄送: copy("invoiceMailed"),
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  未回款: copy("paymentUnpaid"),
  部分回款: copy("paymentPartial"),
  已结清: copy("paymentPaid"),
};

export const checkoutStatusLabel: Record<CheckoutStatus, string> = {
  待支付: copy("checkoutAwaiting"),
  支付中: copy("checkoutProcessing"),
  已支付: copy("checkoutPaid"),
  已关闭: copy("checkoutClosed"),
};

export const photoTagLabel: Record<PhotoTag, string> = {
  进度: copy("photoProgress"),
  隐患: copy("photoIssue"),
  验收: copy("photoAcceptance"),
  材料: copy("photoMaterials"),
};

export const invoiceTypeLabel: Record<InvoiceType, string> = {
  增值税专用发票: copy("invoiceVatSpecial"),
  增值税普通发票: copy("invoiceVatStandard"),
};

export const invoiceTypeShortLabel: Record<InvoiceType, string> = {
  增值税专用发票: copy("invoiceVatSpecialShort"),
  增值税普通发票: copy("invoiceVatStandardShort"),
};

export const payMethodLabel: Record<Payment["method"], string> = {
  微信支付: copy("payWechat"),
  支付宝: copy("payAlipay"),
  对公网银: copy("payCorporateBanking"),
  银行卡: copy("payCard"),
  银行转账: copy("payBankTransfer"),
  承兑汇票: copy("payAcceptanceBill"),
  现金: copy("payCash"),
};

export const checkoutPayMethodLabel: Record<PayMethod, string> = {
  微信支付: copy("payWechat"),
  支付宝: copy("payAlipay"),
  对公网银: copy("payCorporateBanking"),
  银行卡: copy("payCard"),
};

export const projectEventTypeLabel: Record<ProjectEvent["type"], string> = {
  里程碑: copy("eventMilestone"),
  报价: copy("eventQuote"),
  开票: copy("eventInvoice"),
  回款: copy("eventPayment"),
  照片: copy("eventPhoto"),
  备注: copy("eventNote"),
};

export const currencyPrefix = copy("currencyPrefix");

export function projectStatusTone(s: ProjectStatus): Tone {
  switch (s) {
    case "进行中":
      return "brand";
    case "已完工":
      return "success";
    case "已结算":
      return "neutral";
    case "已暂停":
      return "danger";
    case "待开工":
    default:
      return "warning";
  }
}

export function quoteStatusTone(s: QuoteStatus): Tone {
  switch (s) {
    case "已确认":
      return "success";
    case "已发送":
      return "brand";
    case "已失效":
      return "neutral";
    case "草稿":
    default:
      return "warning";
  }
}

export function invoiceStatusTone(s: InvoiceStatus): Tone {
  switch (s) {
    case "已寄送":
      return "success";
    case "已开":
      return "brand";
    case "待开":
    default:
      return "warning";
  }
}

export function paymentStatusTone(s: PaymentStatus): Tone {
  switch (s) {
    case "已结清":
      return "success";
    case "部分回款":
      return "warning";
    case "未回款":
    default:
      return "danger";
  }
}

export function checkoutStatusTone(s: CheckoutStatus): Tone {
  switch (s) {
    case "已支付":
      return "success";
    case "支付中":
      return "brand";
    case "已关闭":
      return "neutral";
    case "待支付":
    default:
      return "warning";
  }
}

export function photoTagTone(t: PhotoTag): Tone {
  switch (t) {
    case "验收":
      return "success";
    case "隐患":
      return "danger";
    case "材料":
      return "brand";
    case "进度":
    default:
      return "neutral";
  }
}

/** 元 → 「¥1,234,567」。 */
export function yuan(n: number): string {
  return `¥${n.toLocaleString("zh-CN")}`;
}

/** 元 → 「123.4 万」（卡片紧凑展示）。 */
export function wan(n: number): string {
  return DOCS_LOCALE === "en"
    ? `¥${(n / 1_000_000).toFixed(1)}M`
    : copy("valueMillion", (n / 10000).toFixed(1));
}

const CN_NUM = copy("zeroOneTwoThreeFourFiveSix");
const CN_UNIT = ["", copy("pickUp"), copy("hundred"), copy("thousand")];
const CN_BIG = ["", copy("million"), copy("billion")];

/** 金额数字 → 人民币大写（报价单/发票用，整数部分 + 角分）。 */
export function rmbUpper(n: number): string {
  if (DOCS_LOCALE === "en") {
    return `CNY ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (n === 0) return copy("zeroYuan");
  const negative = n < 0;
  let num = Math.abs(Math.round(n * 100));
  const fen = num % 10;
  num = Math.floor(num / 10);
  const jiao = num % 10;
  num = Math.floor(num / 10);
  // 整数部分按四位分节。
  let intStr = "";
  let section = 0;
  while (num > 0) {
    const part = num % 10000;
    let partStr = "";
    let p = part;
    let pos = 0;
    let zero = false;
    while (p > 0) {
      const d = p % 10;
      if (d === 0) {
        zero = true;
      } else {
        partStr = CN_NUM[d] + CN_UNIT[pos] + (zero ? copy("zero") : "") + partStr;
        zero = false;
      }
      p = Math.floor(p / 10);
      pos++;
    }
    if (part > 0) intStr = partStr + CN_BIG[section] + intStr;
    else if (intStr && !intStr.startsWith("零")) intStr = "零" + intStr;
    num = Math.floor(num / 10000);
    section++;
  }
  let result = (negative ? copy("negative") : "") + (intStr ? intStr + copy("yuan") : "");
  if (jiao === 0 && fen === 0) {
    result += copy("whole");
  } else {
    result += jiao > 0 ? CN_NUM[jiao] + copy("angle") : intStr ? copy("zero4") : "";
    if (fen > 0) result += CN_NUM[fen] + copy("points");
  }
  return result;
}
