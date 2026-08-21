import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import type { ScanEnvironment, ScanReport } from "./contracts";
import { repositoryRoot } from "./paths";
import {
  baselineFromReport,
  parsePerformanceBaseline,
  type PerformanceBaseline,
} from "./report/baseline";
import { formatTerminalSummary, writeJsonAtomic } from "./report/report";
import { executeDefaultScan } from "./runner/execute";

export interface CliOptions {
  scenarioIds: string[];
  full: boolean;
  ci: boolean;
  update: boolean;
  resume: boolean;
  environment: ScanEnvironment;
  react: "18" | "19";
  smoke: boolean;
  inventoryOnly: boolean;
  diagnoseFindings?: string;
  from?: string;
  fromBaseline?: string;
  outputDir: string;
  reportOnly: boolean;
  help: boolean;
}

export interface CliDependencies {
  execute(options: CliOptions): Promise<ScanReport>;
}

function takeValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

export function parseCliArgs(args: string[]): CliOptions {
  const scenarioIds: string[] = [];
  let full = false;
  let explicitFull = false;
  let ci = false;
  let update = false;
  let resume = false;
  let environment: ScanEnvironment = "workspace";
  let react: "18" | "19" = "19";
  let smoke = false;
  let inventoryOnly = false;
  let diagnoseFindings: string | undefined;
  let from: string | undefined;
  let fromBaseline: string | undefined;
  let outputDir = ".hulian-scan/latest";
  let explicitOutput = false;
  let reportOnly = false;
  let help = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    switch (argument) {
      case "--":
        break;
      case "--scenario": {
        const value = takeValue(args, index, argument);
        scenarioIds.push(...value.split(",").filter(Boolean));
        index += 1;
        break;
      }
      case "--full":
        full = true;
        explicitFull = true;
        break;
      case "--ci":
        ci = true;
        break;
      case "--update":
        update = true;
        break;
      case "--resume":
        resume = true;
        break;
      case "--environment": {
        const value = takeValue(args, index, argument);
        if (value !== "workspace" && value !== "packed-consumer") {
          throw new Error(`unsupported environment: ${value}`);
        }
        environment = value;
        index += 1;
        break;
      }
      case "--react": {
        const value = takeValue(args, index, argument);
        if (value !== "18" && value !== "19") {
          throw new Error(`unsupported React version: ${value}`);
        }
        react = value;
        index += 1;
        break;
      }
      case "--smoke":
        smoke = true;
        break;
      case "--inventory-only":
        inventoryOnly = true;
        break;
      case "--diagnose-findings":
        diagnoseFindings = takeValue(args, index, argument);
        index += 1;
        break;
      case "--from":
        from = takeValue(args, index, argument);
        index += 1;
        break;
      case "--from-baseline":
        fromBaseline = takeValue(args, index, argument);
        index += 1;
        break;
      case "--output":
        outputDir = takeValue(args, index, argument);
        explicitOutput = true;
        index += 1;
        break;
      case "--report-only":
        reportOnly = true;
        break;
      case "--help":
      case "-h":
        help = true;
        break;
      default:
        throw new Error(`unknown Hulian Scan option: ${String(argument)}`);
    }
  }

  if (explicitFull && scenarioIds.length > 0) {
    throw new Error("--full cannot be combined with --scenario");
  }
  if (update && !from) throw new Error("--update requires --from <summary.json>");
  if (update && react !== "19") {
    throw new Error("--update can only write the React 19 baseline");
  }
  if (smoke && react !== "18") {
    throw new Error("--smoke is reserved for the React 18 compatibility scan");
  }
  if (diagnoseFindings && !explicitOutput) {
    throw new Error("--diagnose-findings requires an explicit --output");
  }
  if (inventoryOnly && (update || diagnoseFindings)) {
    throw new Error("--inventory-only cannot mutate or diagnose findings");
  }
  if (scenarioIds.length === 0 && !smoke && !update && !inventoryOnly && !diagnoseFindings) {
    full = true;
  }

  return {
    scenarioIds: [...new Set(scenarioIds)],
    full,
    ci,
    update,
    resume,
    environment,
    react,
    smoke,
    inventoryOnly,
    ...(diagnoseFindings ? { diagnoseFindings } : {}),
    ...(from ? { from } : {}),
    ...(fromBaseline ? { fromBaseline } : {}),
    outputDir,
    reportOnly,
    help,
  };
}

