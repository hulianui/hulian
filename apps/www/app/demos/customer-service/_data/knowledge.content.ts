import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "returnAndRefundPolicyAndTimelineInstructions": "退货退款政策与时效说明",
    "afterSales": "售后",
    "dayNoReasonReturnRangeRefundTime": "7 天无理由退货范围、退款到账时效、特殊品类例外。",
    "returnAndRefundPolicyScopeOfApplication": "## 退货退款政策\n\n### 适用范围\n- **7 天无理由**：自签收次日起 7 天内，商品**完好且不影响二次销售**可申请。\n- **质量问题**：15 天内可退换，往返运费由平台承担。\n\n### 退款时效\n| 支付方式 | 到账时效 |\n| --- | --- |\n| 余额 | 实时 |\n| 微信 / 支付宝 | 1-3 个工作日 |\n| 银行卡 | 3-7 个工作日 |\n\n### 不支持无理由的品类\n> 定制商品、贴身衣物、已拆封的食品 / 化妆品（质量问题除外）。\n\n**坐席提示**：金卡及以上客户退款优先级置高，主动同步进度。",
    "logisticsTrackExceptionHandlingProcess": "物流轨迹异常处理流程",
    "logistics": "物流",
    "standardResponseProceduresForAbnormalReceiptsNo": "签收异常、长时间无更新、丢件破损的标准应对步骤。",
    "logisticsExceptionHandlingNoTrackUpdateFor": "## 物流异常处理\n\n### 长时间无轨迹更新（>48h）\n1. 安抚客户情绪，致歉并说明将立即核查。\n2. 联系承运商客服催件，记录工单。\n3. 视情况发放 **5-10 元无门槛券** 作为补偿。\n4. 承诺一个明确的回复时间点并履约。\n\n### 丢件 / 破损\n- 引导客户拍照留证，48h 内提交。\n- 核实后按 **补发或全额退款** 二选一处理。",
    "couponStackingAndUsageRules": "优惠券叠加与使用规则",
    "marketing": "营销",
    "theSuperimpositionLogicOfDiscountCouponsCategory": "满减券、品类券、平台券的叠加逻辑与常见纠纷话术。",
    "couponRulesOverlayLogicPlatformCouponStore": "## 优惠券规则\n\n### 叠加逻辑\n- **平台券 + 店铺券** 可叠加。\n- **同类券**（两张满减）不可叠加，系统取最优。\n\n### 常见纠纷话术\n> 「亲，这两张券属于同一类型哦，系统会自动为您选择优惠力度更大的那张～如有不便，我帮您补发一张其它品类券作为补偿。」",
    "exclusivePrivilegesForBlackCardGoldCard": "黑卡 / 金卡会员专属权益",
    "member": "会员",
    "listOfBenefitsAtEachLevelExclusive": "各等级权益清单、专属客服、生日礼遇与升级条件。",
    "memberRightsLevelDedicatedCustomerServiceFree": "## 会员权益\n\n| 等级 | 专属客服 | 包邮 | 生日礼 | 升级门槛 |\n| --- | --- | --- | --- | --- |\n| 银卡 | — | ✔ | 88 券 | 累计 ¥2,000 |\n| 金卡 | 优先 | ✔ | 188 券 | 累计 ¥10,000 |\n| 黑卡 | 1对1 | ✔ | 定制 | 累计 ¥50,000 |\n\n**坐席提示**：识别高等级客户身份后，主动使用尊称并提供超预期服务。",
    "accountSecurityAndRemoteLoginVerification": "账号安全与异地登录核验",
    "accountNumber": "账号",
    "remoteLoginReminderIdentityVerificationProcessAnd": "异地登录提醒、身份核验流程、密码重置引导。",
    "accountSecurityRemoteLoginVerificationConfirmWhether": "## 账号安全\n\n### 异地登录核验\n1. 确认是否为本人操作。\n2. 非本人 → 立即引导冻结账号 + 重置密码。\n3. 通过 **短信验证码 + 安全问题** 双重核验身份。\n\n> 切勿在会话中要求客户提供完整密码 / 验证码，仅引导其自助操作。",
    "shoppingGuideSkillsForMaternalAndInfant": "母婴 / 食品类商品导购话术",
    "shoppingGuide": "导购",
    "professionalRecommendationsForAntiColicBabyBottles": "防胀气奶瓶、月龄适配、成分安全的专业推荐话术。",
    "motherAndBabyShoppingGuideWordsBaby": "## 母婴导购话术\n\n### 奶瓶选购\n- **防胀气**：导气阀设计，适合 0-6 月龄易胀气宝宝。\n- **材质**：PPSU 耐高温可消毒，玻璃更稳定但偏重。\n\n### 推荐话术\n> 「这款是防胀气设计哦，特别适合 0-6 个月的小宝宝，妈妈们反馈夜奶后宝宝更安稳～材质是食品级 PPSU，可以煮沸消毒，您放心使用。」",
    "all": "全部",
    "afterSales2": "售后",
    "logistics2": "物流",
    "marketing2": "营销",
    "member2": "会员",
    "accountNumber2": "账号",
    "shoppingGuide2": "导购",
  },
  en: {
    "returnAndRefundPolicyAndTimelineInstructions": "Return and Refund Policy and Timeline Instructions",
    "afterSales": "After-sales",
    "dayNoReasonReturnRangeRefundTime": "7-day no-reason return range, refund time limit, special category exceptions.",
    "returnAndRefundPolicyScopeOfApplication": "## Return and Refund Policy\n\n### Scope of application\n- **7 days without reason**: Within 7 days from the day after receipt, the product can be applied if the product is **in good condition and does not affect secondary sales**.\n- **Quality issues**: Returns and exchanges can be made within 15 days, and the round-trip shipping costs will be borne by the platform.\n\n### Refund time limit\n| Payment method | Time of arrival |\n| --- | --- |\n| Balance | Real-time |\n| WeChat / Alipay | 1-3 working days |\n| Bank Card | 3-7 working days |\n\n### Does not support categories without reason\n> Customized goods, intimate clothing, opened food/cosmetics (except for quality issues).\n\n**Agent Tip**: The refund priority for gold card and above customers will be set high, and the progress will be synchronized automatically.",
    "logisticsTrackExceptionHandlingProcess": "Logistics track exception handling process",
    "logistics": "Logistics",
    "standardResponseProceduresForAbnormalReceiptsNo": "Standard response procedures for abnormal receipts, no updates for a long time, and lost or damaged items.",
    "logisticsExceptionHandlingNoTrackUpdateFor": "## Logistics exception handling\n\n### No track update for a long time (>48h)\n1. Acknowledge the issue, apologize and explain that it will be checked immediately.\n2. Contact the carrier's customer service to request an expedited update and record the ticket.\n3. **5-10 yuan no-minimum-spend coupon** will be issued as compensation depending on the situation.\n4. Commit to a clear response time and fulfill the promise.\n\n### Lost/Damaged\n- Guide customers to take photos and keep certificates, and submit them within 48 hours.\n- After verification, please choose between **reissue or full refund**.",
    "couponStackingAndUsageRules": "Coupon stacking and usage rules",
    "marketing": "Marketing",
    "theSuperimpositionLogicOfDiscountCouponsCategory": "The superimposition logic of discount coupons, category coupons, and platform coupons and common dispute techniques.",
    "couponRulesOverlayLogicPlatformCouponStore": "## Coupon Rules\n\n### Overlay logic\n- **Platform Coupon + Store Coupon** can be stacked.\n- **Same type of coupons** (two coupons with full discount) cannot be superimposed, and the system will choose the best one.\n\n### Common Dispute Techniques\n> \"Dear, these two coupons are of the same type. The system will automatically choose the one with a greater discount for you. If there is any inconvenience, I will help you reissue a coupon of another category as compensation.\"",
    "exclusivePrivilegesForBlackCardGoldCard": "Exclusive privileges for black card/gold card members",
    "member": "member",
    "listOfBenefitsAtEachLevelExclusive": "List of benefits at each level, exclusive customer service, birthday gifts and upgrade conditions.",
    "memberRightsLevelDedicatedCustomerServiceFree": "## Member Rights\n\n| Level | Dedicated customer service | Free shipping | Birthday gift | Upgrade threshold |\n| --- | --- | --- | --- | --- |\n| Silver Card | — | ✔ | 88 coupons | Total ¥2,000 |\n| Gold Card | Priority | ✔ | 188 coupons | Total ¥10,000 |\n| Black Card | 1 to 1 | ✔ | Customized | Total ¥50,000 |\n\n**Agent Tip**: After identifying high-level customers, take the initiative to use their honorifics and provide services beyond expectations.",
    "accountSecurityAndRemoteLoginVerification": "Account security and remote login verification",
    "accountNumber": "Account number",
    "remoteLoginReminderIdentityVerificationProcessAnd": "Remote login reminder, identity verification process, and password reset guidance.",
    "accountSecurityRemoteLoginVerificationConfirmWhether": "## Account security\n\n### Verify a remote sign-in\n1. Ask the customer whether they recognize the sign-in.\n2. If they do not, immediately freeze the account and reset the password.\n3. Verify the customer with both an **SMS code and a security question**.\n\n> Never ask for a full password or verification code. Guide the customer through the self-service flow instead.",
    "shoppingGuideSkillsForMaternalAndInfant": "Shopping guide skills for maternal and infant/food products",
    "shoppingGuide": "shopping guide",
    "professionalRecommendationsForAntiColicBabyBottles": "Professional recommendations for anti-colic baby bottles, age-appropriate, and safe ingredients.",
    "motherAndBabyShoppingGuideWordsBaby": "## Mother and baby shopping guide words\n\n### Baby bottle purchase\n- **Anti-colic**: Air valve design, suitable for babies aged 0-6 months who are prone to colic.\n- **Material**: PPSU is high temperature resistant and sterilizable, glass is more stable but heavier.\n\n### Recommended words\n> \"This product is designed to be anti-colic, especially suitable for babies aged 0-6 months. Mothers have reported that babies are more stable after night feeding. The material is food-grade PPSU and can be boiled and sterilized. You can use it with confidence.\"",
    "all": "All",
    "afterSales2": "After-sales",
    "logistics2": "Logistics",
    "marketing2": "Marketing",
    "member2": "member",
    "accountNumber2": "Account number",
    "shoppingGuide2": "shopping guide",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-data-knowledge",
  content: t(content),
};

export default dictionary;
