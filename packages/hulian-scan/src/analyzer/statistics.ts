export interface Distribution {
  count: number;
  median: number;
  p95: number;
  mad: number;
}

export function summarize(values: number[]): Distribution {
  if (
    values.length === 0 ||
    values.some((value) => !Number.isFinite(value))
  ) {
    throw new Error("expected at least one finite sample");
  }

  const sorted = [...values].sort((left, right) => left - right);
  const percentile = (proportion: number): number => {
    const index = Math.min(
      sorted.length - 1,
      Math.ceil(sorted.length * proportion) - 1,
    );
    const value = sorted[index];
    if (value === undefined) throw new Error("finite sample missing");
    return value;
  };
  const median = percentile(0.5);
  const deviations = sorted
    .map((value) => Math.abs(value - median))
    .sort((left, right) => left - right);
  const mad = deviations[Math.floor(deviations.length / 2)];
  if (mad === undefined) throw new Error("finite sample deviation missing");

  return {
    count: sorted.length,
    median,
    p95: percentile(0.95),
    mad,
  };
}

export function isTimeRegression(input: {
  baseline: number;
  current: number;
  relativePct: number;
  absoluteMs: number;
}): boolean {
  const values = [
    input.baseline,
    input.current,
    input.relativePct,
    input.absoluteMs,
  ];
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error("time regression inputs must be finite");
  }

  const delta = input.current - input.baseline;
  const relativeDeltaPct =
    input.baseline === 0
      ? input.current === 0
        ? 0
        : Number.POSITIVE_INFINITY
      : (delta / input.baseline) * 100;
  return (
    delta >= input.absoluteMs && relativeDeltaPct > input.relativePct
  );
}
