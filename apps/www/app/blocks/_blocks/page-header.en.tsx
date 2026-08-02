import { Breadcrumb, Button, Heading, Tag, Text } from "@hulianui/ui";
import { Download, Plus } from "lucide-react";
const breadcrumbs = [
    { label: "Workspace", href: "#" },
    { label: "Customer management", href: "#" },
    { label: "Customer list" },
];
export function PageHeaderBlock() {
    return (<div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div className="min-w-0 flex-1">
          <Breadcrumb items={breadcrumbs} className="mb-2"/>
          <div className="flex flex-wrap items-center gap-2">
            <Heading level={1} size="2xl" weight="bold" className="text-foreground">
              Customer list
            </Heading>
            <Tag tone="brand" variant="soft" size="sm" dot>
              In follow-up · 24
            </Tag>
          </div>
          <Text tone="muted" size="sm" className="mt-1">
            Manage customer profiles, pipeline progress, and closed deals in one place.
          </Text>
        </div>


        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="size-4"/>
            Export
          </Button>
          <Button size="sm">
            <Plus className="size-4"/>
            Create new customer
          </Button>
        </div>
      </div>
    </div>);
}
