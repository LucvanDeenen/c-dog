<template>
  <div
    class="p-4 border border-neutral-700/50 rounded-lg bg-neutral-800/40 cursor-pointer transition-colors duration-[160ms] hover:border-yellow-500/60 hover:bg-neutral-700/50"
    @click="emit('open', project.path)"
  >
    <div class="flex items-center gap-2">
      <svg width="18" height="18" viewBox="0 0 24 24" class="text-yellow-500 shrink-0" aria-hidden="true">
        <path :d="mdiFileCode" fill="currentColor" />
      </svg>
      <div class="min-w-0">
        <p class="m-0 text-white text-sm font-semibold">{{ project.name }}</p>
        <div class="flex items-center gap-2 mt-[0.1rem] min-w-0">
          <button
            class="inline-flex items-center gap-[0.3rem] bg-transparent border-none p-0 cursor-pointer text-gray-500 min-w-0 overflow-hidden transition-colors duration-150 hover:text-gray-300"
            title="Open folder"
            @click.stop="openFolder"
          >
            <svg width="20" height="14" viewBox="0 0 24 24" class="shrink-0">
              <path :d="mdiFolder" fill="currentColor" />
            </svg>
            <span class="text-[0.8rem] overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{{ relativePath }}</span>
          </button>
          <span v-if="project.branch" class="inline-flex items-center gap-[0.3rem] text-[0.8rem] text-gray-500 whitespace-nowrap shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" class="shrink-0" aria-hidden="true">
              <path :d="mdiSourceBranch" fill="currentColor" />
            </svg>
            {{ project.branch }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { mdiFileCode, mdiSourceBranch, mdiFolder } from "@mdi/js";

const props = defineProps<{
  project: { name: string; path: string; branch?: string; group: string };
}>();

const emit = defineEmits<{
  open: [path: string];
}>();

const relativePath = computed(() => {
  const p = props.project.path.replace(/\\/g, "/");
  const home = (p.match(/^[A-Za-z]:\/Users\/[^/]+/) ?? p.match(/^\/home\/[^/]+/))?.[0] ?? "";
  if (home && p.startsWith(home)) {
    return "~" + p.slice(home.length);
  }
  return p;
});

async function openFolder() {
  await (window.api.fs as any).openFolder(props.project.path);
}
</script>
