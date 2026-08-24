# Issues #323–#328 Batch Integration and Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the five independently tested component fixes, merge them through one batch PR, close #323–#328, and publish/verify the resulting `@hulianui/ui` release.

**Architecture:** PR #329 lands #322 first; the batch branch is then transplanted onto the verified master without replaying equivalent #322 commits. Issues #324–#328 remain independent commits, while #323 is closed only as an umbrella after all child capabilities pass full CI; release/version state is handled separately from feature delivery.

**Tech Stack:** Git worktrees, GitHub CLI, GitHub Actions, Changesets, pnpm, npm registry, Hulian docs/registry pipelines.

**Spec:** `docs/superpowers/specs/2026-08-24-consumer-gap-issues-323-328-design.md`

**Feature plans:**

- `docs/superpowers/plans/2026-08-24-issue-324-stack-item.md`
- `docs/superpowers/plans/2026-08-24-issue-325-card-size.md`
- `docs/superpowers/plans/2026-08-24-issue-326-text-typography.md`
- `docs/superpowers/plans/2026-08-24-issue-327-dot-field-positioning.md`
- `docs/superpowers/plans/2026-08-24-issue-328-select-multiselect.md`

## Global Constraints

- Use Node `22.22.3` from `.nvmrc` and pnpm `8.15.5` for every pnpm command.
- Preserve unrelated work in the main checkout and stage only files belonging to the current Issue.
- Do not claim an Issue delivered until the PR is merged, master contains the feature SHA/equivalent tree, and merged CI/deploy health is green.
- Do not claim a release until the npm version, public docs/registry, and a fresh consumer are verified.
- Never put credentials or tokens in argv, logs, PR text, or plan artifacts.
- Execute the five feature plans in Issue order and retain one independently revertible commit per Issue.

---

### Task 1: Land #322 and rebase the batch worktree safely

**Files:**
- No source edits.
- Existing worktree: `.worktrees/issues-323-328-consumer-gaps`

**Interfaces:**
- Consumes: PR #329 and local base boundary `2002d738`.
- Produces: `feat/issues-323-328-consumer-gaps` based on current `origin/master`, retaining only design/plan commits above the old #322 boundary.

- [ ] **Step 1: Verify PR #329 state and checks**

```bash
gh pr view 329 --json state,isDraft,mergeable,mergeStateStatus,headRefOid,statusCheckRollup,url
gh pr checks 329 --watch --interval 10
```

Expected: state `OPEN`, not draft, mergeable, and every required check exits success. If already merged, skip the merge command and verify it instead.

- [ ] **Step 2: Merge PR #329 using an allowed repository method**

```bash
gh pr merge 329 --merge --delete-branch
```

If repository rules reject merge commits, use `gh pr merge 329 --squash --delete-branch`. Do not force-push or change branch protection.

- [ ] **Step 3: Verify master contains the delivered #322 tree**

```bash
git fetch origin --prune
gh pr view 329 --json state,mergedAt,mergeCommit,url
git show origin/master:packages/ui/src/animated-shiny-text/animated-shiny-text.tsx \
  | rg 'inline-block|max-w|mx-auto'
```

Expected: PR state `MERGED`; the file matches #322's approved behavior (consumer-owned width/alignment), regardless of whether GitHub preserved or squashed its original SHA.

- [ ] **Step 4: Transplant only batch documentation onto current master**

From the isolated worktree:

```bash
git status --short
git rebase --onto origin/master 2002d738 feat/issues-323-328-consumer-gaps
git log --oneline --decorate -6
git diff --stat origin/master...HEAD
```

Expected: clean worktree; commits above old boundary `2002d738` are replayed, while the two #322 commits are not duplicated. The diff at this point contains only the approved spec and plan documents.

### Task 2: Execute the five Issue plans in order

**Files:**
- Modify only files listed by each feature plan.

**Interfaces:**
- Consumes: all five feature plan documents.
- Produces: five self-contained commits for #324, #325, #326, #327, #328.

- [ ] **Step 1: Execute Issue #324 plan completely**

