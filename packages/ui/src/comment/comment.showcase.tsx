"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { User } from "../user/user";
import { Comment, CommentAction } from "./comment";

const actions = (
  <>
    <CommentAction>👍 赞 12</CommentAction>
    <CommentAction href="#">回复</CommentAction>
  </>
);

export const commentShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "头像 + 作者 + 时间 + 正文，字符串正文自动高亮 @提及。",
      code: `<Comment
  author="瑚琏"
  avatar={{ fallback: "瑚" }}
  datetime="2 小时前"
  content="工单已分配，请 @李四 跟进处理。"
/>`,
      render: () => (
        <Comment
          author="瑚琏"
          avatar={{ fallback: "瑚" }}
          datetime="2 小时前"
          content="工单已分配，请 @李四 跟进处理。"
        />
      ),
    },
    {
      title: "操作区",
      description: "actions 槽放 CommentAction，传 href 渲染为链接型操作。",
      code: `<Comment
  author="瑚琏"
  avatar={{ fallback: "瑚" }}
  datetime="2 小时前"
  content="这条评论带点赞与回复操作。"
  actions={
    <>
      <CommentAction>👍 赞 12</CommentAction>
      <CommentAction href="#">回复</CommentAction>
    </>
  }
/>`,
      render: () => (
        <Comment
          author="瑚琏"
          avatar={{ fallback: "瑚" }}
          datetime="2 小时前"
          content="这条评论带点赞与回复操作。"
          actions={actions}
        />
      ),
    },
    {
      title: "嵌套回复 + 连接线",
      description: "children 递归 Comment 自动缩进，connector 画左侧连接线。",
      code: `<Comment
  author="瑚琏"
  avatar={{ fallback: "瑚" }}
  datetime="2 小时前"
  content="问题已复现。"
  connector
>
  <Comment
    author="李四"
    avatar={{ fallback: "李" }}
    datetime="1 小时前"
    content="收到，正在排查根因。"
  />
</Comment>`,
      render: () => (
        <Comment
          author="瑚琏"
          avatar={{ fallback: "瑚" }}
          datetime="2 小时前"
          content="问题已复现。"
          connector
        >
          <Comment
            author="李四"
            avatar={{ fallback: "李" }}
            datetime="1 小时前"
            content="收到，正在排查根因。"
          />
        </Comment>
      ),
    },
    {
      title: "系统日志",
      description: 'type="log" 弱化为点标记 + 单行内联（工单状态变更等）。',
      code: `<>
  <Comment type="log" author="系统" content="将工单状态改为「处理中」" datetime="14:25" />
  <Comment type="log" author="张三" content="指派给 @李四" datetime="14:26" />
</>`,
      render: () => (
        <div className="space-y-2">
          <Comment type="log" author="系统" content="将工单状态改为「处理中」" datetime="14:25" />
          <Comment type="log" author="张三" content="指派给 @李四" datetime="14:26" />
        </div>
      ),
    },
    {
      title: "复用 User 作者卡",
      description: "author 可直接传入瑚琏 User 组合件。",
      code: `<Comment
  author={<User name="瑚琏" description="@hulian" avatarProps={{ fallback: "瑚", size: "sm" }} />}
  datetime="刚刚"
  content="作者区可直接传入瑚琏 User 组合件。"
/>`,
      render: () => (
        <Comment
          author={
            <User name="瑚琏" description="@hulian" avatarProps={{ fallback: "瑚", size: "sm" }} />
          }
          datetime="刚刚"
          content="作者区可直接传入瑚琏 User 组合件。"
        />
      ),
    },
  ],
  controls: [
    {
      prop: "type",
      type: "select",
      options: ["comment", "log"],
      defaultValue: "comment",
      label: "类型",
    },
    { prop: "connector", type: "boolean", defaultValue: true, label: "连接线" },
  ],
  states: [
    {
      name: "嵌套线程",
      render: () => (
        <Comment
          author="瑚琏"
          datetime="2 小时前"
          avatar={{ fallback: "瑚" }}
          content="工单已分配，请 @李四 @王五 跟进处理。"
          actions={actions}
          connector
        >
          <Comment
            author="李四"
            datetime="1 小时前"
            avatar={{ fallback: "李" }}
            content="收到 @瑚琏，正在排查根因，预计今天内给结论。"
            actions={<CommentAction href="#">回复</CommentAction>}
          />
          <Comment
            author="王五"
            datetime="40 分钟前"
            avatar={{ fallback: "王" }}
            content="补充：相关日志已附在附件，可一并参考。"
          />
        </Comment>
      ),
    },
    {
      name: "工单日志混排",
      render: () => (
        <div className="space-y-4">
          <Comment
            author="张三"
            avatar={{ fallback: "张" }}
            datetime="昨天 14:20"
            content="客户反馈登录后白屏，已复现。"
            actions={<CommentAction>👍 赞</CommentAction>}
          />
          <Comment
            type="log"
            author="系统"
            content="将工单状态改为「处理中」"
            datetime="昨天 14:25"
          />
          <Comment type="log" author="张三" content="指派给 @李四" datetime="昨天 14:26" />
          <Comment
            type="log"
            author="系统"
            content="将工单状态改为「已解决」"
            datetime="今天 09:10"
          />
        </div>
      ),
    },
    {
      name: "复用 User 作者卡",
      render: () => (
        <Comment
          author={
            <User name="瑚琏" description="@hulian" avatarProps={{ fallback: "瑚", size: "sm" }} />
          }
          datetime="刚刚"
          content="作者区可直接传入瑚琏 User 组合件（头像 + 名称/描述）。"
        />
      ),
    },
  ],
  renderWithProps: (props) => {
    const type = (props.type as "comment" | "log") ?? "comment";
    const connector = Boolean(props.connector);
    return (
      <Comment
        type={type}
        author="瑚琏"
        avatar={{ fallback: "瑚" }}
        datetime="2 小时前"
        content="这是一条评论内容，可嵌套子回复。"
        actions={type === "comment" ? actions : undefined}
        connector={connector}
      >
        {type === "comment" && (
          <Comment
            author="李四"
            avatar={{ fallback: "李" }}
            datetime="1 小时前"
            content="这是子回复。"
          />
        )}
      </Comment>
    );
  },
  toCode: (props) => {
    const type = (props.type as string) ?? "comment";
    return `<Comment\n  author="瑚琏"\n  avatar={{ fallback: "瑚" }}\n  datetime="2 小时前"\n  content="这是一条评论内容"${
      type === "log" ? '\n  type="log"' : ""
    }${
      props.connector ? "\n  connector" : ""
    }\n>\n  <Comment author="李四" content="这是子回复。" />\n</Comment>`;
  },
};
