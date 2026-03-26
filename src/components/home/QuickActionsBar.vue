<template>
  <div
    v-if="editors.length > 0"
    class="flex-shrink-0 flex items-center gap-1 px-3 py-2 border-b border-neutral-700/50 bg-neutral-900/40"
  >
    <button
      v-for="editor in editors"
      :key="editor.id"
      type="button"
      :title="isDefault(editor.id) ? `Open ${editor.name}` : `Switch to ${editor.name}`"
      :class="[
        'relative h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-colors duration-150 cursor-pointer',
        isDefault(editor.id)
          ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
          : 'border-transparent text-gray-500 hover:bg-neutral-700/50 hover:text-gray-300',
      ]"
      @click="handleEditorClick(editor.id)"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
        <path :d="editorIcon(editor.id)" fill="currentColor" />
      </svg>
    </button>

    <div class="w-px h-5 bg-neutral-700/60 mx-1" />

    <button
      type="button"
      title="Open terminal"
      class="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-transparent text-gray-500 transition-colors duration-150 cursor-pointer hover:bg-neutral-700/50 hover:text-gray-300"
      @click="openTerminal"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
        <path :d="mdiConsoleLine" fill="currentColor" />
      </svg>
    </button>

    <div class="flex-1" />

    <div class="w-px h-5 bg-neutral-700/60 mx-1" />

    <button
      type="button"
      title="Refresh projects"
      :class="[
        'h-8 w-8 inline-flex items-center justify-center rounded-lg border border-transparent text-gray-500 transition-colors duration-150 cursor-pointer hover:bg-neutral-700/50 hover:text-gray-300',
        loading && 'animate-spin pointer-events-none',
      ]"
      @click="emit('refresh')"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
        <path :d="mdiRefresh" fill="currentColor" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  mdiMicrosoftVisualStudioCode,
  mdiCursorDefault,
  mdiLanguageJavascript,
  mdiLanguageCsharp,
  mdiLanguageJava,
  mdiLanguageGo,
  mdiLanguagePython,
  mdiNoteText,
  mdiBolt,
  mdiCodeBraces,
  mdiConsoleLine,
  mdiRefresh,
} from "@mdi/js";

interface EditorInfo {
  id: string;
  name: string;
}

const EDITOR_ICONS: Record<string, string> = {
  vscode:   mdiMicrosoftVisualStudioCode,
  cursor:   mdiCursorDefault,
  webstorm: mdiLanguageJavascript,
  rider:    mdiLanguageCsharp,
  idea:     mdiLanguageJava,
  goland:   mdiLanguageGo,
  pycharm:  mdiLanguagePython,
  sublime:  mdiNoteText,
  zed:      mdiBolt,
};

function editorIcon(id: string): string {
  return EDITOR_ICONS[id] ?? mdiCodeBraces;
}

const props = defineProps<{
  preferredEditor: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  editorChanged: [id: string];
  refresh: [];
}>();

const editors = ref<EditorInfo[]>([]);

onMounted(async () => {
  try {
    editors.value = await window.api.fs.getInstalledEditors();
  } catch (error) {
    console.error("Failed to load editors:", error);
  }
});

function isDefault(id: string) {
  return id === props.preferredEditor;
}

async function handleEditorClick(id: string) {
  if (isDefault(id)) {
    await window.api.fs.openEditor(id);
  } else {
    await window.api.settings.setPreferredEditor(id);
    emit("editorChanged", id);
  }
}

async function openTerminal() {
  await window.api.fs.openTerminal();
}
</script>
