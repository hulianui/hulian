import Link from "next/link";
import { Result, Button } from "@hulianui/ui";
export function ResultPage() {
    return (<div className="grid min-h-[40rem] place-items-center bg-bg px-6 py-12">
      <Result status="404" title="Page not found" subTitle="This page doesn't exist. It may have moved or been deleted.">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button render={<Link href="#"/>}>Return home</Button>
          <Button variant="outline" render={<Link href="#"/>}>
            Contact support
          </Button>
        </div>
      </Result>
    </div>);
}