Read and check off `2026-08-24-issue-324-stack-item.md`. Stop if its focused test, typecheck, generator, mutation, or commit gate fails. Expected commit subject:

```txt
feat(ui): add StackItem flex sizing (#324)
```

- [ ] **Step 2: Execute Issue #325 plan completely**

Read and check off `2026-08-24-issue-325-card-size.md`. Expected commit subject:

```txt
feat(ui): add compact Card density (#325)
```

- [ ] **Step 3: Execute Issue #326 plan completely**

Read and check off `2026-08-24-issue-326-text-typography.md`. Expected commit subject:

```txt
feat(ui): add Text typography semantics (#326)
```

- [ ] **Step 4: Execute Issue #327 plan completely**

Read and check off `2026-08-24-issue-327-dot-field-positioning.md`. Expected commit subject:

```txt
fix(ui): make DotField fill positioned parents (#327)
```

- [ ] **Step 5: Execute Issue #328 plan completely**

Read and check off `2026-08-24-issue-328-select-multiselect.md`. Expected commit subject:

```txt
feat(ui): improve Select multiselect workflows (#328)
```

- [ ] **Step 6: Verify commit isolation**

```bash
git log --oneline --reverse origin/master..HEAD
git status --short
```

Expected: design/plan commits followed by exactly five feature commits; no uncommitted production changes.

### Task 3: Add the batch changeset

**Files:**
- Create: `.changeset/consumer-layout-select.md`

**Interfaces:**
- Consumes: completed public APIs from #324–#328 and the existing #322 patch changeset.
- Produces: one minor release intent for `@hulianui/ui`.

- [ ] **Step 1: Create the exact changeset**

```md
---
"@hulianui/ui": minor
---

新增 StackItem 弹性尺寸语义、Card 紧凑密度、Text 字族与等宽数字能力，并修复 DotField 覆盖定位；Select 多选新增选中项优先排序和可删除 chips。CardBody 正文现在继承消费方字号。
```

- [ ] **Step 2: Verify Changesets sees the release intent**

```bash
pnpm exec changeset status
git diff --check
```

Expected: `@hulianui/ui` is scheduled for a minor bump. If the unconsumed #322 patch is also present, the resulting package bump remains minor.

- [ ] **Step 3: Commit the changeset separately**

```bash
git add .changeset/consumer-layout-select.md
git commit -m "chore: add consumer gap release note (#323)"
```

Expected: one changeset-only commit.

### Task 4: Run full local verification from fresh generated inputs

**Files:**
- No intended tracked edits except generated artifacts already defined by repository scripts.

**Interfaces:**
- Consumes: complete batch branch.
- Produces: local evidence corresponding to CI, browser, docs, packed-consumer, and size gates.

- [ ] **Step 1: Activate the repository toolchain and regenerate ignored inputs first**

```bash
source /Users/zhangzhiwei/.nvm/nvm.sh
nvm use --silent
node --version
pnpm --version
pnpm llms-registry
pnpm conventions
```

Expected: Node `v22.22.3`, pnpm `8.15.5`, both generators exit 0.

- [ ] **Step 2: Run unit, browser, script, and type gates**

```bash
pnpm test
pnpm typecheck
pnpm test:scripts
pnpm --filter @hulianui/ui build:types
rm -rf packages/ui/dist
```

Expected: all commands exit 0; the test summary includes the new DotField/Select Chromium files.

- [ ] **Step 3: Run registry, docs, static, and size gates**

```bash
pnpm registry:smoke:pages
pnpm docs:all
pnpm docs:check:props
pnpm docs:i18n:check
pnpm showcase:check
pnpm candidates:check
pnpm check:remote-assets
pnpm check:rsc-claims
pnpm deps:family
pnpm guard -- apps/www/app/blocks/_blocks apps/www/app/pages/_pages packages/ui/src
pnpm size
pnpm --filter www build
```

Expected: all commands exit 0 and static export completes.

- [ ] **Step 4: Run local browser acceptance against the built site**

```bash
pnpm docs:check:showcase-browser
pnpm a11y
pnpm viewport
pnpm gallery
```

Expected: hydrated showcase, accessibility, responsive viewport, and gallery budget gates pass against the current static output.

