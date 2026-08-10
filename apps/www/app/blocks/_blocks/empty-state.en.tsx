import { Button, Empty, Result } from "@hulianui/ui";
import { Plus, RefreshCw } from "lucide-react";
export function EmptyStateBlock() {
    return (<div className="mx-auto w-full max-w-5xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        <div className="rounded-[var(--radius)] border border-border bg-surface p-6">
          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Paradigm 1 · Empty (no data yet)
          </div>
          <Empty title="No customer data yet" description="No customers have been added yet. Start by creating the first customer and manage your business opportunities and transaction records.">
            <Button size="sm">
              <Plus className="size-4"/>
              Create new customer
            </Button>
            <Button variant="outline" size="sm">
              Import data
            </Button>
          </Empty>
        </div>


        <div className="flex flex-col gap-4">

          <div className="rounded-[var(--radius)] border border-border bg-surface p-6">
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pattern 2a · Success result
            </div>
            <Result status="success" title="Submission successful" subTitle="Your quote was emailed to the customer. Expect a response within one or two business days.">
              <Button size="sm">View details</Button>
              <Button variant="outline" size="sm">
                Return to list
              </Button>
            </Result>
          </div>


          <div className="rounded-[var(--radius)] border border-border bg-surface p-6">
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pattern 2b · 404 result (no matches)
            </div>
            <Result status="404" title="No relevant results found" subTitle="Try modifying keywords or adjusting filter conditions, or clear all filters and search again.">
              <Button variant="outline" size="sm">
                <RefreshCw className="size-4"/>
                Clear filter
              </Button>
            </Result>
          </div>
        </div>
      </div>
    </div>);
}
