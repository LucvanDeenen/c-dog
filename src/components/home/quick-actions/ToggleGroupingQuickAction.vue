<template>
  <button
    type="button"
    :title="grouped ? 'Disable grouping' : 'Group by section'"
    :class="[
      'h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-colors duration-150 cursor-pointer',
      grouped
        ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
        : 'border-transparent text-gray-500 hover:bg-neutral-700/50 hover:text-gray-300',
    ]"
    @click="emit('toggle')"
  >
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path :d="grouped ? mdiGroup : mdiUngroup" fill="currentColor" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { mdiGroup, mdiUngroup } from "@mdi/js";

defineProps<{
  grouped: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();
</script>
