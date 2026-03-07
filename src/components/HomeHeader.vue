<template>
  <div class="bg-slate-800 border-slate-700 flex items-center gap-3 flex-shrink-0 min-h-[75px]">
    <div class="flex-1 flex items-center bg-slate-900 rounded">
      <svg class="w-4 h-4 text-slate-400 mr-2 icon-sm" viewBox="0 0 24 24">
        <path :d="mdiMagnify" fill="currentColor" />
      </svg>
      <input
        :value="searchQuery"
        @input="(e: Event) => emit('update:searchQuery', (e.target && (e.target as HTMLInputElement).value) || '')"
        type="text"
        placeholder="Search projects..."
        class="bg-transparent text-sm text-slate-200 outline-none flex-1 placeholder-slate-500"
      />
    </div>
    <IconButton
      :icon="windowMode === 'regular' ? mdiWindowMinimize : mdiWindowMaximize"
      :title="`Switch to ${windowMode === 'regular' ? 'Docked' : 'Regular'} Mode`"
      iconClass="w-5 h-5"
      @click="toggleWindowMode"
    />
  </div>
</template>

<script setup lang="ts">
import { mdiWindowMinimize, mdiWindowMaximize, mdiMagnify } from "@mdi/js";
import IconButton from "@/components/common/IconButton.vue";

const emit = defineEmits(["update:searchQuery", "toggleWindowMode"]);

defineProps<{
  windowMode: string;
  searchQuery: string;
}>();

function toggleWindowMode() {
  emit("toggleWindowMode");
}
</script>
