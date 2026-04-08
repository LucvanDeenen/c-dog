<template>
  <header
    :class="[
      'flex-shrink-0 px-3 py-3.5 border border-neutral-700/50 justify-around',
      windowMode === 'regular' && 'drag-region',
    ]"
  >
    <div class="flex items-center gap-1 justify-between">
      <IconButton
        :icon="mdiCog"
        title="Settings"
        customClass="h-9 w-9 rounded-lg text-gray-400 transition-colors hover:bg-neutral-700/50 hover:text-white"
        @click="emit('openSettings')"
      />

      <div class="flex-1 flex items-center max-w-[400px]">
        <label
          class="w-full min-h-7 flex items-center gap-2 py-1 pr-2 pl-3 rounded-xl border border-neutral-700/50 bg-neutral-900/80 overflow-hidden focus-within:border-yellow-500/90 focus-within:ring-2 focus-within:ring-yellow-500/20"
          for="project-search"
        >
          <svg
            width="16"
            height="16"
            class="shrink-0 text-gray-400"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path :d="mdiMagnify" fill="currentColor" />
          </svg>
          <input
            id="project-search"
            :value="searchQuery"
            @input="
              (e: Event) =>
                emit(
                  'update:searchQuery',
                  (e.target && (e.target as HTMLInputElement).value) || '',
                )
            "
            type="text"
            placeholder="Search projects..."
            class="flex-1 min-w-0 border-0 outline-none bg-transparent text-white text-[0.9rem] leading-[1.3] placeholder:text-gray-500"
          />
          <button
            v-if="searchQuery"
            @click="emit('update:searchQuery', '')"
            class="shrink-0 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path :d="mdiClose" fill="currentColor" />
            </svg>
          </button>
        </label>
      </div>

      <div class="flex items-center gap-0.5">
        <IconButton
          :icon="
            windowMode === 'regular' ? mdiArrowBottomRight : mdiArrowTopLeft
          "
          :title="`Switch to ${windowMode === 'regular' ? 'Docked' : 'Regular'} Mode`"
          customClass="h-9 w-9 rounded-lg text-gray-400 transition-colors hover:bg-neutral-700/50 hover:text-white"
          @click="emit('toggleWindowMode')"
        />
        <IconButton
          :icon="mdiClose"
          title="Close to tray"
          customClass="h-9 w-9 top-3 right-3 rounded-lg text-slate-400 transition-colors hover:bg-red-500/15 hover:text-red-400"
          @click="emit('closeToTray')"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  mdiArrowBottomRight,
  mdiMagnify,
  mdiClose,
  mdiCog,
  mdiArrowTopLeft,
} from "@mdi/js";
import IconButton from "@/components/common/IconButton.vue";

const emit = defineEmits([
  "update:searchQuery",
  "toggleWindowMode",
  "closeToTray",
  "openSettings",
]);

defineProps<{
  windowMode: string;
  searchQuery: string;
}>();
</script>
