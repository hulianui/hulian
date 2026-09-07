---
"@hulianui/ui": patch
---

fix(table): 骨架行标上 `data-loading-row` 并整行 `aria-hidden`，不再与数据行混为一谈。0.64.0 的首屏骨架（#349）在 DOM 里与数据行毫无区别，而消费方的 E2E 普遍拿「`tbody tr` 到了 N 行」当「数据到了」的判活探针，骨架行数又常常正好等于 `pageSize`——探针会在数据到达之前就被满足。库自己的 demo 门禁当场踩中：CRM 客户页的 mock 数据第一次必失败，`pageSize` 恰为 8，8 行骨架让「等 8 行」立刻通过，于是错过了随后才出现的重试按钮，整条链路等在一份空数据上。判活探针现在写 `tbody tr:not([data-loading-row])` 即可。整行 `aria-hidden` 一并解决无障碍那侧（几十行空占位没有信息量），「正在加载」的播报改挂在外壳，不再住在会被藏掉的骨架行里。
