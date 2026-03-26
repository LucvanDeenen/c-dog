<template>
  <div
    v-if="editors.length > 0"
    class="flex-shrink-0 flex items-center gap-1 px-3 py-2 border-b border-neutral-700/50 bg-neutral-900/40"
  >
    <!-- Default editor picker -->
    <div class="relative">
      <button
        type="button"
        title="Change default editor"
        class="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-yellow-500/60 bg-yellow-500/10 text-yellow-400 transition-colors duration-150 cursor-pointer hover:bg-yellow-500/20"
        @click="showPicker = !showPicker"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
          <path :d="editorIcon(props.preferredEditor)" fill="currentColor" />
        </svg>
      </button>

      <EditorPicker
        v-if="showPicker"
        :editors="editors"
        :selected-id="props.preferredEditor"
        :explicit="true"
        @select="selectDefault"
        @clear="showPicker = false"
      />
    </div>

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

    <button
      type="button"
      title="Open editor"
      class="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-transparent text-gray-500 transition-colors duration-150 cursor-pointer hover:bg-neutral-700/50 hover:text-gray-300"
      @click="openEditor"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
        <path :d="mdiCodeBraces" fill="currentColor" />
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

  <!-- Click-outside overlay -->
  <div
    v-if="showPicker"
    class="fixed inset-0 z-40"
    @click="showPicker = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { mdiConsoleLine, mdiRefresh, mdiCodeBraces } from "@mdi/js";
import EditorPicker from "@/components/common/EditorPicker.vue";
import { type EditorInfo, editorIcon } from "@/util/editors";

const props = defineProps<{
  preferredEditor: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  editorChanged: [id: string];
  refresh: [];
}>();

const editors = ref<EditorInfo[]>([]);
const showPicker = ref(false);

onMounted(async () => {
  try {
    editors.value = await window.api.fs.getInstalledEditors();
  } catch (error) {
    console.error("Failed to load editors:", error);
  }
});

async function selectDefault(id: string) {
  await window.api.settings.setPreferredEditor(id);
  emit("editorChanged", id);
  showPicker.value = false;
}

async function openEditor() {
  await window.api.fs.openEditor(props.preferredEditor);
}

async function openTerminal() {
  await window.api.fs.openTerminal();
}
</script>
