<template>
  <div
    class="p-4 border border-neutral-700/50 rounded-lg bg-neutral-800/40 cursor-pointer transition-colors duration-[160ms] hover:border-yellow-500/60 hover:bg-neutral-700/50"
    @click="emit('open', project.path, editorHint)"
  >
    <div class="flex items-center gap-2">
      <div class="min-w-0 w-full">
        <div class="flex justify-between items">
          <IconLabel :icon="mdiFileCode" icon-class="text-yellow-500">
            <p class="m-0 text-white text-sm font-semibold">
              {{ project.name }}
            </p>
          </IconLabel>
          <div class="flex items-center gap-2 shrink-0">
            <!-- Editor icon badge / picker trigger -->
            <div class="relative" @click.stop>
              <button
                type="button"
                :title="badgeTitle"
                :class="[
                  'h-6 w-6 inline-flex items-center justify-center rounded border transition-colors duration-150 cursor-pointer',
                  editorExplicit
                    ? 'border-teal-500/50 bg-teal-900/40 text-teal-300 hover:bg-teal-900/60'
                    : editorHint
                      ? 'border-transparent bg-neutral-700/40 text-gray-500 hover:bg-neutral-700/70 hover:text-gray-300'
                      : 'border-dashed border-neutral-700/60 text-neutral-600 hover:border-neutral-500 hover:text-gray-400',
                ]"
                @click="openPicker"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="currentIcon" fill="currentColor" />
                </svg>
              </button>

              <!-- Dropdown -->
              <div
                v-if="showPicker"
                class="absolute right-0 top-full mt-1 z-50 min-w-[11rem] bg-neutral-900 border border-neutral-700/60 rounded-lg shadow-xl overflow-hidden"
              >
                <div v-if="loadingEditors" class="px-3 py-2 text-[0.8rem] text-gray-500">
                  Loading…
                </div>
                <template v-else>
                  <button
                    v-for="editor in availableEditors"
                    :key="editor.id"
                    type="button"
                    :class="[
                      'w-full flex items-center gap-2.5 px-3 py-2 text-left text-[0.82rem] transition-colors duration-100 cursor-pointer',
                      editorHint === editor.id && editorExplicit
                        ? 'bg-teal-900/40 text-teal-300'
                        : 'text-gray-300 hover:bg-neutral-700/60',
                    ]"
                    @click="setEditor(editor.id)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" class="shrink-0">
                      <path :d="editorIcon(editor.id)" fill="currentColor" />
                    </svg>
                    {{ editor.name }}
                    <svg v-if="editorHint === editor.id && editorExplicit" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" class="ml-auto shrink-0">
                      <path :d="mdiCheck" fill="currentColor" />
                    </svg>
                  </button>
                  <div v-if="editorExplicit" class="border-t border-neutral-700/50">
                    <button
                      type="button"
                      class="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[0.82rem] text-gray-500 hover:bg-neutral-700/60 hover:text-gray-300 transition-colors duration-100 cursor-pointer"
                      @click="clearEditor"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" class="shrink-0">
                        <path :d="mdiClose" fill="currentColor" />
                      </svg>
                      Reset to auto-detect
                    </button>
                  </div>
                </template>
              </div>
            </div>

            <IconLabel
              v-if="project.branch"
              :icon="mdiSourceBranch"
              class="text-[0.8rem] text-gray-500 whitespace-nowrap"
            >
              {{ project.branch }}
            </IconLabel>
          </div>
        </div>
        <div class="flex items-center gap-2 mt-[0.1rem] min-w-0">
          <IconLabel
            :icon="mdiFolder"
            :clickable="true"
            :tooltip="relativePath"
            class="text-[0.8rem] font-bold text-gray-500 min-w-0 overflow-hidden transition-colors duration-150 hover:text-gray-300"
            title="Open folder"
            @click.stop="openFolder"
          >
            {{ relativePath }}
          </IconLabel>
        </div>
      </div>
    </div>
  </div>

  <!-- Click-outside overlay -->
  <div v-if="showPicker" class="fixed inset-0 z-40" @click="showPicker = false" />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  mdiFileCode, mdiSourceBranch, mdiFolder, mdiCheck, mdiClose, mdiCodeBraces,
  mdiMicrosoftVisualStudioCode, mdiCursorDefault, mdiLanguageJavascript,
  mdiLanguageCsharp, mdiLanguageJava, mdiLanguageGo, mdiLanguagePython,
  mdiNoteText, mdiBolt,
} from "@mdi/js";
import IconLabel from "@/components/common/IconLabel.vue";

interface EditorInfo { id: string; name: string }

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
  project: { name: string; path: string; branch?: string; group: string; editorHint?: string; editorExplicit?: boolean };
}>();

const emit = defineEmits<{
  open: [path: string, editorHint?: string];
}>();

const editorHint = ref(props.project.editorHint);
const editorExplicit = ref(props.project.editorExplicit ?? false);
const showPicker = ref(false);
const availableEditors = ref<EditorInfo[]>([]);
const loadingEditors = ref(false);

const relativePath = computed(() => {
  const p = props.project.path.replace(/\\/g, "/");
  const home = (p.match(/^[A-Za-z]:\/Users\/[^/]+/) ?? p.match(/^\/home\/[^/]+/))?.[0] ?? "";
  return home && p.startsWith(home) ? "~" + p.slice(home.length) : p;
});

const currentIcon = computed(() => editorIcon(editorHint.value ?? ""));

const badgeTitle = computed(() => {
  if (editorExplicit.value) return "Set by .shelf — click to change";
  if (editorHint.value) return "Auto-detected — click to override";
  return "Set editor for this project";
});

async function openPicker() {
  showPicker.value = true;
  if (availableEditors.value.length === 0) {
    loadingEditors.value = true;
    try {
      availableEditors.value = await window.api.fs.getInstalledEditors();
    } finally {
      loadingEditors.value = false;
    }
  }
}

async function setEditor(id: string) {
  await window.api.fs.setProjectEditor(props.project.path, id);
  editorHint.value = id;
  editorExplicit.value = true;
  showPicker.value = false;
}

async function clearEditor() {
  await window.api.fs.setProjectEditor(props.project.path, null);
  editorExplicit.value = false;
  showPicker.value = false;
}

async function openFolder() {
  await (window.api.fs as any).openFolder(props.project.path);
}
</script>
