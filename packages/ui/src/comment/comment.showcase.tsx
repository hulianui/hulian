"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { User } from "../user/user";
import { Comment, CommentAction } from "./comment";

const actions = (
  <>
    <CommentAction>👍 赞 12</CommentAction>
    <CommentAction href="#reply">回复</CommentAction>
  </>
);

export const commentShowcase: ShowcaseSpec = {
  controls: [
    { prop: "type", type: "select", options: ["comment", "log"], defaultValue: "comment", label: "类型" },
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
            actions={<CommentAction href="#reply">回复</CommentAction>}
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
          <Comment type="log" author="系统" content="将工单状态改为「处理中」" datetime="昨天 14:25" />
          <Comment type="log" author="张三" content="指派给 @李四" datetime="昨天 14:26" />
          <Comment type="log" author="系统" content="将工单状态改为「已解决」" datetime="今天 09:10" />
        </div>
      ),
    },
    {
      name: "复用 User 作者卡",
      render: () => (
        <Comment
          author={<User name="瑚琏" description="@hulian" avatarProps={{ fallback: "瑚", size: "sm" }} />}
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
          <Comment author="李四" avatar={{ fallback: "李" }} datetime="1 小时前" content="这是子回复。" />
        )}
      </Comment>
    );
  },
  toCode: (props) => {
    const type = (props.type as string) ?? "comment";
    return `<Comment\n  author="瑚琏"\n  avatar={{ fallback: "瑚" }}\n  datetime="2 小时前"\n  content="这是一条评论内容"${
      type === "log" ? '\n  type="log"' : ""
    }${props.connector ? "\n  connector" : ""}\n>\n  <Comment author="李四" content="这是子回复。" />\n</Comment>`;
  },
};
