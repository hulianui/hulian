declare module "prettier" {
  export function format(
    source: string,
    options: { parser: "typescript" },
  ): string;
}
