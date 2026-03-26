<template>
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
</template>

<script setup lang="ts">
import { mdiConsoleLine } from "@mdi/js";

async function openTerminal() {
  await window.api.fs.openTerminal();
}
</script>
