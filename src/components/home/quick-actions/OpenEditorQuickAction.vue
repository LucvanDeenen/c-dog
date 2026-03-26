<template>
  <button
    type="button"
    title="Open editor"
    class="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-transparent text-gray-500 transition-colors duration-150 cursor-pointer hover:bg-neutral-700/50 hover:text-gray-300"
    @click="openEditor"
  >
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path :d="mdiOpenInNew" fill="currentColor" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { mdiOpenInNew } from "@mdi/js";

const props = defineProps<{
  preferredEditor: string;
}>();

async function openEditor() {
  await window.api.fs.openEditor(props.preferredEditor);
}
</script>
