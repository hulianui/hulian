import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// 组件与它的 showcase 里不许出现外链素材图。
//
// demos 早有铁律「资源全本地化，零外链」并由 demos:coverage 强制（apps/www/app/demos/README.md §铁律四），
// 但那条门禁管不到 packages/ui —— 于是同一个反模式在组件里躺了 11 处：ImageViewer / InfiniteMenu /
// FlowingMenu / Upload / DecayCard 的 showcase，以及 **DecayCard 的默认 prop**（消费方
// `<DecayCard />` 什么都不传就会打一次外网）。CircularGallery 当初单独修过，但没人扫同域。
//
// 失效方式很难在开发机上发现：断网 / 内网 / 被墙才碎图，而 CI 与本地都连得通外网。
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "packages/ui/src");

/** 已知的图床 / 占位图服务。命中即失败 —— 用 lib/demo-image.ts 的 demoImage() 程序化生成。 */
const REMOTE_ASSET_HOSTS =
  /https?:\/\/(?:[\w.-]*\.)?(picsum\.photos|unsplash\.com|pravatar\.cc|placehold\.co|placekitten\.com|dummyimage\.com|loremflickr\.com|via\.placeholder\.com)/i;

function* sourceFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* sourceFiles(path);
      continue;
    }
    if (/\.(tsx?|jsx?)$/.test(entry.name)) yield path;
  }
}

test("packages/ui 里不出现外链素材图", () => {
  const offenders = [];
  for (const file of sourceFiles(SRC)) {
    const source = readFileSync(file, "utf8");
    source.split("\n").forEach((line, index) => {
      // 注释里可以提这些域名（解释为什么不用），只禁真正写进代码的
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
      const hit = REMOTE_ASSET_HOSTS.exec(line);
      if (hit) offenders.push(`${relative(ROOT, file)}:${index + 1} → ${hit[1]}`);
    });
  }
  assert.deepEqual(
    offenders,
    [],
    `组件里不许用外链素材图（断网 / 内网 / 被墙即碎图）——改用 lib/demo-image.ts 的 demoImage()：\n  ${offenders.join("\n  ")}`,
  );
});
