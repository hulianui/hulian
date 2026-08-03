"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { User } from "../../../../packages/ui/src/user/user";
import { Comment, CommentAction } from "../../../../packages/ui/src/comment/comment";
const actions = (<>
    <CommentAction>👍 Like 12</CommentAction>
    <CommentAction href="https://example.com/#reply">Reply</CommentAction>
  </>);
export const commentShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Avatar + Author + Time + Text, the string text will automatically highlight @mention.",
            code: `<Comment
  author="Hulian"
  avatar={{ fallback: "hu" }}
  datetime="2 hours ago"
  content="The work order has been assigned, please @Li Si follow up."
/>`,
            render: () => (<Comment author="Hulian" avatar={{ fallback: "Hu" }} datetime="2 hours ago" content="The work order has been assigned, please @Li Si follow up."/>),
        },
        {
            title: "Operation area",
            description: "actions slot CommentAction, pass href to render as a link operation.",
            code: `<Comment
  author="Hulian"
  avatar={{ fallback: "hu" }}
  datetime="2 hours ago"
  content="This comment has like and reply operations."
  actions={
    <>
      <CommentAction>\uD83D\uDC4D Like 12</CommentAction>
      <CommentAction href="https://example.com/#reply">Reply</CommentAction>
    </>
  }
/>`,
            render: () => (<Comment author="Hulian" avatar={{ fallback: "Hu" }} datetime="2 hours ago" content="This comment has like and reply operations." actions={actions}/>),
        },
        {
            title: "Nested reply + connecting line",
            description: "children recursively Comment automatically indents, connector draws the left connecting line.",
            code: `<Comment
  author="Hulian"
  avatar={{ fallback: "hu" }}
  datetime="2 hours ago"
  content="The problem has been reproduced."
  connector
>
  <Comment
    author="Li Si"
    avatar={{ fallback: "Li" }}
    datetime="1 hour ago"
    content="Received, root cause is being investigated."
  />
</Comment>`,
            render: () => (<Comment author="Hulian" avatar={{ fallback: "Hu" }} datetime="2 hours ago" content="The problem has been reproduced." connector>
          <Comment author="Li Si" avatar={{ fallback: "Li" }} datetime="1 hour ago" content="Received and investigating the root cause."/>
        </Comment>),
        },
        {
            title: "System log",
            description: "type=\"log\" is weakened to dot mark + single line inline (work order status change, etc.).",
            code: `<>
  <Comment type="log" author="System" content="Set the ticket status to Processing" datetime="14:25" />
  <Comment type="log" author="Zhang San" content="Assigned to @Li Si" datetime="14:26" />
</>`,
            render: () => (<div className="space-y-2">
          <Comment type="log" author="System" content="Change the status of the work order to &quot;Processing&quot;" datetime="14:25"/>
          <Comment type="log" author="Zhang San" content="assigned to @Li Si" datetime="14:26"/>
        </div>),
        },
        {
            title: "Reuse User author card",
            description: "author can be passed directly into the Hulian User assembly.",
            code: `<Comment
  author={<User name="Hulian" description="@hulian" avatarProps={{ fallback: "Hu", size: "sm" }} />}
  datetime="Just now"
  content="The author area can directly import the Hulian User assembly."
/>`,
            render: () => (<Comment author={<User name="Hulian" description="@hulian" avatarProps={{ fallback: "Hu", size: "sm" }}/>} datetime="Just now" content="The author area can directly import the Hulian User assembly."/>),
        },
    ],
    controls: [
        {
            prop: "type",
            type: "select",
            options: ["comment", "log"],
            defaultValue: "comment",
            label: "Type",
        },
        { prop: "connector", type: "boolean", defaultValue: true, label: "Connecting cable" },
    ],
    states: [
        {
            name: "Nested threads",
            render: () => (<Comment author="Hulian" datetime="2 hours ago" avatar={{ fallback: "Hu" }} content="The work order has been assigned, please @Li Si @Wang Wu to follow up." actions={actions} connector>
          <Comment author="Li Si" datetime="1 hour ago" avatar={{ fallback: "Li" }} content="Received @Hulian, we are investigating the root cause, and we expect to give a conclusion today." actions={<CommentAction href="https://example.com/#reply">Reply</CommentAction>}/>
          <Comment author="Wang Wu" datetime="40 minutes ago" avatar={{ fallback: "Wang" }} content="Supplement: The relevant logs are attached and can be referenced together."/>
        </Comment>),
        },
        {
            name: "Mixed work order logs",
            render: () => (<div className="space-y-4">
          <Comment author="Zhang San" avatar={{ fallback: "Zhang" }} datetime="Yesterday 14:20" content="Customers reported a white screen after logging in, which has recurred." actions={<CommentAction>👍 Like</CommentAction>}/>
          <Comment type="log" author="System" content="Change the status of the work order to &quot;Processing&quot;" datetime="Yesterday 14:25"/>
          <Comment type="log" author="Zhang San" content="assigned to @Li Si" datetime="Yesterday 14:26"/>
          <Comment type="log" author="System" content="Change the status of the ticket to &quot;Resolved&quot;" datetime="Today 09:10"/>
        </div>),
        },
        {
            name: "Reuse User author card",
            render: () => (<Comment author={<User name="Hulian" description="@hulian" avatarProps={{ fallback: "Hu", size: "sm" }}/>} datetime="Just now" content="The author area can directly pass in the Hulian User assembly (avatar + name/description)."/>),
        },
    ],
    renderWithProps: (props) => {
        const type = (props.type as "comment" | "log") ?? "comment";
        const connector = Boolean(props.connector);
        return (<Comment type={type} author="Hulian" avatar={{ fallback: "Hu" }} datetime="2 hours ago" content="This is a comment and can be nested into sub-replies." actions={type === "comment" ? actions : undefined} connector={connector}>
        {type === "comment" && (<Comment author="Li Si" avatar={{ fallback: "Li" }} datetime="1 hour ago" content="This is a sub-reply."/>)}
      </Comment>);
    },
    toCode: (props) => {
        const type = (props.type as string) ?? "comment";
        return `<Comment
  author="Hulian"
  avatar={{ fallback: "hu" }}
  datetime="2 hours ago"
  content="This is a comment"${type === "log" ? "\n  type=\"log\"" : ""}${props.connector ? "\n  connector" : ""}
>
  <Comment author="Li Si" content="This is a sub-reply." />
</Comment>`;
    },
};