- [ ] **Step 5: Confirm the branch is clean and scoped**

```bash
git diff --check
git status --short
git diff --stat origin/master...HEAD
```

Expected: no uncommitted tracked changes and no unrelated modules in the branch diff.

### Task 5: Open, monitor, and merge the batch PR

**Files:**
- No local file edits.

**Interfaces:**
- Consumes: verified feature branch and GitHub Issues #323–#328.
- Produces: merged batch PR that automatically closes all six Issues.

- [ ] **Step 1: Push the batch branch**

```bash
git push -u origin feat/issues-323-328-consumer-gaps
```

Expected: remote branch points to the locally verified HEAD.

- [ ] **Step 2: Create the PR with explicit closure and evidence**

```bash
gh pr create \
  --base master \
  --head feat/issues-323-328-consumer-gaps \
  --title "feat(ui): close consumer layout and multiselect gaps" \
  --body $'## Summary\n- add StackItem flex sizing\n- add Card density and inherited body typography\n- add Text family/numeric semantics\n- fix DotField overlay positioning\n- add Select selected-first and removable chips\n\n## Verification\n- pnpm llms-registry && pnpm conventions\n- pnpm test\n- pnpm typecheck\n- pnpm test:scripts\n- pnpm registry:smoke:pages\n- pnpm size\n- pnpm --filter www build\n- Chromium component/browser gates\n\nCloses #323\nCloses #324\nCloses #325\nCloses #326\nCloses #327\nCloses #328'
```

Expected: one open PR whose diff contains the approved spec/plans, five feature commits, and changeset.

- [ ] **Step 3: Inspect the remote diff and checks**

```bash
gh pr view --json number,url,state,isDraft,mergeable,mergeStateStatus,commits,files
gh pr checks --watch --interval 10
```

Expected: all required CI, Cloudflare/docs, packed-consumer, and downstream gates succeed. Investigate and fix failures on the feature branch; do not merge red.

- [ ] **Step 4: Merge and verify Issue delivery**

```bash
batch_pr=$(gh pr view --json number --jq .number)
gh pr merge "$batch_pr" --merge --delete-branch
git fetch origin --prune
gh pr view "$batch_pr" --json state,mergedAt,mergeCommit,url
for issue in 323 324 325 326 327 328; do gh issue view "$issue" --json number,state,url; done
```

Expected: PR state `MERGED`; every Issue state `CLOSED`; `origin/master` contains the merged feature tree.

- [ ] **Step 5: Verify post-merge master workflows**

```bash
merge_sha=$(gh pr view "$batch_pr" --json mergeCommit --jq .mergeCommit.oid)
gh run list --branch master --commit "$merge_sha" --limit 20
```

Watch the CI/deploy runs associated with `merge_sha` using `gh run watch <run-id> --exit-status`. Issue delivery is complete only after required master CI and deployment runs pass.

### Task 6: Create and merge version output when required

**Files:**
- Changesets-generated package versions, changelogs, registry and changelog JSON on a dedicated release branch.

**Interfaces:**
- Consumes: merged master with unconsumed changesets.
- Produces: versioned master commit ready for `changeset publish`.

- [ ] **Step 1: Inspect the Release workflow result**

```bash
gh run list --workflow Release --branch master --limit 5
```

Open the run tied to the batch merge with `gh run view <run-id> --log-failed`. If it successfully created/updated a Version Packages PR, inspect that PR and proceed to Step 4. If the organization permission blocks PR creation, use Steps 2–3.

- [ ] **Step 2: Create an isolated release worktree from current master**

```bash
git fetch origin --prune
git worktree add .worktrees/release-consumer-gaps -b release/consumer-gaps origin/master
cd .worktrees/release-consumer-gaps
source /Users/zhangzhiwei/.nvm/nvm.sh
nvm use --silent
pnpm install --frozen-lockfile
pnpm version-packages
```

Expected: changesets are consumed; package version/changelogs plus committed registry/changelog artifacts are updated. The expected UI version is normally `0.57.0` from `0.56.1` plus a minor changeset, but the generated files are the authority.

