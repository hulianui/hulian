// JSON-LD 结构化数据的统一出口。
//
// 存在的理由只有一个：`JSON.stringify` 不转义 `<`，一旦数据里出现 `</script>`（组件描述、
// 面包屑名称都来自 manifest，将来完全可能出现）就会**提前闭合 script 标签**，后面的 JSON
// 溢出成页面正文，是注入面也是渲染事故。转成 `<` 在 JSON 语义上完全等价，
// 搜索引擎照常解析。散落各页手写 `dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }}`
// 就迟早漏掉这一步，所以收成一个组件。

/** 把 JSON-LD 安全地序列化进 HTML：`<` 一律转 `<`，杜绝 `</script>` 提前闭合。 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
