#!/usr/bin/env bash
#
# 定时链路（weekly 全量 sweep + React 18 兼容冒烟）跑完后的唯一出口：把结果落到一个
# 固定的 GitHub issue 上 —— 红了就开/追评，绿了就收尾关掉。
#
# 为什么需要它：定时任务没有「PR 页面上那块红」。GitHub 只给工作流最后修改者发一封
# 与其他上百封 Actions 邮件长得一模一样的通知，实测拦不住任何人 —— 2026-08-05 与
# 08-12 两次 React 18 冒烟连续失败，一直到 08-21 才被人翻出来，中间 08-19 那轮又因为
# Playwright 挂死压根没跑。三周没有信号，而库在这三周里照常发版。
#
# 输入（全部由 workflow 注入）：
#   RESULTS   toJSON(needs)，每个上游 job 的 result
#   RUN_URL   本次 run 的页面地址
#   TRIGGER   人读的触发方式（schedule / workflow_dispatch）
#   SCAN_DIR  可选，下载下来的 hulian-scan 产物根目录
set -euo pipefail

# ⚠️ 正文里紧跟中文标点的变量一律写 ${VAR}：`$TRIGGER）` 里的全角右括号会被 bash
# 当成变量名的一部分，配 set -u 就是一句 "TRIGGER）: unbound variable"。

LABEL="ci-scheduled-failure"
TITLE="CI 定时链路失败（weekly sweep · React 18 冒烟）"

# cancelled 也算失败：2026-08-19 那轮就是被 GitHub 的 6 小时硬上限取消的，
# 结论上与失败没有区别 —— 该跑的门禁一步没跑。
failed="$(printf '%s' "$RESULTS" | jq -r '
  [to_entries[]
   | select(.value.result == "failure" or .value.result == "cancelled")
   | "- `\(.key)` → \(.value.result)"]
  | join("\n")
')"

gh label create "$LABEL" \
  --color B60205 \
  --description "定时 CI 链路（weekly sweep / React 18 冒烟）失败" \
  --force >/dev/null

existing="$(gh issue list --label "$LABEL" --state open --limit 1 --json number --jq '.[0].number // empty')"

if [ -z "$failed" ]; then
  if [ -n "$existing" ]; then
    gh issue comment "$existing" --body "定时链路已恢复绿色（${TRIGGER}）：${RUN_URL}"
    gh issue close "$existing" --reason completed
    echo "closed #$existing"
  else
    echo "green, nothing to report"
  fi
  exit 0
fi

# 把扫描器隔离出来的场景失败直接抄进正文：这类失败的原因（挂载超时 / 没抓到 commit /
# 样本不足）就一行字，值得让人不下载 2.6MB 产物就能看见。
scan_section=""
if [ -n "${SCAN_DIR:-}" ] && [ -d "$SCAN_DIR" ]; then
  while IFS= read -r file; do
    rows="$(jq -r '.[] | "- `\(.scenarioId)` (\(.stage))：\(.reason)"' "$file" 2>/dev/null || true)"
    [ -z "$rows" ] && continue
    scan_section="${scan_section}
**${file#"$SCAN_DIR"/}**

${rows}
"
  done < <(find "$SCAN_DIR" -name failures.json -print | sort)
fi
[ -n "$scan_section" ] && scan_section="

## 量不成的场景
${scan_section}"

body="定时链路这一轮没跑绿（触发方式：${TRIGGER}）。

## 失败的 job

$failed

Run: $RUN_URL${scan_section}

---
这条由 \`.github/scripts/scheduled-run-notice.sh\` 自动发出。定时链路恢复绿色时会自动收尾关闭；
要按需重跑，在 Actions 里手动触发 CI 并勾上 \`sweep\`。"

if [ -n "$existing" ]; then
  gh issue comment "$existing" --body "$body"
  echo "commented on #$existing"
else
  gh issue create --label "$LABEL" --title "$TITLE" --body "$body"
fi
