---
"@hulianui/ui": patch
---

fix(snippet): 宽度不再超出父容器。不带空格的长串（URL、token）装不下时在任意位置折行（`overflow-wrap: anywhere`），带空格的命令仍按词换行；此前它不折行，会把 Snippet 连同父级一起撑出视口。

<!-- changelog-en:start -->
fix(snippet): the width no longer overflows its parent. A long string with no spaces (a URL or a token) wraps anywhere it does not fit (`overflow-wrap: anywhere`); a command with spaces still breaks on words. It used to refuse to wrap and pushed the Snippet and its parent out of the viewport.
<!-- changelog-en:end -->
