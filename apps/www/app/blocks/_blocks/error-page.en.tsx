import { Button, DotPattern, Result } from "@hulianui/ui";
import { ArrowLeft, LifeBuoy } from "lucide-react";
export function ErrorPageBlock() {
    return (<div className="relative overflow-hidden rounded-[var(--radius)] border border-border bg-surface">

      <DotPattern className="pointer-events-none absolute inset-0 size-full text-border [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]" aria-hidden/>

      <div className="relative flex flex-col items-center px-6 py-20 sm:py-28">

        <div className="select-none text-[7rem] font-black leading-none tracking-tight sm:text-[10rem]" style={{
            backgroundImage: "linear-gradient(135deg, var(--color-primary), var(--color-chart-2))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
        }} aria-hidden>
          404
        </div>

        <Result status="404" icon={null} title="Page not found" subTitle="This page doesn't exist or has moved. Check the URL or return home to keep exploring HanCloud.">
          <Button>
            <ArrowLeft className="size-4"/>
            Return to home page
          </Button>
          <Button variant="outline">
            <LifeBuoy className="size-4"/>
            Contact support
          </Button>
        </Result>
      </div>
    </div>);
}
