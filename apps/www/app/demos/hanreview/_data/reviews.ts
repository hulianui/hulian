import { copy } from "./reviews.content";
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
    title: copy("paymentRefundCallbackConnectsToThirdParty"),
    author: { name: copy("zhouMubai") },
    status: "done",
    score: 36,
    coverage: 72,
    gate: "block",
    gateReasons: [copy("seriousIssueExceedsTheUpperLimit")],
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
        newText: copy("exportAsyncFunctionHandlerefundcallbackReqRequestConst"),
        annotations: [
          {
            line: 11,
            severity: "critical",
            author: copy("aiCensor"),
            authorKind: "ai",
            body:
              copy("sqlInjectionOrderidAmountIsDirectlyConcatenated"),
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
            author: copy("aiCensor2"),
            authorKind: "ai",
            body:
              copy("weakControlThirdPartyGatewayCallbacksWill"),
          },
          {
            line: 15,
            severity: "major",
            author: copy("aiCensor3"),
            authorKind: "ai",
            body:
              copy("notifyuserDoesNotProvideAFailureSafety"),
          },
          {
            line: 6,
            severity: "minor",
            author: copy("aiCensor4"),
            authorKind: "ai",
            body: copy("ifVerificationFailsTheXxStatusCode"),
          },
        ],
        routedModelId: "opus",
        routeReason: copy("securitySensitivePathsTheStrongestModel"),
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
        newText: copy("constSecretSkLiveF3c2a9d4e1bTodoWas"),
        annotations: [
          {
            line: 1,
            severity: "critical",
            author: copy("aiCensor5"),
            authorKind: "ai",
            body:
              copy("hardcodeProductionKeysSkLiveTheReal"),
            suggestion: {
              oldText: copy("constSecretSkLiveF3c2a9d4e1bTodoWas2"),
              newText:
                copy("constSecretProcessEnvPaySecretIf"),
            },
          },
          {
            line: 13,
            severity: "major",
            author: copy("aiCensor6"),
            authorKind: "ai",
            body:
              copy("md5IsNoLongerSecureAndUses"),
          },
        ],
        routedModelId: "opus",
        routeReason: copy("securitySensitivePathsTheStrongestModel2"),
        routeCost: 0.0236,
      },
    ],
    steps: [
      {
        kind: "plan",
        title: copy("developAReviewPlan"),
        detail: copy("changesInvolvePaymentRefundCallbacksAndSignature"),
        status: "done",
      },
      {
        kind: "tool",
        title: copy("runEslintSecurityPlugin"),
        tool: "eslint",
        output: "4 problems (2 errors, 2 warnings) — security/detect-object-injection, no-hardcoded-secrets",
        status: "done",
      },
      {
        kind: "tool",
        title: copy("runTheSemgrepSecurityRuleSet"),
        tool: "semgrep",
        output: "2 findings: sql-injection (refundCallback.ts:11), hardcoded-secret (sign.ts:1)",
        status: "done",
      },
      {
        kind: "thinking",
        title: copy("inferenceCallbackIdempotency"),
        detail:
          copy("thirdPartyPaymentGatewaysWillRetryExponentially"),
        status: "done",
      },
      {
        kind: "tool",
        title: copy("runUnitTests"),
        tool: "jest",
        output: copy("testsPassedFailedButLacksReplayInjection"),
        status: "done",
      },
      {
        kind: "summary",
        title: copy("reviewConclusions"),
        detail: copy("threeSeriousIssuesWereFoundSqlInjection"),
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
    title: copy("optimizationOfWorkbenchResourceListAggregationAnd"),
    author: { name: copy("shenZhiwei") },
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
        newText: copy("exportFunctionBuildlistItemsItemTagsTag"),
        annotations: [
          {
            line: 4,
            severity: "major",
            author: copy("aiCensor7"),
            authorKind: "ai",
            body:
              copy("oNComplexityDualLoopOfItems"),
            suggestion: {
              oldText:
                copy("constResultEnrichedForConstItOf"),
              newText:
                "  const tagMap = new Map(tags.map((t) => [t.id, t.name]));\n  const result: Enriched[] = items.map((it) => ({\n    ...it,\n    tagName: tagMap.get(it.tagId),\n  }));",
            },
          },
          {
            line: 14,
            severity: "major",
            author: copy("aiCensor8"),
            authorKind: "ai",
            body:
              copy("nullPointerRiskTagnameMayBeUndefined"),
          },
          {
            line: 9,
            severity: "minor",
            author: copy("aiCensor9"),
            authorKind: "ai",
            body: copy("inDoubleLayerLoopsItemsWithoutMatching"),
          },
          {
            line: 12,
            severity: "info",
            author: copy("aiCensor10"),
            authorKind: "ai",
            body: copy("toSynchronizeSideEffectsRefreshcacheIsMixed"),
          },
        ],
        routedModelId: "sonnet",
        routeReason: copy("defaultEqualizationModel"),
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
        newText: copy("exportFunctionRefreshcacheRowsEnrichedForgotAwait"),
        annotations: [
          {
            line: 3,
            severity: "minor",
            author: copy("aiCensor11"),
            authorKind: "ai",
            body:
              copy("asynchronousWritingWithoutAwaitCacheSetReturns"),
            suggestion: {
              oldText:
                copy("exportFunctionRefreshcacheRowsEnrichedForgotAwait2"),
              newText:
                "export async function refreshCache(rows: Enriched[]) {\n  await cache.set(\"dashboard:list\", rows);",
            },
          },
        ],
        routedModelId: "sonnet",
        routeReason: copy("defaultEqualizationModel2"),
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
        routeReason: copy("testProfileEconomicModel"),
        routeCost: 0.00216,
      },
    ],
    steps: [
      {
        kind: "plan",
        title: copy("developAReviewPlan2"),
        detail: copy("changedToFrontendWorkbenchListAggregationWith"),
        status: "done",
      },
      {
        kind: "tool",
        title: copy("runEslint"),
        tool: "eslint",
        output: "2 warnings — @typescript-eslint/no-floating-promises, no-unsafe-member-access",
        status: "done",
      },
      {
        kind: "thinking",
        title: copy("analyzeComplexityAndNullValues"),
        detail:
          copy("theBuildlistInnerLayerTraversesTagsFor"),
        status: "done",
      },
      {
        kind: "tool",
        title: copy("runUnitTests2"),
        tool: "jest",
        output: "Tests: 9 passed, 0 failed",
        status: "done",
      },
      {
        kind: "summary",
        title: copy("reviewConclusions2"),
        detail: copy("noSeriousIssuesQualityScorePassingAccess"),
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
    title: copy("keyLibraryMasterKeyDerivationAndTenant"),
    author: { name: copy("luHeng") },
    status: "done",
    score: 51,
    coverage: 68,
    gate: "block",
    gateReasons: [copy("seriousIssueExceedingTheUpperLimitOf")],
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
        newText: copy("defDeriveKeyPasswordStrSaltBytes"),
        annotations: [
          {
            line: 10,
            severity: "critical",
            author: copy("aiCensor12"),
            authorKind: "ai",
            body:
              copy("aesEcbModeIsInsecureIdenticalPlaintext"),
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
            author: copy("aiCensor13"),
            authorKind: "ai",
            body:
              copy("fixedDefaultSaltBVaultSharingThe"),
          },
          {
            line: 4,
            severity: "major",
            author: copy("aiCensor14"),
            authorKind: "ai",
            body:
              copy("pbkdf2IterationsHaveBeenReducedFromTo"),
          },
          {
            line: 2,
            severity: "minor",
            author: copy("aiCensor15"),
            authorKind: "ai",
            body: copy("theNoteExplainsUnsafePracticesButDoes"),
          },
        ],
        routedModelId: "opus",
        routeReason: copy("securitySensitivePathsTheStrongestModel3"),
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
        newText: copy("defGetSecretUserSecretIdSecret"),
        annotations: [
          {
            line: 3,
            severity: "major",
            author: copy("aiCensor16"),
            authorKind: "ai",
            body:
              copy("overPermissionAccessIdorCrossTenantValidation"),
            suggestion: {
              oldText:
                copy("crossTenantValidationWasCommentedOutIf"),
              newText:
                "    if secret.tenant_id != user.tenant_id:\n        raise Forbidden()",
            },
          },
        ],
        routedModelId: "opus",
        routeReason: copy("securitySensitivePathsTheStrongestModel4"),
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
        routeReason: copy("testProfileEconomicModel2"),
        routeCost: 0.00224,
      },
    ],
    steps: [
      {
        kind: "plan",
        title: copy("developAReviewPlan3"),
        detail: copy("coreKeyLibraryEncryptionAccessControlAll"),
        status: "done",
      },
      {
        kind: "tool",
        title: copy("runTheBanditSecurityScan"),
        tool: "bandit",
        output: "High: 1 (B305 ECB cipher mode), Medium: 1 (weak KDF iterations)",
        status: "done",
      },
      {
        kind: "thinking",
        title: copy("reasoningAboutMultipleTenantIsolation"),
        detail:
          copy("accessPyTenantIdChecksTheEntire"),
        status: "done",
      },
      {
        kind: "tool",
        title: copy("runPytest"),
        tool: "pytest",
        output: copy("passedButLacksOverreachAndGcmIntegrity"),
        status: "done",
      },
      {
        kind: "summary",
        title: copy("reviewConclusions3"),
        detail: copy("criticalEcbEncryptionCriticalFixedSaltLow"),
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
    title: copy("theNumberOfCornerLabelsInThe"),
    author: { name: copy("linXi") },
    status: "reviewing",
    score: 96,
    coverage: 55,
    gate: "block",
    gateReasons: [copy("coverageIsBelow")],
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
        newText: copy("exportFunctionBadgecountItemsCartitemItShould"),
        annotations: [
          {
            line: 3,
            severity: "minor",
            author: copy("aiCensor17"),
            authorKind: "ai",
            body: copy("theInitialValueOfReduceIsCorrect"),
          },
        ],
        routedModelId: "sonnet",
        routeReason: copy("defaultEqualizationModel3"),
        routeCost: 0.007,
      },
    ],
    steps: [
      {
        kind: "plan",
        title: copy("developAReviewPlan4"),
        detail: copy("repairTheCartCornerCountInA"),
        status: "done",
      },
      {
        kind: "tool",
        title: copy("runEslint2"),
        tool: "eslint",
        output: "0 problems",
        status: "done",
      },
      {
        kind: "thinking",
        title: copy("checkCountingSemantics"),
        detail: copy("theOldImplementationUsesItemsLengthTo"),
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
    title: copy("unifiedButtonRoundedCornersAndFloatingState"),
    author: { name: copy("shenZhiwei2") },
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
            author: copy("aiCensor18"),
            authorKind: "ai",
            body: copy("itIsRecommendedToSubtractRoundedCorners"),
          },
        ],
        routedModelId: "sonnet",
        routeReason: copy("defaultEqualizationModel4"),
        routeCost: 0.007,
      },
    ],
    steps: [
      { kind: "plan", title: copy("developAReviewPlan5"), detail: copy("justAStyleChangeGoThroughIt"), status: "done" },
      { kind: "tool", title: copy("runEslint3"), tool: "eslint", output: "0 problems", status: "done" },
      { kind: "summary", title: copy("reviewConclusions4"), detail: copy("qualityScoreForAccessControlOnlyTokenization"), status: "done" },
    ],
  },

  // rev-006 hanpay-api：failed（审查执行失败）。
  // file lines=16 securitySensitive → opus 0.02+16*0.0002=0.0232
  // annotations 空 → score=100；gate 因失败按 block 兜底（覆盖率 0）
  {
    id: "rev-006",
    repoId: "hanpay-api",
    branch: "feat/payout-batch",
    title: copy("batchPaymentOnBehalfOfTaskScheduling"),
    author: { name: copy("zhouMubai2") },
    status: "failed",
    score: 0,
    coverage: 0,
    gate: "block",
    gateReasons: [copy("reviewExecutionFailureDependencyInstallationTimedOut")],
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
        routeReason: copy("securitySensitivePathsTheStrongestModel5"),
        routeCost: 0.0232,
      },
    ],
    steps: [
      { kind: "plan", title: copy("developAReviewPlan6"), detail: copy("batchPaymentOnBehalfInvolvesFundsAnd"), status: "done" },
      {
        kind: "tool",
        title: copy("installationDependency"),
        tool: "pnpm",
        output: copy("etimedoutRegistryPullTimeoutReviewEnvironmentCannot"),
        status: "done",
      },
      { kind: "summary", title: copy("censorshipInterrupted"), detail: copy("dependencyInstallationFailedNoResultsWereProduced"), status: "done" },
    ],
  },

  // rev-007 hanshop-mobile：queued 排队中。
  // file lines=14 默认 → sonnet 0.006+14*0.00005=0.0067
  {
    id: "rev-007",
    repoId: "hanshop-mobile",
    branch: "feat/coupon-stack",
    title: copy("couponStackingRules"),
    author: { name: copy("linXi2") },
    status: "queued",
    score: 0,
    coverage: 0,
    gate: "block",
    gateReasons: [copy("inTheQueueTheReviewHasNot")],
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
        routeReason: copy("defaultEqualizationModel5"),
        routeCost: 0.0067,
      },
    ],
    steps: [{ kind: "plan", title: copy("awaitingReview"), detail: copy("theTaskHasBeenQueuedAndIs"), status: "pending" }],
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
    title: copy("fillInTheFieldsAndConfigurationOf"),
    author: { name: copy("luHeng2") },
    status: "done",
    score: 86,
    coverage: 48,
    gate: "block",
    gateReasons: [copy("coverageRateIsBelow")],
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
            author: copy("aiCensor19"),
            authorKind: "ai",
            body: copy("printingToStdoutInAuditLogsMay"),
          },
          {
            line: 1,
            severity: "minor",
            author: copy("aiCensor20"),
            authorKind: "ai",
            body: copy("byDefaultIpNoneCausesALarge"),
          },
        ],
        routedModelId: "sonnet",
        routeReason: copy("defaultEqualizationModel6"),
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
        routeReason: copy("testProfileEconomicModel3"),
        routeCost: 0.00212,
      },
    ],
    steps: [
      { kind: "plan", title: copy("developAReviewPlan7"), detail: copy("auditLogFieldExtensionNormalChangesRun"), status: "done" },
      { kind: "tool", title: copy("runRuff"), tool: "ruff", output: "1 warning — T201 print found", status: "done" },
      { kind: "tool", title: copy("runPytest2"), tool: "pytest", output: copy("testsPassedCoverage"), status: "done" },
      { kind: "summary", title: copy("reviewConclusions5"), detail: copy("qualityScoreButCoverageRateIsSubstandard"), status: "done" },
    ],
  },

  // rev-009 hancloud-web：done pass，依赖升级配置。
  // file lines=8 isTestOrConfig → haiku 0.002+8*0.00002=0.00216
  // annotations: info×1 → score=99；coverage=90；gate pass
  {
    id: "rev-009",
    repoId: "hancloud-web",
    branch: "chore/deps-bump",
    title: copy("upgradeBuildDependenciesToTheLatestMinor"),
    author: { name: copy("guYuanzhou") },
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
            author: copy("aiCensor21"),
            authorKind: "ai",
            body: copy("itIsRecommendedToUpdateTheLockfile"),
          },
        ],
        routedModelId: "haiku",
        routeReason: copy("testProfileEconomicModel4"),
        routeCost: 0.00216,
      },
    ],
    steps: [
      { kind: "plan", title: copy("developAReviewPlan8"), detail: copy("dependsOnVersionUpgradesConfigurationFilesAre"), status: "done" },
      { kind: "tool", title: copy("runNpmAudit"), tool: "npm", output: "found 0 vulnerabilities", status: "done" },
      { kind: "summary", title: copy("reviewConclusions6"), detail: copy("qualityScoreForPassingAccessControlOnly"), status: "done" },
    ],
  },

  // rev-010 hanshop-mobile：done pass，列表渲染优化（大文件 → sonnet 大文件分支）。
  // file lines=320 lines>300 → sonnet 0.01+320*0.00006=0.0292
  // annotations: minor×2 → score=100-8=92；coverage=64；crit0 gate pass(cov64≥60)
  {
    id: "rev-010",
    repoId: "hanshop-mobile",
    branch: "perf/product-list-virtual",
    title: copy("virtualRollingRestructuringOfProductListings"),
    author: { name: copy("linXi3") },
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
        oldText: copy("renderAllProductsAtOnceOldImplementation"),
        newText: copy("introducesVirtualScrollingRenderingOnlyTheViewpoint"),
        annotations: [
          {
            line: 3,
            severity: "minor",
            author: copy("aiCensor22"),
            authorKind: "ai",
            body: copy("estimatesizeFixedAtIfTheActualCard"),
          },
          {
            line: 5,
            severity: "minor",
            author: copy("aiCensor23"),
            authorKind: "ai",
            body: copy("containerHeightIsSetToWhichWill"),
          },
        ],
        routedModelId: "sonnet",
        routeReason: copy("largeFileBalancedModel"),
        routeCost: 0.0292,
      },
    ],
    steps: [
      { kind: "plan", title: copy("developAReviewPlan9"), detail: copy("largeFilesLinesAreVirtuallyRolledAnd"), status: "done" },
      { kind: "tool", title: copy("runEslint4"), tool: "eslint", output: "0 errors, 2 warnings", status: "done" },
      {
        kind: "thinking",
        title: copy("checkTheAccuracyOfVirtualization"),
        detail: copy("theUsevirtualizerKeyIsBoundToThe"),
        status: "done",
      },
      { kind: "tool", title: copy("runUnitTests3"), tool: "jest", output: "Tests: 11 passed", status: "done" },
      { kind: "summary", title: copy("reviewConclusions7"), detail: copy("qualityScorePassesAccessControlWithAdaptive"), status: "done" },
    ],
  },
];
