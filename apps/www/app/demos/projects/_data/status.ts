import type {
  CheckoutStatus,
  InvoiceStatus,
  PaymentStatus,
  PhotoTag,
  ProjectStatus,
  QuoteStatus,
} from "./types";

// 统一的状态 → Tag 色调映射 + 金额格式化（各页复用，单一口径）。

type Tone = "brand" | "success" | "warning" | "danger" | "neutral";

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
  return `${(n / 10000).toFixed(1)} 万`;
}

const CN_NUM = "零壹贰叁肆伍陆柒捌玖";
const CN_UNIT = ["", "拾", "佰", "仟"];
const CN_BIG = ["", "万", "亿"];

/** 金额数字 → 人民币大写（报价单/发票用，整数部分 + 角分）。 */
export function rmbUpper(n: number): string {
  if (n === 0) return "零元整";
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
        partStr = CN_NUM[d] + CN_UNIT[pos] + (zero ? "零" : "") + partStr;
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
  let result = (negative ? "负" : "") + (intStr ? intStr + "元" : "");
  if (jiao === 0 && fen === 0) {
    result += "整";
  } else {
    result += jiao > 0 ? CN_NUM[jiao] + "角" : intStr ? "零" : "";
    if (fen > 0) result += CN_NUM[fen] + "分";
  }
  return result;
}
