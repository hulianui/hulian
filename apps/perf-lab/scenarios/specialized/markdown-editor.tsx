import { useState } from "react";

import { MarkdownEditor } from "@hulianui/ui/markdown-editor";
import { definePerformanceScenario } from "@hulianui/hulian-scan/browser";

import { invoke, nextPaint, rootFor, wait, type ScenarioController } from "./shared";

export const markdownEditorParameters = { characters: 20_000, insertionCharacters: 20 } as const;
const id = "markdown-editor/stress";
const controller: ScenarioController = {};
const initialMarkdown = Array.from(
  { length: 400 },
  (_, index) => `## 性能段落 ${index}\n\n${"瑚琏编辑器性能内容".repeat(5)}\n\n`,
)
  .join("")
  .slice(0, markdownEditorParameters.characters);

function editorElement(): HTMLElement {
  const editor = rootFor(id).querySelector<HTMLElement>('[contenteditable="true"]');
  if (!editor) throw new Error("markdown editor contenteditable is missing");
  return editor;
}

function Fixture() {
  const [visible, setVisible] = useState(true);
  controller["insert"] = () => {
    const editor = editorElement();
    editor.focus();
    document.execCommand("insertText", false, "性能插入文本1234567890");
  };
  controller["format"] = () => {
    const button = rootFor(id).querySelector<HTMLButtonElement>('button[aria-label="加粗"]');
    if (!button) throw new Error("markdown bold control is missing");
    button.click();
  };
  controller["undo"] = () => {
    editorElement().dispatchEvent(
      new KeyboardEvent("keydown", { key: "z", metaKey: true, ctrlKey: true, bubbles: true }),
    );
  };
  controller["destroy"] = async () => {
    setVisible(false);
    await wait(500);
    if (rootFor(id).querySelector('[contenteditable="true"]')) {
      throw new Error("markdown editor survived destroy");
    }
  };
  return (
    <div data-hulian-scan-scenario={id}>
      {visible ? <MarkdownEditor defaultValue={initialMarkdown} minRows={12} /> : null}
    </div>
  );
}

async function action(name: string): Promise<void> {
  await invoke(controller, name);
  await nextPaint();
}

export const markdownEditorScenario = definePerformanceScenario({
  id,
  component: "MarkdownEditor",
  entry: "@hulianui/ui/markdown-editor",
  category: "heavy",
  render: () => <Fixture />,
  steps: [
    {
      id: "insert-20-characters",
      kind: "interaction",
      label: "Insert 20 characters",
      run: () => action("insert"),
    },
    {
      id: "toggle-formatting",
      kind: "interaction",
      label: "Toggle bold formatting",
      run: () => action("format"),
    },
    {
      id: "undo",
      kind: "interaction",
      label: "Undo the editor transaction",
      run: () => action("undo"),
    },
    { id: "destroy", kind: "unmount", run: () => action("destroy") },
  ],
  budgets: {},
});
