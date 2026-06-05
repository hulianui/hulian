import type { Review } from "./types";

// 全 mock 内存态。所有 routeCost / score / gate 均按 _lib 纯函数公式手算后写死，
// 严禁运行时 Math.random / Date.now（SSR/CSR 漂移 + 测试稳定）。
//
// 路由成本公式（routeFile，costCap=0.05）：
//   isTestOrConfig → haiku: 0.002 + lines*0.00002
//   securitySensitive → opus: 0.02 + lines*0.0002（>0.05 降级 haiku=0.05）
//   lines>300 → sonnet: 0.01 + lines*0.00006
//   默认 → sonnet: 0.006 + lines*0.00005
// 质量分（qualityScore）：100 − (critical*25 + major*10 + minor*4 + info*1)，clamp 0-100。
// 门禁（evalGate，{minScore:70,maxCritical:0,minCoverage:60}）。

export const REVIEWS: Review[] = [
  // ───────────────────────────────────────────────────────────────
  // [详情页级 1] hanpay-api：支付回调缺幂等 + SQL 注入。安全敏感 → opus。
  // file1 lines=22 securitySensitive → opus cost=0.02+22*0.0002=0.0244
  // file2 lines=18 securitySensitive → opus cost=0.02+18*0.0002=0.0236
  // annotations: critical×2, major×1, minor×1 → score=100-(50+10+4)=36
  // critical=2 → gate block；coverage=72 ok；modelId=opus；cost=0.0244+0.0236=0.048
  // ───────────────────────────────────────────────────────────────
  {
    id: "rev-001",
    repoId: "hanpay-api",
    branch: "feat/refund-callback",
    title: "支付退款回调接入第三方网关",
    author: { name: "周慕白" },
    status: "done",
    score: 36,
    coverage: 72,
    gate: "block",
    gateReasons: ["严重问题 2 超过上限 0"],
    modelId: "opus",
    cost: 0.048,
    createdAt: "2026-06-05 14:23",
    files: [
      {
        path: "src/payment/refundCallback.ts",
        status: "modified",
        additions: 18,
        deletions: 4,
        lang: "ts",
        securitySensitive: true,
        isTestOrConfig: false,
        oldText: `export async function handleRefundCallback(req: Request) {
  const { orderId, amount } = req.body;
  await db.query(
    'UPDATE orders SET status = "refunded" WHERE id = ' + orderId
  );
  return { ok: true };
}`,
        newText: `export async function handleRefundCallback(req: Request) {
  const { orderId, amount, sign } = req.body;
  // 验签
  if (!verifySign(req.body, sign)) {
    return { ok: false, msg: "签名校验失败" };
  }
  // 直接拼接 orderId 进 SQL
  await db.query(
    'UPDATE orders SET status = "refunded", refund_amount = ' +
      amount +
      ' WHERE id = ' + orderId
  );
  await notifyUser(orderId);
  return { ok: true };
}`,
        annotations: [
          {
            line: 11,
            severity: "critical",
            author: "AI 审查官",
            authorKind: "ai",
            body:
              "SQL 注入：orderId / amount 直接字符串拼接进 UPDATE 语句，攻击者可构造 `1; DROP TABLE orders` 篡改任意订单。必须用参数化查询。",
            suggestion: {
              oldText:
                "  await db.query(\n    'UPDATE orders SET status = \"refunded\", refund_amount = ' +\n      amount +\n      ' WHERE id = ' + orderId\n  );",
              newText:
                "  await db.query(\n    'UPDATE orders SET status = ?, refund_amount = ? WHERE id = ?',\n    ['refunded', amount, orderId]\n  );",
            },
          },
          {
            line: 2,
            severity: "critical",
            author: "AI 审查官",
            authorKind: "ai",
            body:
              "缺幂等控制：第三方网关回调会重试，同一 orderId 可能多次进入此函数，导致重复退款 / 重复通知。需先查询订单当前状态或加唯一回调流水号。",
          },
          {
            line: 15,
            severity: "major",
            author: "AI 审查官",
            authorKind: "ai",
            body:
              "notifyUser 未 await 的副作用未做失败兜底；且通知失败不应阻塞回调成功响应，建议改为 fire-and-forget + 落日志。",
          },
          {
            line: 6,
            severity: "minor",
            author: "AI 审查官",
            authorKind: "ai",
            body: "验签失败应返回 4xx 状态码并记录告警日志，当前仅返回业务体易被忽略。",
          },
        ],
        routedModelId: "opus",
        routeReason: "安全敏感路径 → 最强模型",
        routeCost: 0.0244,
      },
      {
        path: "src/payment/sign.ts",
        status: "modified",
        additions: 12,
        deletions: 6,
        lang: "ts",
        securitySensitive: true,
        isTestOrConfig: false,
        oldText: `export function verifySign(body: Record<string, unknown>): boolean {
  const expect = process.env.PAY_SECRET;
  return body.sign === expect;
}`,
        newText: `const SECRET = "sk_live_8f3c2a9d4e1b"; // TODO 上线前替换

export function verifySign(
  body: Record<string, unknown>,
  sign: string,
): boolean {
  const raw = Object.keys(body)
    .sort()
    .map((k) => k + "=" + body[k])
    .join("&");
  const hash = md5(raw + SECRET);
  return hash == sign;
}`,
        annotations: [
          {
            line: 1,
            severity: "critical",
            author: "AI 审查官",
            authorKind: "ai",
            body:
              "硬编码生产密钥：sk_live_ 前缀的真实密钥写进源码会随仓库泄露。必须从环境变量 / 密钥管理服务读取，并立即轮换该密钥。",
            suggestion: {
              oldText: 'const SECRET = "sk_live_8f3c2a9d4e1b"; // TODO 上线前替换',
              newText:
                "const SECRET = process.env.PAY_SECRET;\nif (!SECRET) throw new Error(\"PAY_SECRET 未配置\");",
            },
          },
          {
            line: 13,
            severity: "major",
            author: "AI 审查官",
            authorKind: "ai",
            body:
              "MD5 已不安全且使用 == 宽松比较易受时序攻击。建议改用 HMAC-SHA256 + crypto.timingSafeEqual 常量时间比较。",
          },
        ],
        routedModelId: "opus",
        routeReason: "安全敏感路径 → 最强模型",
        routeCost: 0.0236,
      },
    ],
    steps: [
      {
        kind: "plan",
        title: "制定审查计划",
        detail: "改动涉及支付退款回调与验签，命中安全敏感路径，升级到 Opus 做深度安全审计：先静态扫描，再 grep 注入/密钥模式，最后跑测试。",
        status: "done",
      },
      {
        kind: "tool",
        title: "运行 ESLint + 安全插件",
        tool: "eslint",
        output: "4 problems (2 errors, 2 warnings) — security/detect-object-injection, no-hardcoded-secrets",
        status: "done",
      },
      {
        kind: "tool",
        title: "运行 Semgrep 安全规则集",
        tool: "semgrep",
        output: "2 findings: sql-injection (refundCallback.ts:11), hardcoded-secret (sign.ts:1)",
        status: "done",
      },
      {
        kind: "thinking",
        title: "推理回调幂等性",
        detail:
          "第三方支付网关在未收到 2xx 时会按指数退避重试。当前实现无任何去重，重放同一 orderId 会触发重复 UPDATE 与重复 notifyUser。结合无参数化查询的 SQL，这是可被外部直接利用的高危链路，必须 block。",
        status: "done",
      },
      {
        kind: "tool",
        title: "运行单元测试",
        tool: "jest",
        output: "Tests: 6 passed, 0 failed — 但缺少重放/注入场景用例",
        status: "done",
      },
      {
        kind: "summary",
        title: "审查结论",
        detail: "发现 3 个严重问题（SQL 注入、缺幂等、硬编码密钥），门禁判定 block。建议补参数化查询、幂等流水号与密钥外置后重新提交。",
        status: "done",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // [详情页级 2] hancloud-web：列表 O(n²) + 空指针 + 未 await。
  // file1 service.ts lines=20 默认 → sonnet 0.006+20*0.00005=0.007
  // file2 utils.ts   lines=14 默认 → sonnet 0.006+14*0.00005=0.0067
  // file3 列表配置 lines=8 isTestOrConfig → haiku 0.002+8*0.00002=0.00216
  // annotations: major×2, minor×2, info×1 → score=100-(20+8+1)=71
  // critical=0 → gate pass（score71≥70, crit0, cov80≥60）；modelId=sonnet
  // cost=0.007+0.0067+0.00216=0.01586 → 0.016
  // ───────────────────────────────────────────────────────────────
  {
    id: "rev-002",
    repoId: "hancloud-web",
    branch: "feat/dashboard-list",
    title: "工作台资源列表聚合与排序优化",
    author: { name: "沈知微" },
    status: "done",
    score: 71,
    coverage: 80,
    gate: "pass",
    gateReasons: [],
    modelId: "sonnet",
    cost: 0.016,
    createdAt: "2026-06-05 11:08",
    files: [
      {
        path: "src/dashboard/resourceService.ts",
        status: "modified",
        additions: 16,
        deletions: 4,
        lang: "ts",
        securitySensitive: false,
        isTestOrConfig: false,
        oldText: `export function buildList(items: Item[], tags: Tag[]) {
  return items.map((it) => ({
    ...it,
    tagName: tags.find((t) => t.id === it.tagId)?.name,
  }));
}`,
        newText: `export function buildList(items: Item[], tags: Tag[]) {
  const result: Enriched[] = [];
  for (const it of items) {
    // 每个 item 都全量扫一遍 tags
    for (const t of tags) {
      if (t.id === it.tagId) {
        result.push({ ...it, tagName: t.name });
      }
    }
  }
  // 同步刷新缓存
  refreshCache(result);
  return result.sort((a, b) => a.tagName.length - b.tagName.length);
}`,
        annotations: [
          {
            line: 4,
            severity: "major",
            author: "AI 审查官",
            authorKind: "ai",
            body:
              "O(n²) 复杂度：items × tags 双重循环。资源列表上千条时会明显卡顿。应先把 tags 建成 Map<id, name> 再 O(1) 查找。",
            suggestion: {
              oldText:
                "  const result: Enriched[] = [];\n  for (const it of items) {\n    // 每个 item 都全量扫一遍 tags\n    for (const t of tags) {\n      if (t.id === it.tagId) {\n        result.push({ ...it, tagName: t.name });\n      }\n    }\n  }",
              newText:
                "  const tagMap = new Map(tags.map((t) => [t.id, t.name]));\n  const result: Enriched[] = items.map((it) => ({\n    ...it,\n    tagName: tagMap.get(it.tagId),\n  }));",
            },
          },
          {
            line: 14,
            severity: "major",
            author: "AI 审查官",
            authorKind: "ai",
            body:
              "空指针风险：tagName 可能 undefined（item 无匹配 tag），sort 里 a.tagName.length 会抛 TypeError。需提供默认值或过滤。",
          },
          {
            line: 9,
            severity: "minor",
            author: "AI 审查官",
            authorKind: "ai",
            body: "双层循环里 item 无匹配 tag 时会被直接丢弃，与旧实现（保留 item、tagName 为 undefined）行为不一致，可能造成列表条目缺失。",
          },
          {
            line: 12,
            severity: "info",
            author: "AI 审查官",
            authorKind: "ai",
            body: "refreshCache 为同步副作用混在纯数据构建函数里，建议拆分以保持 buildList 可测试、无副作用。",
          },
        ],
        routedModelId: "sonnet",
        routeReason: "默认 → 均衡模型",
        routeCost: 0.007,
      },
      {
        path: "src/dashboard/utils.ts",
        status: "modified",
        additions: 10,
        deletions: 4,
        lang: "ts",
        securitySensitive: false,
        isTestOrConfig: false,
        oldText: `export async function refreshCache(rows: Enriched[]) {
  await cache.set("dashboard:list", rows);
}`,
        newText: `export function refreshCache(rows: Enriched[]) {
  // 忘了 await，缓存写入与后续读取存在竞态
  cache.set("dashboard:list", rows);
  log.info("cache refreshed: " + rows.length);
}`,
        annotations: [
          {
            line: 3,
            severity: "minor",
            author: "AI 审查官",
            authorKind: "ai",
            body:
              "未 await 的异步写入：cache.set 返回 Promise 但被丢弃，写入未完成就返回，调用方紧接着读缓存会拿到旧值。要么 await，要么显式标注 fire-and-forget。",
            suggestion: {
              oldText:
                "export function refreshCache(rows: Enriched[]) {\n  // 忘了 await，缓存写入与后续读取存在竞态\n  cache.set(\"dashboard:list\", rows);",
              newText:
                "export async function refreshCache(rows: Enriched[]) {\n  await cache.set(\"dashboard:list\", rows);",
            },
          },
        ],
        routedModelId: "sonnet",
        routeReason: "默认 → 均衡模型",
        routeCost: 0.0067,
      },
      {
        path: "src/dashboard/list.config.ts",
        status: "modified",
        additions: 6,
        deletions: 2,
        lang: "ts",
        securitySensitive: false,
        isTestOrConfig: true,
        oldText: `export const listConfig = {
  pageSize: 20,
};`,
        newText: `export const listConfig = {
  pageSize: 20,
  sortBy: "tagName",
  defaultOrder: "asc",
};`,
        annotations: [],
        routedModelId: "haiku",
        routeReason: "测试/配置文件 → 经济模型",
        routeCost: 0.00216,
      },
    ],
    steps: [
      {
        kind: "plan",
        title: "制定审查计划",
        detail: "改动为前端工作台列表聚合，普通业务逻辑走 Sonnet；先性能静态分析，再核对边界与空值。",
        status: "done",
      },
      {
        kind: "tool",
        title: "运行 ESLint",
        tool: "eslint",
        output: "2 warnings — @typescript-eslint/no-floating-promises, no-unsafe-member-access",
        status: "done",
      },
      {
        kind: "thinking",
        title: "分析复杂度与空值",
        detail:
          "buildList 内层对每个 item 全量遍历 tags，时间复杂度 O(n·m)。当列表规模到千级时是可感知的卡顿。同时 tagName 可能 undefined，后续 sort 比较 .length 会运行时崩溃——这两点是本次主要风险。",
        status: "done",
      },
      {
        kind: "tool",
        title: "运行单元测试",
        tool: "jest",
        output: "Tests: 9 passed, 0 failed",
        status: "done",
      },
      {
        kind: "summary",
        title: "审查结论",
        detail: "无严重问题，质量分 71 通过门禁。建议把 tags 改 Map 查找、给 tagName 兜底，并修复未 await 的缓存写入。",
        status: "done",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // [详情页级 3] hanvault-core（Python）：密钥派生 + 越权 + 阻塞 IO。
  // file1 crypto.py lines=26 securitySensitive → opus 0.02+26*0.0002=0.0252
  // file2 access.py lines=20 securitySensitive → opus 0.02+20*0.0002=0.024
  // file3 test_crypto.py lines=12 isTestOrConfig → haiku 0.002+12*0.00002=0.00224
  // annotations: critical×1, major×2, minor×1 → score=100-(25+20+4)=51
  // critical=1 → gate block；coverage=68；modelId=opus；cost=0.0252+0.024+0.00224=0.05144 → 0.051
  // ───────────────────────────────────────────────────────────────
  {
    id: "rev-003",
    repoId: "hanvault-core",
    branch: "feat/key-derivation",
    title: "密钥库主密钥派生与租户访问控制",
    author: { name: "陆衡" },
    status: "done",
    score: 51,
    coverage: 68,
    gate: "block",
    gateReasons: ["严重问题 1 超过上限 0"],
    modelId: "opus",
    cost: 0.051,
    createdAt: "2026-06-05 09:41",
    files: [
      {
        path: "vault/crypto.py",
        status: "modified",
        additions: 20,
        deletions: 6,
        lang: "py",
        securitySensitive: true,
        isTestOrConfig: false,
        oldText: `def derive_key(password: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt, 200_000
    )`,
        newText: `def derive_key(password: str, salt: bytes = b"vault") -> bytes:
    # 用固定盐 + 低迭代次数派生主密钥
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt, 1000
    )


def encrypt(plain: bytes, key: bytes) -> bytes:
    cipher = AES.new(key, AES.MODE_ECB)
    pad = 16 - len(plain) % 16
    plain += bytes([pad]) * pad
    return cipher.encrypt(plain)`,
        annotations: [
          {
            line: 10,
            severity: "critical",
            author: "AI 审查官",
            authorKind: "ai",
            body:
              "AES-ECB 模式不安全：相同明文块产生相同密文块，会泄露数据模式。密钥库加密必须用带随机 IV 的 AES-GCM（兼具机密性与完整性）。",
            suggestion: {
              oldText:
                "    cipher = AES.new(key, AES.MODE_ECB)\n    pad = 16 - len(plain) % 16\n    plain += bytes([pad]) * pad\n    return cipher.encrypt(plain)",
              newText:
                "    nonce = os.urandom(12)\n    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)\n    ct, tag = cipher.encrypt_and_digest(plain)\n    return nonce + tag + ct",
            },
          },
          {
            line: 1,
            severity: "major",
            author: "AI 审查官",
            authorKind: "ai",
            body:
              "固定默认盐 b\"vault\"：所有租户共用同一盐会让彩虹表攻击可行，盐必须每条记录随机生成并与密文一同存储。",
          },
          {
            line: 4,
            severity: "major",
            author: "AI 审查官",
            authorKind: "ai",
            body:
              "PBKDF2 迭代次数从 200000 降到 1000，大幅削弱抗暴力破解能力。OWASP 2026 建议 PBKDF2-SHA256 ≥ 600000 次。",
          },
          {
            line: 2,
            severity: "minor",
            author: "AI 审查官",
            authorKind: "ai",
            body: "注释说明了不安全做法但未给出整改 TODO，建议直接修复而非保留弱实现。",
          },
        ],
        routedModelId: "opus",
        routeReason: "安全敏感路径 → 最强模型",
        routeCost: 0.0252,
      },
      {
        path: "vault/access.py",
        status: "modified",
        additions: 14,
        deletions: 6,
        lang: "py",
        securitySensitive: true,
        isTestOrConfig: false,
        oldText: `def get_secret(user, secret_id):
    secret = db.find(secret_id)
    if secret.tenant_id != user.tenant_id:
        raise Forbidden()
    return secret`,
        newText: `def get_secret(user, secret_id):
    secret = db.find(secret_id)
    # 跨租户校验被注释掉了
    # if secret.tenant_id != user.tenant_id:
    #     raise Forbidden()
    audit.log(user.id, secret_id)
    return secret`,
        annotations: [
          {
            line: 3,
            severity: "major",
            author: "AI 审查官",
            authorKind: "ai",
            body:
              "越权访问（IDOR）：跨租户校验被注释掉，任意用户传入他人 secret_id 即可读取其密钥。必须恢复 tenant_id 校验。",
            suggestion: {
              oldText:
                "    # 跨租户校验被注释掉了\n    # if secret.tenant_id != user.tenant_id:\n    #     raise Forbidden()",
              newText:
                "    if secret.tenant_id != user.tenant_id:\n        raise Forbidden()",
            },
          },
        ],
        routedModelId: "opus",
        routeReason: "安全敏感路径 → 最强模型",
        routeCost: 0.024,
      },
      {
        path: "tests/test_crypto.py",
        status: "added",
        additions: 12,
        deletions: 0,
        lang: "py",
        securitySensitive: false,
        isTestOrConfig: true,
        oldText: ``,
        newText: `def test_derive_key_len():
    k = derive_key("pw", b"s")
    assert len(k) == 32


def test_roundtrip():
    key = derive_key("pw", b"salt")
    ct = encrypt(b"hello world", key)
    assert ct != b"hello world"`,
        annotations: [],
        routedModelId: "haiku",
        routeReason: "测试/配置文件 → 经济模型",
        routeCost: 0.00224,
      },
    ],
    steps: [
      {
        kind: "plan",
        title: "制定审查计划",
        detail: "密钥库核心加密 + 访问控制，全部命中安全敏感路径，升级 Opus。重点核对加密模式、KDF 强度与多租户隔离。",
        status: "done",
      },
      {
        kind: "tool",
        title: "运行 Bandit 安全扫描",
        tool: "bandit",
        output: "High: 1 (B305 ECB cipher mode), Medium: 1 (weak KDF iterations)",
        status: "done",
      },
      {
        kind: "thinking",
        title: "推理多租户隔离",
        detail:
          "access.py 把 tenant_id 校验整段注释，get_secret 仅凭 secret_id 取数。这是典型 IDOR：枚举 secret_id 即可跨租户读密钥。配合 crypto.py 的 ECB 模式，泄露风险叠加放大，必须 block。",
        status: "done",
      },
      {
        kind: "tool",
        title: "运行 pytest",
        tool: "pytest",
        output: "2 passed — 但缺少越权与 GCM 完整性用例",
        status: "done",
      },
      {
        kind: "summary",
        title: "审查结论",
        detail: "1 个严重（ECB 加密）+ 2 个重要（固定盐、低迭代、越权），门禁 block。恢复租户校验、改 AES-GCM、随机盐 + 高迭代后重审。",
        status: "done",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // 轻量记录 ─────────────────────────────────────────────────────
  // rev-004 hanshop-mobile：reviewing 进行中。
  // file lines=12 默认 → sonnet 0.006+12*0.00005=0.0066
  // annotations: minor×1 → score=100-4=96；coverage=55；crit0 gate block(cov<60)
  // ───────────────────────────────────────────────────────────────
  {
    id: "rev-004",
    repoId: "hanshop-mobile",
    branch: "fix/cart-badge",
    title: "购物车角标数量同步修复",
    author: { name: "林夕" },
    status: "reviewing",
    score: 96,
    coverage: 55,
    gate: "block",
    gateReasons: ["覆盖率 55% 低于 60%"],
    modelId: "sonnet",
    cost: 0.007,
    createdAt: "2026-06-05 15:02",
    files: [
      {
        path: "src/cart/badge.ts",
        status: "modified",
        additions: 8,
        deletions: 4,
        lang: "ts",
        securitySensitive: false,
        isTestOrConfig: false,
        oldText: `export function badgeCount(items: CartItem[]) {
  return items.length;
}`,
        newText: `export function badgeCount(items: CartItem[]) {
  // 应按数量求和而非条目数
  return items.reduce((s, it) => s + it.qty, 0);
}`,
        annotations: [
          {
            line: 3,
            severity: "minor",
            author: "AI 审查官",
            authorKind: "ai",
            body: "reduce 初始值正确，但 it.qty 可能为 undefined（脏数据），建议 + (it.qty ?? 0) 兜底。",
          },
        ],
        routedModelId: "sonnet",
        routeReason: "默认 → 均衡模型",
        routeCost: 0.007,
      },
    ],
    steps: [
      {
        kind: "plan",
        title: "制定审查计划",
        detail: "小范围修复购物车角标计数，走 Sonnet。",
        status: "done",
      },
      {
        kind: "tool",
        title: "运行 ESLint",
        tool: "eslint",
        output: "0 problems",
        status: "done",
      },
      {
        kind: "thinking",
        title: "核对计数语义",
        detail: "旧实现用 items.length 把每个商品计 1，与实际购买数量不符。新实现 reduce 求和正确，仅需对 qty 做空值兜底。覆盖率偏低，正在补充用例…",
        status: "running",
      },
    ],
  },

  // rev-005 hancloud-web：done 通过，纯样式小改。
  // file lines=10 默认 → sonnet 0.006+10*0.00005=0.0065
  // annotations: info×1 → score=99；coverage=88；gate pass
  {
    id: "rev-005",
    repoId: "hancloud-web",
    branch: "style/button-radius",
    title: "统一按钮圆角与悬浮态",
    author: { name: "沈知微" },
    status: "done",
    score: 99,
    coverage: 88,
    gate: "pass",
    gateReasons: [],
    modelId: "sonnet",
    cost: 0.007,
    createdAt: "2026-06-04 17:36",
    files: [
      {
        path: "src/components/Button.tsx",
        status: "modified",
        additions: 6,
        deletions: 4,
        lang: "tsx",
        securitySensitive: false,
        isTestOrConfig: false,
        oldText: `<button className="btn rounded-sm hover:opacity-80">
  {children}
</button>`,
        newText: `<button className="btn rounded-md transition-colors hover:bg-primary/90">
  {children}
</button>`,
        annotations: [
          {
            line: 1,
            severity: "info",
            author: "AI 审查官",
            authorKind: "ai",
            body: "建议把圆角值抽成 design token（如 radius-md），避免散落的 rounded-* 不一致。",
          },
        ],
        routedModelId: "sonnet",
        routeReason: "默认 → 均衡模型",
        routeCost: 0.007,
      },
    ],
    steps: [
      { kind: "plan", title: "制定审查计划", detail: "纯样式改动，快速过一遍。", status: "done" },
      { kind: "tool", title: "运行 ESLint", tool: "eslint", output: "0 problems", status: "done" },
      { kind: "summary", title: "审查结论", detail: "质量分 99 通过门禁，仅 1 条 token 化建议。", status: "done" },
    ],
  },

  // rev-006 hanpay-api：failed（审查执行失败）。
  // file lines=16 securitySensitive → opus 0.02+16*0.0002=0.0232
  // annotations 空 → score=100；gate 因失败按 block 兜底（覆盖率 0）
  {
    id: "rev-006",
    repoId: "hanpay-api",
    branch: "feat/payout-batch",
    title: "批量代付任务调度",
    author: { name: "周慕白" },
    status: "failed",
    score: 0,
    coverage: 0,
    gate: "block",
    gateReasons: ["审查执行失败：依赖安装超时，未产出结果"],
    modelId: "opus",
    cost: 0.023,
    createdAt: "2026-06-04 16:10",
    files: [
      {
        path: "src/payout/batchJob.ts",
        status: "added",
        additions: 12,
        deletions: 4,
        lang: "ts",
        securitySensitive: true,
        isTestOrConfig: false,
        oldText: ``,
        newText: `export async function runBatch(taskId: string) {
  const items = await loadPayouts(taskId);
  for (const it of items) {
    await transfer(it.account, it.amount);
  }
}`,
        annotations: [],
        routedModelId: "opus",
        routeReason: "安全敏感路径 → 最强模型",
        routeCost: 0.0232,
      },
    ],
    steps: [
      { kind: "plan", title: "制定审查计划", detail: "代付批处理涉及资金，升级 Opus。", status: "done" },
      {
        kind: "tool",
        title: "安装依赖",
        tool: "pnpm",
        output: "ETIMEDOUT: registry 拉取超时，审查环境无法构建",
        status: "done",
      },
      { kind: "summary", title: "审查中断", detail: "依赖安装失败，本次审查未产出结果，请重试。", status: "done" },
    ],
  },

  // rev-007 hanshop-mobile：queued 排队中。
  // file lines=14 默认 → sonnet 0.006+14*0.00005=0.0067
  {
    id: "rev-007",
    repoId: "hanshop-mobile",
    branch: "feat/coupon-stack",
    title: "优惠券叠加规则",
    author: { name: "林夕" },
    status: "queued",
    score: 0,
    coverage: 0,
    gate: "block",
    gateReasons: ["排队中，尚未开始审查"],
    modelId: "sonnet",
    cost: 0,
    createdAt: "2026-06-05 15:20",
    files: [
      {
        path: "src/coupon/stackRule.ts",
        status: "added",
        additions: 10,
        deletions: 4,
        lang: "ts",
        securitySensitive: false,
        isTestOrConfig: false,
        oldText: ``,
        newText: `export function canStack(a: Coupon, b: Coupon) {
  return a.stackable && b.stackable;
}`,
        annotations: [],
        routedModelId: "sonnet",
        routeReason: "默认 → 均衡模型",
        routeCost: 0.0067,
      },
    ],
    steps: [{ kind: "plan", title: "等待审查", detail: "任务已入队，等待审查 worker 空闲。", status: "pending" }],
  },

  // rev-008 hanvault-core：done block（覆盖率不足）。
  // file1 audit.py lines=18 默认 → sonnet 0.006+18*0.00005=0.0069
  // file2 config.yaml lines=6 isTestOrConfig → haiku 0.002+6*0.00002=0.00212
  // annotations: major×1, minor×1 → score=100-(10+4)=86；coverage=48；crit0 → block(cov<60)
  // modelId=sonnet（无 opus/无大文件）；cost=0.0069+0.00212=0.00902 → 0.009
  {
    id: "rev-008",
    repoId: "hanvault-core",
    branch: "chore/audit-log",
    title: "审计日志补字段与配置",
    author: { name: "陆衡" },
    status: "done",
    score: 86,
    coverage: 48,
    gate: "block",
    gateReasons: ["覆盖率 48% 低于 60%"],
    modelId: "sonnet",
    cost: 0.009,
    createdAt: "2026-06-04 10:55",
    files: [
      {
        path: "vault/audit.py",
        status: "modified",
        additions: 12,
        deletions: 6,
        lang: "py",
        securitySensitive: false,
        isTestOrConfig: false,
        oldText: `def log(user_id, action):
    writer.append({"u": user_id, "a": action})`,
        newText: `def log(user_id, action, ip=None):
    writer.append({
        "u": user_id,
        "a": action,
        "ip": ip,
        "ts": time.time(),
    })
    print("audit:", user_id, action)`,
        annotations: [
          {
            line: 8,
            severity: "major",
            author: "AI 审查官",
            authorKind: "ai",
            body: "审计日志里 print 到 stdout 可能把用户标识打进容器日志，造成 PII 泄露，应移除或脱敏后走结构化日志。",
          },
          {
            line: 1,
            severity: "minor",
            author: "AI 审查官",
            authorKind: "ai",
            body: "ip 默认 None 会让大量审计记录缺失来源，建议在调用层强制传入。",
          },
        ],
        routedModelId: "sonnet",
        routeReason: "默认 → 均衡模型",
        routeCost: 0.0069,
      },
      {
        path: "config/audit.yaml",
        status: "modified",
        additions: 4,
        deletions: 2,
        lang: "yaml",
        securitySensitive: false,
        isTestOrConfig: true,
        oldText: `audit:
  enabled: true`,
        newText: `audit:
  enabled: true
  retention_days: 90
  fields: [u, a, ip, ts]`,
        annotations: [],
        routedModelId: "haiku",
        routeReason: "测试/配置文件 → 经济模型",
        routeCost: 0.00212,
      },
    ],
    steps: [
      { kind: "plan", title: "制定审查计划", detail: "审计日志字段扩展，普通改动走 Sonnet，配置文件走 Haiku。", status: "done" },
      { kind: "tool", title: "运行 ruff", tool: "ruff", output: "1 warning — T201 print found", status: "done" },
      { kind: "tool", title: "运行 pytest", tool: "pytest", output: "Tests: 3 passed — 覆盖率 48%", status: "done" },
      { kind: "summary", title: "审查结论", detail: "质量分 86 但覆盖率 48% 不达标，门禁 block。补测试并移除 print 后通过。", status: "done" },
    ],
  },

  // rev-009 hancloud-web：done pass，依赖升级配置。
  // file lines=8 isTestOrConfig → haiku 0.002+8*0.00002=0.00216
  // annotations: info×1 → score=99；coverage=90；gate pass
  {
    id: "rev-009",
    repoId: "hancloud-web",
    branch: "chore/deps-bump",
    title: "升级构建依赖到最新小版本",
    author: { name: "顾远舟" },
    status: "done",
    score: 99,
    coverage: 90,
    gate: "pass",
    gateReasons: [],
    modelId: "haiku",
    cost: 0.002,
    createdAt: "2026-06-04 09:12",
    files: [
      {
        path: "package.json",
        status: "modified",
        additions: 6,
        deletions: 2,
        lang: "json",
        securitySensitive: false,
        isTestOrConfig: true,
        oldText: `{
  "dependencies": {
    "vite": "5.2.0"
  }
}`,
        newText: `{
  "dependencies": {
    "vite": "5.4.11",
    "esbuild": "0.24.0"
  }
}`,
        annotations: [
          {
            line: 4,
            severity: "info",
            author: "AI 审查官",
            authorKind: "ai",
            body: "建议同步更新 lockfile 并跑一次 audit，确认无新引入的高危传递依赖。",
          },
        ],
        routedModelId: "haiku",
        routeReason: "测试/配置文件 → 经济模型",
        routeCost: 0.00216,
      },
    ],
    steps: [
      { kind: "plan", title: "制定审查计划", detail: "依赖版本提升，配置文件走 Haiku 快速核对。", status: "done" },
      { kind: "tool", title: "运行 npm audit", tool: "npm", output: "found 0 vulnerabilities", status: "done" },
      { kind: "summary", title: "审查结论", detail: "质量分 99 通过门禁，仅提醒同步 lockfile。", status: "done" },
    ],
  },

  // rev-010 hanshop-mobile：done pass，列表渲染优化（大文件 → sonnet 大文件分支）。
  // file lines=320 lines>300 → sonnet 0.01+320*0.00006=0.0292
  // annotations: minor×2 → score=100-8=92；coverage=64；crit0 gate pass(cov64≥60)
  {
    id: "rev-010",
    repoId: "hanshop-mobile",
    branch: "perf/product-list-virtual",
    title: "商品列表虚拟滚动重构",
    author: { name: "林夕" },
    status: "done",
    score: 92,
    coverage: 64,
    gate: "pass",
    gateReasons: [],
    modelId: "sonnet",
    cost: 0.029,
    createdAt: "2026-06-03 19:48",
    files: [
      {
        path: "src/product/ProductList.tsx",
        status: "modified",
        additions: 220,
        deletions: 100,
        lang: "tsx",
        securitySensitive: false,
        isTestOrConfig: false,
        oldText: `// 一次性渲染全部商品（旧实现，省略大段 JSX）
export function ProductList({ items }: { items: Product[] }) {
  return <div>{items.map((it) => <Card key={it.id} item={it} />)}</div>;
}`,
        newText: `// 引入虚拟滚动，仅渲染可视区（大文件，省略大段 JSX）
export function ProductList({ items }: { items: Product[] }) {
  const v = useVirtualizer({ count: items.length, estimateSize: () => 96 });
  return (
    <div ref={parentRef} style={{ overflow: "auto", height: 600 }}>
      {v.getVirtualItems().map((row) => (
        <Card key={items[row.index].id} item={items[row.index]} />
      ))}
    </div>
  );
}`,
        annotations: [
          {
            line: 3,
            severity: "minor",
            author: "AI 审查官",
            authorKind: "ai",
            body: "estimateSize 固定 96 与实际卡片高度不一致时会出现滚动抖动，建议测量真实高度或用动态测量。",
          },
          {
            line: 5,
            severity: "minor",
            author: "AI 审查官",
            authorKind: "ai",
            body: "容器 height 写死 600，小屏机型会露白，建议用百分比 / 视口高度自适应。",
          },
        ],
        routedModelId: "sonnet",
        routeReason: "大文件 → 均衡模型",
        routeCost: 0.0292,
      },
    ],
    steps: [
      { kind: "plan", title: "制定审查计划", detail: "大文件（>300 行）虚拟滚动重构，命中大文件分支走 Sonnet。", status: "done" },
      { kind: "tool", title: "运行 ESLint", tool: "eslint", output: "0 errors, 2 warnings", status: "done" },
      {
        kind: "thinking",
        title: "核对虚拟化正确性",
        detail: "useVirtualizer 的 key 绑定到真实 item.id 而非 row.index，避免复用错位，方向正确。主要风险是固定行高与固定容器高度的适配，列为 minor。",
        status: "done",
      },
      { kind: "tool", title: "运行单元测试", tool: "jest", output: "Tests: 11 passed", status: "done" },
      { kind: "summary", title: "审查结论", detail: "质量分 92 通过门禁，2 条尺寸自适应优化建议。", status: "done" },
    ],
  },
];
