import assert from "node:assert/strict";
import test from "node:test";
import { isFirstShard, parseShard, pickShard, shardLabel } from "./ci-shard.mjs";

const items = Array.from({ length: 11 }, (_, i) => `r${i}`);

test("不设 CI_SHARD 返回全集", () => {
  assert.deepEqual(pickShard(items, undefined), items);
  assert.deepEqual(pickShard(items, ""), items);
  assert.equal(isFirstShard(undefined), true);
  assert.equal(shardLabel(undefined), "");
});

test("各片拼起来恰好是原清单，不重不漏，大小相差不超过 1", () => {
  for (const total of [2, 3, 4]) {
    const shards = Array.from({ length: total }, (_, i) => pickShard(items, `${i + 1}/${total}`));
    assert.deepEqual(shards.flat().sort(), [...items].sort());
    const sizes = shards.map((shard) => shard.length);
    assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `sizes ${sizes}`);
  }
});

test("只有第 1 片承担一次性检查", () => {
  assert.equal(isFirstShard("1/2"), true);
  assert.equal(isFirstShard("2/2"), false);
  assert.equal(shardLabel("2/2"), " [shard 2/2]");
});

test("格式错误与越界当场报错，而不是静默跑全量或跑空", () => {
  for (const bad of ["2", "0/2", "3/2", "a/b", "1/0"]) {
    assert.throws(() => parseShard(bad), /CI_SHARD/, bad);
  }
});
