---
"@hulianui/ui": patch
---

fix(snippet): 宽度不再超出父容器。不带空格的长串（URL、token）装不下时在任意位置折行（`overflow-wrap: anywhere`），带空格的命令仍按词换行；此前它不折行，会把 Snippet 连同父级一起撑出视口。
