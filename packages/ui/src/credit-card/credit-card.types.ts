export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "unionpay"
  | "discover"
  | "jcb"
  | "unknown";

export interface CreditCardProps {
  /** 卡号（可含空格，内部归一）。 */
  number: string;
  /** 持卡人姓名。 */
  holder?: string;
  /** 有效期 MM/YY。 */
  expiry?: string;
  /** 强制品牌；省略则由卡号前缀自动识别。 */
  brand?: CardBrand;
  /** 仅显示后 4 位，其余打码。@default true */
  masked?: boolean;
  /** 翻到背面（磁条 + CVC）。 */
  flipped?: boolean;
  /** 背面 CVC。 */
  cvc?: string;
  className?: string;
}
