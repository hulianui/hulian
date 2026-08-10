"use client";
import type { ReactNode } from "react";
import { LayoutGrid } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ServiceMessage } from "../../../../packages/ui/src/service-message/service-message";
const miniProgram = <LayoutGrid className="size-3.5 text-primary" aria-hidden/>;
function TimeDivider({ children }: {
    children: ReactNode;
}) {
    return <div className="py-0.5 text-center text-xs text-muted-foreground">{children}</div>;
}
export const serviceMessageShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Avatar + source + key value field + bottom entry, replica WeChat service notification card.",
            code: `<ServiceMessage
  avatar={{ fallback: "Rui", className: "bg-primary/10 text-primary" }}
  source="luckincoffee Luckin Coffee"
  onMore={() => openMore()}
  title="Product collection reminder"
  fields={[
    { label: "Meal pickup number", value: "361" },
    { label: "Item quantity", value: "1" },
    { label: "Product Details", value: "Orange C Ice Tea" },
  ]}
  action={{ icon: <MiniProgramIcon /> }}
  onAction={() => openMiniProgram()}
/>`,
            render: () => (<ServiceMessage avatar={{ fallback: "Rui", className: "bg-primary/10 text-primary" }} source="luckincoffee Luckin Coffee" onMore={() => { }} title="Product collection reminder" fields={[
                    { label: "Meal pickup number", value: "361" },
                    { label: "Product quantity", value: "1" },
                    { label: "Product details", value: "Orange C Iced Tea" },
                ]} action={{ icon: miniProgram }} onAction={() => { }}/>),
        },
        {
            title: "Custom text",
            description: "Pass children covering fields, carrying the content of non-key-value structure.",
            code: `<ServiceMessage
  avatar={{ fallback: "Shun", className: "bg-warning/15 text-warning" }}
  source="SF Express"
  title="Your package has been signed for"
  footer="View logistics details"
  action={{ label: "Details", icon: <MiniProgramIcon /> }}
  onAction={() => openTracking()}
>
  <p className="text-sm leading-relaxed text-foreground">
    Your shipment has been signed for by <span className="font-medium">I</span>. Thank you for using SF Express.
  </p>
</ServiceMessage>`,
            render: () => (<ServiceMessage avatar={{ fallback: "Shun", className: "bg-warning/15 text-warning" }} source="SF Express" onMore={() => { }} title="Your package has been signed for" footer="View logistics details" action={{ label: "Details", icon: miniProgram }} onAction={() => { }}>
          <p className="text-sm leading-relaxed text-foreground">
            Your shipment has been sent by <span className="font-medium">Me</span> Sign for receipt, thank you for using SF Express. Looking forward to serving you again.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Tracking number SF1234567890123 · Today 14:32</p>
        </ServiceMessage>),
        },
        {
            title: "No more buttons",
            description: "If onMore is not passed, the head \u22EF button will be hidden; action.label can customize the action text.",
            code: `<ServiceMessage
  avatar={{ fallback: "OA", className: "bg-success/15 text-success" }}
  source="Enterprise OA \u00B7 Approval Assistant"
  title="The reimbursement form has been passed"
  fields={[
    { label: "Document number", value: "BX-2026-000812" },
    { label: "Reimbursement amount", value: "\u00A5 1,280.00" },
    { label: "Approval result", value: "Passed" },
  ]}
  footer="Enter the Approval Center"
  action={{ label: "View", icon: <MiniProgramIcon /> }}
  onAction={() => openApproval()}
/>`,
            render: () => (<ServiceMessage avatar={{ fallback: "OA", className: "bg-success/15 text-success" }} source="Enterprise OA · Approval Assistant" title="The reimbursement form has been approved" fields={[
                    { label: "Document No.", value: "BX-2026-000812" },
                    { label: "Reimbursement amount", value: "\u00A5 1,280.00" },
                    { label: "Approval results", value: "Passed" },
                ]} footer="Enter the approval center" action={{ label: "View", icon: miniProgram }} onAction={() => { }}/>),
        },
        {
            title: "Minimalist",
            description: "Title only + bottom entry (no avatar/fields).",
            code: `<ServiceMessage
  source="System Notification"
  title="You have 1 new system message to view"
  footer="View details"
  onAction={() => openDetail()}
/>`,
            render: () => (<ServiceMessage source="System notification" title="You have 1 new system message to view" footer="View details" onAction={() => { }}/>),
        },
    ],
    controls: [
        { prop: "source", type: "text", defaultValue: "luckincoffee Luckin Coffee", label: "Source" },
        { prop: "title", type: "text", defaultValue: "Product collection reminder", label: "Title" },
        { prop: "footer", type: "text", defaultValue: "Enter the mini program to view", label: "Bottom boot" },
        { prop: "more", type: "boolean", defaultValue: true, label: "More buttons" },
    ],
    states: [
        {
            name: "Service notification (replicated WeChat template message flow)",
            render: () => (<div className="flex w-full max-w-sm flex-col gap-2 rounded-xl bg-surface-hover p-4">
          <ServiceMessage avatar={{ fallback: "Rui", className: "bg-primary/10 text-primary" }} source="luckincoffee Luckin Coffee" onMore={() => { }} title="Product collection reminder" fields={[
                    { label: "Meal pickup number", value: "361" },
                    { label: "Product quantity", value: "1" },
                    { label: "Product details", value: "Orange C Iced Tea" },
                ]} action={{ icon: miniProgram }} onAction={() => { }}/>
          <TimeDivider>09:17</TimeDivider>
          <ServiceMessage avatar={{ fallback: "Rui", className: "bg-primary/10 text-primary" }} source="luckincoffee Luckin Coffee" onMore={() => { }} title="New product announcement" fields={[
                    { label: "Product name", value: "Sea Salt Caramel Latte\uD83C\uDF0A Summer limited edition return" },
                    { label: "Reasons for recommendation", value: "Australian sea salt x Fragrant caramel, can be salty or sweet~" },
                    { label: "Activity content", value: "\uD83D\uDC31 Hello Kitty joint model" },
                ]} action={{ icon: miniProgram }} onAction={() => { }}/>
        </div>),
        },
        {
            name: "Logistics signature (customized text children)",
            render: () => (<ServiceMessage avatar={{ fallback: "Shun", className: "bg-warning/15 text-warning" }} source="SF Express" onMore={() => { }} title="Your package has been signed for" footer="View logistics details" action={{ label: "Details", icon: miniProgram }} onAction={() => { }}>
          <p className="text-sm leading-relaxed text-foreground">
            Your shipment has been sent by <span className="font-medium">Me</span> Sign for receipt, thank you for using SF Express. Looking forward to serving you again.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Tracking number SF1234567890123 · Today 14:32</p>
        </ServiceMessage>),
        },
        {
            name: "Approved (no more buttons \u00B7 Custom action text)",
            render: () => (<ServiceMessage avatar={{ fallback: "OA", className: "bg-success/15 text-success" }} source="Enterprise OA · Approval Assistant" title="The reimbursement form has been approved" fields={[
                    { label: "Document No.", value: "BX-2026-000812" },
                    { label: "Reimbursement amount", value: "\u00A5 1,280.00" },
                    { label: "Approver", value: "Manager Li" },
                    { label: "Approval results", value: "Passed" },
                ]} footer="Enter the approval center" action={{ label: "View", icon: miniProgram }} onAction={() => { }}/>),
        },
        {
            name: "Minimalist (only title + bottom entry)",
            render: () => (<ServiceMessage source="System notification" title="You have 1 new system message to view" footer="View details" onAction={() => { }}/>),
        },
    ],
    renderWithProps: (p) => (<ServiceMessage avatar={{ fallback: "Rui", className: "bg-primary/10 text-primary" }} source={String(p.source ?? "")} onMore={p.more ? () => { } : undefined} title={String(p.title ?? "")} fields={[
            { label: "Meal pickup number", value: "361" },
            { label: "Product quantity", value: "1" },
            { label: "Product details", value: "Orange C Iced Tea" },
        ]} footer={String(p.footer ?? "")} action={{ icon: miniProgram }} onAction={() => { }}/>),
    toCode: (p) => {
        const more = p.more ? "\n  onMore={() => openMore()}" : "";
        return `<ServiceMessage
  avatar={{ src: logo, fallback: "Rui" }}
  source="${String(p.source ?? "")}"${more}
  title="${String(p.title ?? "")}"
  fields={[
    { label: "Meal pickup number", value: "361" },
    { label: "Item quantity", value: "1" },
    { label: "Product Details", value: "Orange C Ice Tea" },
  ]}
  footer="${String(p.footer ?? "")}"
  action={{ icon: <MiniProgramIcon />, label: "MiniProgram" }}
  onAction={() => openMiniProgram()}
/>`;
    },
};