- [ ] **Step 3: Verify and open the release PR**

```bash
pnpm registry:version
pnpm typecheck
pnpm test
git diff --check
git status --short
git add .changeset packages/ui/package.json packages/ui/CHANGELOG.md apps/www/public/registry.json apps/www/lib/changelog.json
git add --update
git diff --cached --check
git commit -m "chore(release): version packages"
git push -u origin release/consumer-gaps
gh pr create --base master --head release/consumer-gaps --title "chore(release): version packages" --body $'Consumes the merged changesets for #322 and #323-#328.\n\nVerification:\n- pnpm registry:version\n- pnpm typecheck\n- pnpm test'
```

Before committing, compare `git status --short` with the actual `pnpm version-packages` output and include every generated tracked artifact; the explicit paths above are the known minimum, not permission to omit another generator-owned tracked file.

- [ ] **Step 4: Merge the green version PR**

```bash
release_pr=$(gh pr list --state open --search 'in:title "chore(release): version packages"' --json number --jq '.[0].number')
gh pr checks "$release_pr" --watch --interval 10
gh pr merge "$release_pr" --merge --delete-branch
```

Expected: version PR merged only after required checks pass.

### Task 7: Verify npm publish, public deployment, and fresh consumption

**Files:**
- No repository edits.

**Interfaces:**
- Consumes: merged version commit and Release workflow.
- Produces: external release evidence.

- [ ] **Step 1: Watch the publish run**

```bash
git fetch origin --prune
release_sha=$(git rev-parse origin/master)
gh run list --workflow Release --branch master --commit "$release_sha" --limit 5
```

Watch the matching run with `gh run watch <run-id> --exit-status`. Expected: `Version or Publish` succeeds and creates the git tag.

- [ ] **Step 2: Verify npm and tag agree**

```bash
repo_version=$(git show origin/master:packages/ui/package.json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).version))')
npm_version=$(npm view @hulianui/ui version)
test "$repo_version" = "$npm_version"
git ls-remote --tags origin "refs/tags/@hulianui/ui@$repo_version"
```

Expected: repository and npm versions match and the release tag exists.

- [ ] **Step 3: Verify public docs and registry expose the version/APIs**

```bash
curl --fail --silent --show-error https://hulianui.haloritual.com/registry.json \
  | rg "\"version\":\"$repo_version\"|StackItem|selectedFirst|removable"
curl --fail --silent --show-error https://hulianui.haloritual.com/components/stack \
  | rg 'StackItem'
curl --fail --silent --show-error https://hulianui.haloritual.com/components/select \
  | rg 'selectedFirst|removable|chips'
```

If the site uses locale-prefixed component URLs, resolve the exact URLs from the deployed registry/docs navigation and rerun the same content checks. Expected: HTTP success and current API text.

- [ ] **Step 4: Install the public version in a fresh temporary consumer**

```bash
consumer_dir=$(mktemp -d /tmp/hulian-consumer-gaps.XXXXXX)
cd "$consumer_dir"
pnpm init
pnpm add "@hulianui/ui@$repo_version" @hulianui/tokens react react-dom @base-ui/react motion tailwindcss vite typescript
EXPECTED_VERSION="$repo_version" node -e "const p=require('./node_modules/@hulianui/ui/package.json'); if(p.version !== process.env.EXPECTED_VERSION) process.exit(1)"
```

Create a minimal TypeScript/TSX consumer using the published `StackItem`, `Card size="sm"`, `Text family/numeric`, `DotField`, and `Select selectedFirst` plus `SelectTrigger display="chips" removable`; run `pnpm exec tsc --noEmit` with React JSX and bundler module resolution. Use `apply_patch` to create those temporary source/config files if executing under Codex.

- [ ] **Step 5: Report the four evidence states separately**

Final handoff must include:

```txt
Local: full commands and summaries
PR/Issue: PR URLs, merge SHAs, #323-#328 closed states
Release: package version, tag, Release workflow run
Public consumer: docs/registry URLs and fresh typecheck result
```

Only after all four lines have passing evidence may the batch be reported as fully released.
