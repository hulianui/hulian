"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { CodeReviewThread } from "../../../../packages/ui/src/code-review-thread/code-review-thread";
import type { ReviewComment } from "../../../../packages/ui/src/code-review-thread/code-review-thread.types";
const aiCritical: ReviewComment[] = [
    {
        id: "c1",
        author: { name: "AI Examiner", kind: "ai" },
        severity: "critical",
        body: "There is no defense against the situation where user may be null, and direct dereferencing will crash in the logout state.",
        time: "Just now",
        suggestion: { oldText: "const name = user.profile.name;", newText: "const name = user?.profile?.name ?? \"\";" },
    },
];
const conversation: ReviewComment[] = [
    {
        id: "c1",
        author: { name: "AI Examiner", kind: "ai" },
        severity: "major",
        body: "This loop is in O(n\u00B2), and it will get stuck when the list is large.",
        time: "2 minutes ago",
    },
    { id: "c2", author: { name: "Lin Kaifa", kind: "human" }, body: "The upper limit of data volume is 50, so let's do this for now.", time: "1 minute ago" },
    { id: "c3", author: { name: "AI Examiner", kind: "ai" }, severity: "minor", body: "Then add a note stating the upper limit assumption.", time: "Just now" },
];
export const codeReviewThreadShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "AI Serious comments + suggestions",
            description: "comment with severity rendering left color bar; suggestion with embedded suggestion diff + adopt button.",
            code: `<CodeReviewThread comments={comments} />`,
            render: () => <CodeReviewThread comments={aiCritical}/>,
        },
        {
            title: "Multiple rounds of dialogue",
            description: "comments sequentially rendered as AI Comment threads alternating with humans.",
            code: `<CodeReviewThread comments={comments} />`,
            render: () => <CodeReviewThread comments={conversation}/>,
        },
        {
            title: "Resolved",
            description: "Pass status=\"resolved\" for controlled display of the resolved tag (if not passed, it will be managed internally).",
            code: `<CodeReviewThread comments={comments} status="resolved" />`,
            render: () => <CodeReviewThread comments={aiCritical} status="resolved"/>,
        },
        {
            title: "Folded by default",
            description: "defaultCollapsed Let the thread initially collapse, showing only the title summary, click to expand.",
            code: `<CodeReviewThread comments={comments} defaultCollapsed />`,
            render: () => <CodeReviewThread comments={conversation} defaultCollapsed/>,
        },
        {
            title: "Disable reply",
            description: "replyable={false} Hide the bottom reply box for read-only display.",
            code: `<CodeReviewThread comments={comments} replyable={false} />`,
            render: () => <CodeReviewThread comments={aiCritical} replyable={false}/>,
        },
    ],
    controls: [
        { prop: "replyable", type: "boolean", defaultValue: true, label: "Can reply" },
        { prop: "defaultCollapsed", type: "boolean", defaultValue: false, label: "Folded by default" },
    ],
    states: [
        { name: "AI Serious comments + suggestions", render: () => <CodeReviewThread comments={aiCritical}/> },
        { name: "Multiple rounds of dialogue", render: () => <CodeReviewThread comments={conversation}/> },
        { name: "Resolved", render: () => <CodeReviewThread comments={aiCritical} status="resolved"/> },
        { name: "Folded state", render: () => <CodeReviewThread comments={conversation} defaultCollapsed/> },
    ],
    renderWithProps: (p) => (<CodeReviewThread comments={aiCritical} replyable={p.replyable as boolean} defaultCollapsed={p.defaultCollapsed as boolean}/>),
    toCode: (p) => `<CodeReviewThread comments={comments}${p.replyable ? "" : " replyable={false}"}${p.defaultCollapsed ? " defaultCollapsed" : ""} />`,
};
