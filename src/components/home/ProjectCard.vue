<template>
  <div
    class="p-4 border border-neutral-700/50 rounded-lg bg-neutral-800/40 cursor-pointer transition-colors duration-[160ms] hover:border-yellow-500/60 hover:bg-neutral-700/50"
    @click="emit('open', project.path, editorHint)"
  >
    <div class="min-w-0 w-full">
      <div class="flex justify-between items-center gap-2">
        <!-- Editor icon (picker trigger) + project name -->
        <div class="flex items-center gap-[0.3rem] min-w-0" @click.stop>
          <div class="relative shrink-0">
            <button
              type="button"
              :title="badgeTitle"
              :class="[
                'h-5 w-5 inline-flex items-center justify-center rounded border transition-colors duration-150 cursor-pointer',
                editorExplicit
                  ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                  : editorHint
                    ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-500/60 hover:bg-yellow-500/10 hover:text-yellow-400'
                    : 'border-dashed border-neutral-600/50 text-neutral-600 hover:border-yellow-500/30 hover:text-yellow-500/50',
              ]"
              @click="openPicker"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path :d="currentIcon" fill="currentColor" />
              </svg>
            </button>

            <EditorPicker
              v-if="showPicker"
              :editors="availableEditors"
              :selected-id="editorHint"
              :explicit="editorExplicit"
              :loading="loadingEditors"
              @select="setEditor"
              @clear="clearEditor"
            />
          </div>

          <p class="m-0 text-white text-sm font-semibold truncate" @click.stop="emit('open', project.path, editorHint)">
            {{ project.name }}
          </p>
        </div>

        <!-- Branch -->
        <IconLabel
          v-if="project.branch"
          :icon="mdiSourceBranch"
          :clickable="true"
          title="Open repository"
          class="text-[0.8rem] text-gray-500 whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-gray-300"
          @click.stop="openRepository"
        >
          {{ project.branch }}
        </IconLabel>
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

  <!-- Click-outside overlay -->
  <div v-if="showPicker" class="fixed inset-0 z-40" @click="showPicker = false" />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { mdiSourceBranch, mdiFolder } from "@mdi/js";
import IconLabel from "@/components/common/IconLabel.vue";
import EditorPicker from "@/components/common/EditorPicker.vue";
import { type EditorInfo, editorIcon } from "@/util/editors";

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
  const parts = p.split("/");
  return parts.length >= 2 ? parts[parts.length - 2] : p;
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
  await (window.api.settings as any).setProjectEditor(props.project.path, id);
  editorHint.value = id;
  editorExplicit.value = true;
  showPicker.value = false;
}

async function clearEditor() {
  await (window.api.settings as any).setProjectEditor(props.project.path, null);
  editorExplicit.value = false;
  showPicker.value = false;
}

async function openFolder() {
  await (window.api.fs as any).openFolder(props.project.path);
}

async function openRepository() {
  await (window.api.fs as any).openRepository(props.project.path);
}
</script>
