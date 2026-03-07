<template>
  <div class="bg-slate-800 border-slate-700 flex-shrink-0 px-3 py-2">
    <div class="flex items-center gap-3 min-h-[46px]">
      <div class="flex-1 flex items-center bg-slate-900 rounded px-2">
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
        :icon="mdiClose"
        title="Close to system tray"
        iconClass="w-5 h-5"
        @click="closeToTray"
      />
    </div>

    <div class="mt-2 bg-slate-900 rounded px-2 py-1 flex items-center gap-2">
      <span class="text-xs uppercase tracking-wide text-slate-400">Actions</span>
      <IconButton
        :icon="windowMode === 'regular' ? mdiWindowMinimize : mdiWindowMaximize"
        :title="`Switch to ${windowMode === 'regular' ? 'Docked' : 'Regular'} Mode`"
        iconClass="w-5 h-5"
        customClass="!h-8"
        @click="toggleWindowMode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiWindowMinimize, mdiWindowMaximize, mdiMagnify, mdiClose } from "@mdi/js";
import IconButton from "@/components/common/IconButton.vue";

const emit = defineEmits(["update:searchQuery", "toggleWindowMode", "closeToTray"]);

defineProps<{
  windowMode: string;
  searchQuery: string;
}>();

function toggleWindowMode() {
  emit("toggleWindowMode");
}

function closeToTray() {
  emit("closeToTray");
}
</script>
