"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button";
import { Result } from "../../../../packages/ui/src/result/result";
import type { ResultStatus } from "../../../../packages/ui/src/result/result.types";
const STATUSES: ResultStatus[] = ["success", "error", "info", "warning", "403", "404", "500"];
export const resultShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Successful result",
            description: "Successful feedback after the operation is completed, the content slot carries supplementary information, and the children slot holds subsequent operations.",
            code: `<Result status="success" title="Payment successful" subTitle="Order #2024-0612 has been completed and is expected to ship within 3 days.">
  <Button size="sm">View order</Button>
  <Button size="sm" variant="outline">Return to homepage</Button>
</Result>`,
            render: () => (<Result status="success" title="Payment successful" subTitle="Order #2024-0612 has been completed and is expected to ship within 3 days.">
          <Button size="sm">View order</Button>
          <Button size="sm" variant="outline">
            Return to home page
          </Button>
        </Result>),
        },
        {
            title: "Failure result (with details)",
            description: "The content area is rendered below the subtitle and above the operation area, which is suitable for stacking error details.",
            code: `<Result
  status="error"
  title="Submission failed"
  subTitle="Please check and modify the following information and try again."
  content="The account name contains illegal characters; the mobile phone number format is incorrect."
>
  <Button size="sm">Return for modification</Button>
</Result>`,
            render: () => (<Result status="error" title="Submission failed" subTitle="Please check and modify the following information and try again." content="The account name contains illegal characters; the mobile phone number format is incorrect.">
          <Button size="sm">Return to modification</Button>
        </Result>),
        },
        {
            title: "Information and Warnings",
            description: "info / warning Two semantic states, with respective built-in icons and semantic colors.",
            code: `<>
  <Result status="info" title="Under review" subTitle="The information has been submitted and is expected to be reviewed within 1 working day." />
  <Result status="warning" title="Expiring soon" subTitle="Your membership will expire in 3 days, please renew in time." />
</>`,
            render: () => (<>
          <Result status="info" title="Under review" subTitle="The information has been submitted and is expected to be reviewed within 1 working day."/>
          <Result status="warning" title="Expiring soon" subTitle="Your membership will expire in 3 days, please renew in time."/>
        </>),
        },
        {
            title: "HTTP error page",
            description: "403 / 404 / 500 Full page placeholder for exception routing, built-in lock/search/server icon.",
            code: `<Result status="404" title="404" subTitle="Sorry, the page you visited does not exist.">
  <Button size="sm" variant="outline">Return to homepage</Button>
</Result>`,
            render: () => (<Result status="404" title="404" subTitle="Sorry, the page you visited does not exist.">
          <Button size="sm" variant="outline">
            Return to home page
          </Button>
        </Result>),
        },
        {
            title: "Hide icon",
            description: "icon passes null without rendering the icon area, only retaining the title and description.",
            code: `<Result icon={null} status="info" title="No icon results" subTitle="Only display text, do not render top status icon." />`,
            render: () => (<Result icon={null} status="info" title="No icon results" subTitle="Display text only and do not render the top status icon."/>),
        },
    ],
    controls: [
        { prop: "status", type: "select", options: STATUSES, defaultValue: "success" },
        { prop: "title", type: "text", defaultValue: "Action completed" },
        { prop: "subTitle", type: "text", defaultValue: "Your submission has been saved and you can continue with subsequent operations." },
    ],
    states: [
        {
            name: "Success",
            render: () => (<Result status="success" title="Payment successful" subTitle="Order #2024-0612 has been completed and is expected to ship within 3 days.">
          <Button size="sm">View order</Button>
          <Button size="sm" variant="outline">
            Return to home page
          </Button>
        </Result>),
        },
        {
            name: "failed",
            render: () => (<Result status="error" title="Submission failed" subTitle="Please check and modify the following information and try again." content="The account name contains illegal characters; the mobile phone number format is incorrect.">
          <Button size="sm">Return to modification</Button>
        </Result>),
        },
        {
            name: "403",
            render: () => (<Result status="403" title="403" subTitle="Sorry, you do not have permission to access this page.">
          <Button size="sm" variant="outline">
            Return to home page
          </Button>
        </Result>),
        },
        {
            name: "404",
            render: () => (<Result status="404" title="404" subTitle="Sorry, the page you visited does not exist.">
          <Button size="sm" variant="outline">
            Return to home page
          </Button>
        </Result>),
        },
        {
            name: "500",
            render: () => (<Result status="500" title="500" subTitle="Sorry, there was a server error, please try again later.">
          <Button size="sm">Try again</Button>
        </Result>),
        },
    ],
    renderWithProps: (p) => (<Result status={(p.status as ResultStatus) ?? "success"} title={(p.title as string) || undefined} subTitle={(p.subTitle as string) || undefined}/>),
    toCode: (p) => `<Result
  status="${(p.status as string) ?? "success"}"
  title="${(p.title as string) ?? ""}"
  subTitle="${(p.subTitle as string) ?? ""}"
>
  <Button size="sm">Return to homepage</Button>
</Result>`,
};
