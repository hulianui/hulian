/** @jsxImportSource ../../../lib/fixture-jsx */
import Link from "next/link";
import { Result, Button } from "@hulianui/ui";

// 异常 / 结果页 —— 居中状态图标 + 标题 + 说明 + 操作槽，404 / 403 / 500 / 成功等统一范式。
// 复制后改 status 与文案即可；操作按钮通过 children 注入。
export function ResultPage() {
  return (
    <div className="grid min-h-[40rem] place-items-center bg-bg px-6 py-12">
      <Result
        status="404"
        title="页面走丢了"
        subTitle="你访问的页面不存在，可能已被移动或删除。"
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button render={<Link href="#" />}>返回首页</Button>
          <Button variant="outline" render={<Link href="#" />}>
            联系支持
          </Button>
        </div>
      </Result>
    </div>
  );
}
