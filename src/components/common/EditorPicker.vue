<template>
  <div
    class="absolute left-0 top-full mt-1 z-50 min-w-[11rem] bg-neutral-900 border border-neutral-700/60 rounded-lg shadow-xl overflow-hidden"
  >
    <div v-if="loading" class="px-3 py-2 text-[0.8rem] text-gray-500">
      Loading…
    </div>
    <template v-else>
      <button
        v-for="editor in editors"
        :key="editor.id"
        type="button"
        :class="[
          'w-full flex items-center gap-2.5 px-3 py-2 text-left text-[0.82rem] transition-colors duration-100 cursor-pointer',
          selectedId === editor.id && explicit
            ? 'bg-yellow-500/10 text-yellow-400'
            : 'text-gray-300 hover:bg-neutral-700/60',
        ]"
        @click="emit('select', editor.id)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" class="shrink-0">
          <path :d="editorIcon(editor.id)" fill="currentColor" />
        </svg>
        {{ editor.name }}
        <svg v-if="selectedId === editor.id && explicit" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" class="ml-auto shrink-0">
          <path :d="mdiCheck" fill="currentColor" />
        </svg>
      </button>
      <div v-if="explicit" class="border-t border-neutral-700/50">
        <button
          type="button"
          class="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[0.82rem] text-gray-500 hover:bg-neutral-700/60 hover:text-gray-300 transition-colors duration-100 cursor-pointer"
          @click="emit('clear')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" class="shrink-0">
            <path :d="mdiClose" fill="currentColor" />
          </svg>
          Reset to auto-detect
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { mdiCheck, mdiClose } from "@mdi/js";
import { type EditorInfo, editorIcon } from "@/util/editors";

defineProps<{
  editors: EditorInfo[];
  selectedId?: string;
  explicit?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  select: [id: string];
  clear: [];
}>();
</script>
