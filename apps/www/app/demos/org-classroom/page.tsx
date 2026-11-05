import { ClassroomDemo } from "./_components/classroom-demo";
import { copy } from "./page.content";

export default function OrgClassroomDemoPage() {
  return (
    <main className="min-h-dvh bg-bg px-6 pt-16 pb-28 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="max-w-2xl">
          <h1 className="text-2xl font-medium">{copy("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{copy("hint")}</p>
        </header>
        <ClassroomDemo />
      </div>
    </main>
  );
}
