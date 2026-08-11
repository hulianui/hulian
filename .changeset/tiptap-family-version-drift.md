---
"@hulianui/ui": minor
---

修掉 0.30.0 带旧 lockfile 升级时的 5 条 unmet peer：tiptap 全族 specifier 一起抬到 `^3.30.0`，并加一道静态门禁把这条约定机械化（#207）。

**根因不在版本号高低，在「我们写范围、被依赖方写精确值」这个错位。** tiptap 全家的 `peerDependencies` 钉的是精确版本（`@tiptap/extension-table@3.30.0` 要的是 `@tiptap/core: "3.30.0"`、`@tiptap/pm: "3.30.0"`，不是 `^3.30.0`），所以我们写的 `^3.29.2` 只在**整族在同一次解析里被一起决定**时才成立。全新安装天然满足这个前提，这也正是库自己的 CI 一路绿灯的原因；**带着旧 lockfile 升级的消费方恰恰不满足**：0.30.0 为 `RichTextEditor` 新添了 4 个扩展，而消费方锁里 `@tiptap/core` / `@tiptap/pm` 早已固定在 3.29.2 —— 老成员的 specifier 没变、锁被原样保留，只有 4 个新成员是第一次进锁、按范围取到当时最新的 3.30.0，两边当场对不上。装出来跑的是 `extension@3.30.0 + core@3.29.2`，而 tiptap 把 peer 钉成精确值本身就说明它不担保跨版本的内部 API 兼容。

**修法刻意不是「把 specifier 改成精确版本」—— 那条路实测更糟，不是理论顾虑。** `@tiptap/starter-kit` 自己的 `dependencies` 用的是 `^3.x`，会把 `core` / `extensions` 拉到家族最新版；一旦我们把扩展钉死在某个精确版本，**全新解析当场就裂**（实测 `pnpm peers check` 报 `unmet peer @tiptap/core: Installed 3.30.0 / Wanted 3.29.2` 一串）。那等于把「带旧锁升级的消费方偶发一次」换成「上游每发一版、所有新消费方立刻复发」，频率高一个量级，而且我们完全被动。改成保持 caret、**在新增家族成员的同一次改动里把全族一起抬高**：老成员的 specifier 一变，消费方锁里对它们的固定就失效，整族在同一次解析里一起前进，回到「同一次解析」这个前提上。已实测两个场景都归零警告（旧锁升级 / 全新解析）。

配套的门禁 `pnpm deps:family`（`scripts/check-dep-family.mjs`，挂在 CI 的秒级静态门禁那一档）判四条：全族逐字同一个 specifier、下界不许倒退、**新增成员时下界必须严格抬高**、**lockfile 里这一族只能解析出一个版本**。基线 `scripts/dep-family-baseline.json` 记的是**上一次发布时的家族形态**（成员清单 + 全族 specifier），抬版时随 changeset 一起更新；「它对 0.30.0 那份 `package.json` 判红」这件事由单测固化（`scripts/check-dep-family.test.mjs` 里以 0.29.0 形态为基线的那条），所以自证不会随基线前进而失效。全部判据只读 `package.json` / `pnpm-lock.yaml` / 基线，不装依赖、不联网，因此不占 CI 时间。

**它拦不到的那一半也写清楚了**：库仓库每次都是全新解析、家族天然同版，所以「带旧锁升级」那条裂法在库自己的 CI 里根本照不出来 —— 复现它需要一把几周前建的 lockfile 作为输入，而仓库里没有这个输入。第四条判据补的是另一类：我们自己的依赖树已经不自洽（精确钉版会让锁里同时躺着两族版本，而前三条静态判据全都看不见）。**刻意没有**用 `pnpm install --strict-peer-dependencies` 来覆盖这一层，两条实测理由记在 `ci.yml` 的注释里：锁是最新时 pnpm 整个跳过解析步骤、连 peer 都不判；而强制解析时它会因为一条与本 issue 无关的既有冲突（`apps/www → intlayer → zod-to-ts` 要 `typescript@"^5 || ^6"`，仓库已是 7.x）变成常红。

对消费方：正常升级不需要做任何事。**已经装成错配状态的旧环境**（从 0.30.0 升上来的那批）跑一次 `pnpm update "@tiptap/*"` 刷锁即可，只动 lockfile —— 不要为了消警告把 `@tiptap/*` 写进自己的 `package.json` 或 `pnpm.overrides`。定为 `minor` 而不是 `patch` 的理由：抬高下界会收窄消费方能接受的 tiptap 版本范围（有意把 tiptap 按在 3.29.x 的项目会被推着走），这不是纯粹的行为修复。
