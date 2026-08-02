"use client";
// 中后台数据列表（零依赖自研）。复合 List / ListItem / ListItem.Meta。
// - 数据驱动（items + renderItem）或组合（children 放 <ListItem>）二选一。
// - size/bordered/split 控行外观；grid 切栅格卡片态（复用 Grid 原语）。
// - 空态复用 Empty；分页槽放 Pagination；loadMore 底部按钮复用 Button(loading)。
// - 含交互回调(loadMore onClick) + Context 下发 → 必 "use client"。
import { Children, createContext, Fragment, useContext, type ReactNode } from "react";
import { Button } from "../button";
import { useComponentLocale, zhCN } from "../config/locale";
import { Empty } from "../empty";
import { Grid } from "../grid";
import { cn } from "../lib/cn";
import type { ListItemMetaProps, ListItemProps, ListProps, ListSize } from "./list.types";

const PAD_X: Record<ListSize, string> = { sm: "px-3", md: "px-4", lg: "px-5" };
const PAD_Y: Record<ListSize, string> = { sm: "py-2", md: "py-3", lg: "py-4" };
const GAP: Record<ListSize, string> = { sm: "gap-2", md: "gap-3", lg: "gap-4" };
const TXT: Record<ListSize, string> = { sm: "text-sm", md: "text-sm", lg: "text-base" };

interface ListCtx {
  size: ListSize;
  grid: boolean;
  /** 已解析的行水平内边距开关（inset ?? bordered）。 */
  inset: boolean;
}
const ListContext = createContext<ListCtx>({ size: "md", grid: false, inset: false });

const DEFAULT_GRID = { cols: 3, gap: 4 };

export function List<T,>({
  items,
  renderItem,
  children,
  size = "md",
  bordered = false,
  inset,
  split = true,
  grid,
  header,
  footer,
  empty,
  loadMore,
  pagination,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: ListProps<T>) {
  const copy = useComponentLocale().list ?? zhCN.components!.list!;
  // 这三个属性单独拎出来喂给 role="list" 的节点，其余原生属性照旧落外层容器。
  const ariaProps = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
  };
  const isGrid = Boolean(grid);
  const gridCfg = grid && typeof grid === "object" ? grid : {};
  const framed = bordered && !isGrid;
  // 行/插槽水平内边距与 bordered 解耦：显式 inset 优先，否则回退 bordered。
  const resolvedInset = inset ?? bordered;

  const hasItems = items != null;
  const itemNodes: ReactNode = hasItems
    ? items.map((it, i) => (
        <Fragment key={i}>{renderItem ? renderItem(it, i) : <ListItem>{it as ReactNode}</ListItem>}</Fragment>
      ))
    : children;
  const isEmpty = hasItems ? items.length === 0 : Children.count(children) === 0;

  let body: ReactNode;
  if (isEmpty) {
    body = (
      <div className={cn(!isGrid && resolvedInset && PAD_X[size])}>
        {empty ?? <Empty title={copy.empty} size={size === "sm" ? "sm" : "md"} />}
      </div>
    );
  } else if (isGrid) {
    body = (
      <Grid
        as="ul"
        role="list"
        cols={gridCfg.cols ?? DEFAULT_GRID.cols}
        gap={gridCfg.gap ?? DEFAULT_GRID.gap}
        colGap={gridCfg.colGap}
        rowGap={gridCfg.rowGap}
        rows={gridCfg.rows}
        className="m-0 list-none p-0"
        {...ariaProps}
      >
        {itemNodes}
      </Grid>
    );
  } else {
    body = (
      <ul
        role="list"
        // 无障碍名必须落在 role="list" 的节点上（hulianui/hulian#60）：
        // 早先 aria-* 随 {...props} 落到最外层 div，读屏用户听到的是一个**无名列表**，
        // getByRole("list", { name }) 也永远找不到。其余原生属性仍留在外层容器。
        {...ariaProps}
        className={cn("m-0 list-none p-0", split && "divide-y divide-border")}>
        {itemNodes}
      </ul>
    );
  }

  const slotPadX = !isGrid && resolvedInset ? PAD_X[size] : "px-0";

  return (
    <ListContext.Provider value={{ size, grid: isGrid, inset: resolvedInset }}>
      <>
        <div
          className={cn(
            "text-foreground",
            framed && "overflow-hidden rounded-[var(--radius)] border border-border bg-surface",
            className,
          )}
          {...props}
        >
          {header != null && (
            <div className={cn("font-medium", slotPadX, PAD_Y[size], framed && "border-b border-border")}>{header}</div>
          )}
          {body}
          {loadMore && loadMore.hasMore !== false && (
            <div
              className={cn(
                "flex justify-center",
                isGrid ? "mt-4" : "py-3",
                framed && "border-t border-border",
              )}
            >
              <Button variant="outline" size="sm" loading={loadMore.loading} onClick={loadMore.onLoadMore}>
                {loadMore.text ?? copy.loadMore}
              </Button>
            </div>
          )}
          {footer != null && (
            <div className={cn("text-sm text-muted", slotPadX, PAD_Y[size], framed && "border-t border-border")}>
              {footer}
            </div>
          )}
        </div>
        {pagination != null && <div className="mt-4 flex justify-end">{pagination}</div>}
      </>
    </ListContext.Provider>
  );
}

function ListItemBase({ actions, children, className, ...props }: ListItemProps) {
  const { size, grid, inset } = useContext(ListContext);
  const framePadX = grid || inset ? PAD_X[size] : "px-0";
  return (
    <li
      className={cn(
        "flex",
        grid ? "flex-col items-stretch" : "items-center justify-between",
        GAP[size],
        PAD_Y[size],
        TXT[size],
        framePadX,
        grid && "rounded-[var(--radius)] border border-border bg-surface",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {actions && actions.length > 0 && (
        <div className={cn("flex items-center gap-3 text-sm text-muted", grid ? "mt-3" : "shrink-0")}>
          {actions.map((a, i) => (
            <Fragment key={i}>
              {i > 0 && <span aria-hidden className="h-3 w-px bg-border" />}
              <span>{a}</span>
            </Fragment>
          ))}
        </div>
      )}
    </li>
  );
}
ListItemBase.displayName = "ListItem";

export function ListItemMeta({ avatar, title, description, className, ...props }: ListItemMetaProps) {
  return (
    <div className={cn("flex items-start gap-3", className)} {...props}>
      {avatar != null && <div className="shrink-0">{avatar}</div>}
      {(title != null || description != null) && (
        <div className="flex min-w-0 flex-col leading-tight">
          {title != null && <div className="truncate font-medium text-foreground">{title}</div>}
          {description != null && <div className="text-sm text-muted">{description}</div>}
        </div>
      )}
    </div>
  );
}
ListItemMeta.displayName = "ListItem.Meta";

/** 列表行；通过 ListItem.Meta 放头像/标题/描述。 */
export const ListItem = Object.assign(ListItemBase, { Meta: ListItemMeta });