function usage(): string {
  return [
    "Hulian Scan",
    "  --scenario <id> | --full",
    "  --ci --resume --environment <workspace|packed-consumer>",
    "  --react <18|19> --smoke --inventory-only",
    "  --diagnose-findings <findings.json> --output <dir>",
    "  --update --from <summary.json> | --from-baseline <baseline.json>",
    "  --report-only",
  ].join("\n");
}

function assertCompleteSummary(value: unknown): asserts value is ScanReport {
  if (
    typeof value !== "object" ||
    value === null ||
    (value as Partial<ScanReport>).schemaVersion !== 1 ||
    !Array.isArray((value as Partial<ScanReport>).runs)
  ) {
    throw new Error("--from must point to a complete Hulian Scan summary");
  }
  const report = value as ScanReport;
  if (report.runs.length === 0) {
    throw new Error("--from summary contains no scenario runs");
  }
  for (const run of report.runs) {
    if (
      run.samples.length === 0 ||
      run.samples.some((sample) => Object.values(sample).some((metric) => !Number.isFinite(metric)))
    ) {
      throw new Error(`--from summary is incomplete: ${run.scenarioId}`);
    }
  }
}

async function updateBaseline(options: CliOptions): Promise<void> {
  const sourcePath = resolve(repositoryRoot, options.from as string);
  const next: unknown = JSON.parse(await readFile(sourcePath, "utf8"));
  assertCompleteSummary(next);
  const baselinePath = resolve(repositoryRoot, "scripts/performance-baseline.json");
  const baseline = baselineFromReport(next);
  if (Object.keys(baseline.scenarios).length === 0) {
    throw new Error("baseline update produced no eligible packed-consumer scenarios");
  }
  let previous: PerformanceBaseline | undefined;
  try {
    const parsed: unknown = JSON.parse(await readFile(baselinePath, "utf8"));
    previous = parsePerformanceBaseline(parsed);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
  const componentById = new Map(
    next.runs.map((run) => [run.scenarioId, String(run.metadata.component ?? run.scenarioId)]),
  );
  for (const [scenarioId, metrics] of Object.entries(baseline.scenarios)) {
    for (const [metric, newValue] of Object.entries(metrics)) {
      const oldValue = previous?.scenarios[scenarioId]?.[metric];
      const delta = oldValue === undefined ? newValue : newValue - oldValue;
      const percentage =
        oldValue === undefined || oldValue === 0
          ? Number.POSITIVE_INFINITY
          : (delta / oldValue) * 100;
      console.log(
        `${scenarioId} (${componentById.get(scenarioId)}).${metric}: ${
          oldValue ?? "new"
        } -> ${newValue} (${delta >= 0 ? "+" : ""}${delta}, ${
          Number.isFinite(percentage) ? `${percentage.toFixed(2)}%` : "new"
        })`,
      );
    }
  }
  await writeJsonAtomic(baselinePath, baseline);
}

export async function runCli(
  args: string[],
  dependencies: Partial<CliDependencies> = {},
): Promise<number> {
  const options = parseCliArgs(args);
  if (options.help) {
    console.log(usage());
    return 0;
  }
  if (options.update) {
    await updateBaseline(options);
    return 0;
  }
  const report = await (dependencies.execute ?? executeDefaultScan)(options);
  console.log(formatTerminalSummary(report));
  // 只有 error 级 finding 才判失败。此前是「有任何 finding 就退 1」，于是 severity 字段
  // 形同虚设 —— 一条会让构建变红的 warning 不是 warning。发现类信号（avoidable-render、
  // avoidable-render-candidate）照常进报告与产物，供 weekly sweep 人工过目。
  const blocking = report.findings.filter((finding) => finding.severity === "error");
  // 量不成的场景同样判失败。它不是 finding，但「这个组件这一轮没被扫到」是必须有人
  // 处理的信号 —— 隔离机制的目的是保住其余场景的报告，不是把失败悄悄咽下去。
  return options.ci && !options.reportOnly && (blocking.length > 0 || report.failures.length > 0)
    ? 1
    : 0;
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : undefined;
if (entry === import.meta.url) {
  runCli(process.argv.slice(2)).then(
    (status) => {
      process.exitCode = status;
    },
    (error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    },
  );
}
