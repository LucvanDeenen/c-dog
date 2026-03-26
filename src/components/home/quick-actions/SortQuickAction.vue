<template>
  <button
    type="button"
    :title="sortByRecent ? 'Sorting by recently opened — click for alphabetical' : 'Sort by recently opened'"
    :class="[
      'h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-colors duration-150 cursor-pointer',
      sortByRecent
        ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
        : 'border-transparent text-gray-500 hover:bg-neutral-700/50 hover:text-gray-300',
    ]"
    @click="emit('toggle')"
  >
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path :d="mdiClockOutline" fill="currentColor" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { mdiClockOutline } from "@mdi/js";

defineProps<{
  sortByRecent: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();
</script>
