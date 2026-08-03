declare module "prettier" {
  export function format(source: string, options: { parser: "json" | "typescript" }): string;
}
