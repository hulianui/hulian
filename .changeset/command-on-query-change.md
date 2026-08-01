---
"@hulianui/ui": minor
---

Command 新增 `onQueryChange` —— 让消费方能自己排序、分组、写空态

搜索词此前是 `Command` 的纯内部状态，外部读不到。于是任何「按相关度重排、按类型分组、把命中数写进空态、给一条带 `?q=` 的『查看全部结果』链接」的需求都做不了，只能退回默认的子串过滤 + 静态 `groups`。

现在 `onQueryChange` 会在搜索词变化时（含**每次打开面板的清空**）播出当前值，配合 `filter={() => true}` 即可把过滤权完全交给消费方：

```tsx
const [query, setQuery] = useState("");
const groups = useMemo(() => buildGroups(mySearch(query)), [query]);

<Command open={open} onOpenChange={setOpen} groups={groups} filter={() => true} onQueryChange={setQuery} />
```

向后兼容：不传该 prop 时行为与之前完全一致（默认子串过滤照常）。回调走内部 ref，不会因消费方每次渲染新建箭头函数而触发额外副作用。

这是文档站全站搜索（closes #40 的搜索部分）dogfood 时撞出来的库缺口。
