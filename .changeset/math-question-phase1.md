---
"@hulianui/ui": minor
---

`@hulianui/ui/math` 新增题目域的类型与纯函数：`Question` / `QuestionType`（七型枚举 `single / multiple / judge / blank / short_answer / calculation / essay`）/ `QuestionAnswer`，以及 `validateQuestion`、`defaultShape`、`normalizeOptions`、`blankCount`、`splitStemFigures`、`toWireAnswer` / `fromWire`、`answerText`、`gradeObjective`（客观题判分，默认档与消费方服务端逐字同口径，归一与容差 opt-in）。判分与切图各带一份跨语言契约 fixture（`grade.contract.json` / `stem-figures.contract.json`），供 Python 侧对账。

`QuestionCard`：`kind`（四型）弃用，改用 `type`（七型）；旧值仍映射一个 minor 并在开发期告警。新增 `answer` / `analysis` / `showAnswer`（默认关）展示答案与解析；`options` 改为 `{ key, text }`，旧 `{ label, text }` 仍接受一个 minor。题型标签与答案区文案接入 Locale（新增 `question` 词条）。

<!-- changelog-en:start -->
`@hulianui/ui/math` gains the question domain types and pure functions: `Question` / `QuestionType` (a closed enum of `single / multiple / judge / blank / short_answer / calculation / essay`) / `QuestionAnswer`, plus `validateQuestion`, `defaultShape`, `normalizeOptions`, `blankCount`, `splitStemFigures`, `toWireAnswer` / `fromWire`, `answerText`, and `gradeObjective` (objective grading whose default tier matches the consumer's server logic word for word; normalisation and numeric tolerance are opt-in). Grading and figure extraction each ship a cross-language contract fixture (`grade.contract.json` / `stem-figures.contract.json`) for the Python side to verify against.

`QuestionCard`: `kind` (four values) is deprecated in favour of `type` (seven values); old values still map for one minor and warn in development. New `answer` / `analysis` / `showAnswer` (off by default) render the key and explanation; `options` becomes `{ key, text }`, with the legacy `{ label, text }` shape accepted for one more minor. Type tag and answer copy now come from the locale (new `question` entries).
<!-- changelog-en:end -->
