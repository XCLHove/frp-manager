<script setup lang="ts">
import * as monaco from "monaco-editor";
import { type IKeyboardEvent, KeyCode } from "monaco-editor";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { onMounted, onUnmounted, shallowRef, watch } from "vue";
import type { MonacoJsonEditorEmits, MonacoJsonEditorProps } from "./types";

const props = withDefaults(defineProps<MonacoJsonEditorProps>(), {});
const emits = defineEmits<MonacoJsonEditorEmits>();

self.MonacoEnvironment = {
  getWorker: function (workerId, label) {
    if (label === "json") return new jsonWorker();
    return new editorWorker();
  }
};

monaco.languages.registerDocumentFormattingEditProvider("json", {
  provideDocumentFormattingEdits(model, options, token) {
    try {
      const text = model.getValue();
      const json = JSON.parse(text);
      const formattedText = JSON.stringify(json, null, 4);
      return [
        {
          range: model.getFullModelRange(),
          text: formattedText
        }
      ];
    } catch (error) {
      return [];
    }
  }
});

type KeyDownEventHandler = {
  preventDefault?: boolean;
  needHandle: (e: IKeyboardEvent) => boolean;
  handle: (e: IKeyboardEvent) => void;
};
const keyDownEventHandlers: KeyDownEventHandler[] = [];

// ctrl + alt + l
keyDownEventHandlers.push({
  preventDefault: true,
  needHandle: (e) => {
    return e.ctrlKey && e.altKey && e.keyCode === KeyCode.KeyL;
  },
  handle: () => {
    const selections = editorInstance.getSelections() || [];
    if (selections.length === 0) {
      editorInstance.getAction("editor.action.formatDocument")?.run();
    } else {
      editorInstance.getAction("editor.action.formatSelection")?.run();
    }
  }
});

// ctrl + s
keyDownEventHandlers.push({
  preventDefault: true,
  needHandle: (e) => {
    return e.ctrlKey && e.keyCode === KeyCode.KeyS;
  },
  handle: () => emits("save", modelValue.value)
});

// ctrl + f
keyDownEventHandlers.push({
  preventDefault: true,
  needHandle: (e) => {
    return e.ctrlKey && e.keyCode === KeyCode.KeyF;
  },
  handle: () => {
    editorInstance?.getAction("editor.action.find")?.run();
  }
});

// ctrl + r
keyDownEventHandlers.push({
  preventDefault: true,
  needHandle: (e) => {
    return e.ctrlKey && e.keyCode === KeyCode.KeyR;
  },
  handle: () => {
    editorInstance?.getAction("editor.action.startFindReplaceAction")?.run();
  }
});

const editorRef = shallowRef<HTMLDivElement>();
let editorInstance: ReturnType<typeof monaco.editor.create>;
const modelValue = defineModel("modelValue", {
  default: ""
});

onMounted(() => {
  createEditor();
});

function createEditor() {
  editorInstance = monaco.editor.create(editorRef.value!, {
    value: "",
    language: "json",
    minimap: { enabled: false },
    automaticLayout: true,
    wordWrap: "on"
  });

  editorInstance.onKeyDown((e) => {
    keyDownEventHandlers.forEach((handler) => {
      if (!handler.needHandle(e)) return;
      if (handler.preventDefault) e.preventDefault();
      handler.handle(e);
    });
  });

  editorInstance.onDidChangeModelContent(() => {
    modelValue.value = editorInstance.getValue();
  });

  watch(
    () => modelValue.value,
    (newValue) => {
      const oldValue = editorInstance.getValue();
      if (oldValue !== newValue) editorInstance.setValue(newValue);
    },
    {
      immediate: true
    }
  );

  onUnmounted(() => {
    editorInstance.dispose();
  });
}
</script>

<template>
  <div ref="editorRef"></div>
</template>

<style scoped lang="scss">
.monaco-json-editor {
  width: 100%;
  height: 100%;
}
</style>
