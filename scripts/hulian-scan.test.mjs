import assert from "node:assert/strict";
import test from "node:test";

import { runForwarder } from "./hulian-scan.mjs";

test("forwards every argument to the private package CLI", () => {
  let invocation;
  const status = runForwarder(["--scenario", "button/basic", "--ci"], (command, args, options) => {
    invocation = { command, args, options };
    return { status: 7 };
  });

  assert.equal(status, 7);
  assert.deepEqual(invocation, {
    command: "pnpm",
    args: [
      "--filter",
      "@hulianui/hulian-scan",
      "run",
      "scan:internal",
      "--",
      "--scenario",
      "button/basic",
      "--ci",
    ],
    options: { stdio: "inherit" },
  });
});

test("routes packed-consumer scans through the external tarball harness", () => {
  let invocation;
  const status = runForwarder(
    ["--ci", "--environment", "packed-consumer", "--scenario", "button/basic"],
    (command, args, options) => {
      invocation = { command, args, options };
      return { status: 0 };
    },
    {},
  );

  assert.equal(status, 0);
  assert.deepEqual(invocation, {
    command: "bash",
    args: [
      "scripts/performance-consumer.sh",
      "--ci",
      "--environment",
      "packed-consumer",
      "--scenario",
      "button/basic",
    ],
    options: { stdio: "inherit" },
  });
});
