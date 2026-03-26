<template>
  <div
    class="p-4 border border-neutral-700/50 rounded-lg bg-neutral-800/40 cursor-pointer transition-colors duration-[160ms] hover:border-yellow-500/60 hover:bg-neutral-700/50"
    @click="emit('open', project.path)"
  >
    <div class="flex items-center gap-2">
      <div class="min-w-0 w-full">
        <div class="flex justify-between items">
          <IconLabel :icon="mdiFileCode" icon-class="text-yellow-500">
            <p class="m-0 text-white text-sm font-semibold">
              {{ project.name }}
            </p>
          </IconLabel>
          <IconLabel
            v-if="project.branch"
            :icon="mdiSourceBranch"
            class="text-[0.8rem] text-gray-500 whitespace-nowrap shrink-0"
          >
            {{ project.branch }}
          </IconLabel>
        </div>
        <div class="flex items-center gap-2 mt-[0.1rem] min-w-0">
          <IconLabel
            :icon="mdiFolder"
            :clickable="true"
            :tooltip="relativePath"
            class="text-[0.8rem] font-bold text-gray-500 min-w-0 overflow-hidden transition-colors duration-150 hover:text-gray-300"
            title="Open folder"
            @click.stop="openFolder"
          >
            {{ relativePath }}
          </IconLabel>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { mdiFileCode, mdiSourceBranch, mdiFolder } from "@mdi/js";
import IconLabel from "@/components/common/IconLabel.vue";

const props = defineProps<{
  project: { name: string; path: string; branch?: string; group: string };
}>();

const emit = defineEmits<{
  open: [path: string];
}>();

const relativePath = computed(() => {
  const p = props.project.path.replace(/\\/g, "/");
  const home =
    (p.match(/^[A-Za-z]:\/Users\/[^/]+/) ?? p.match(/^\/home\/[^/]+/))?.[0] ??
    "";
  if (home && p.startsWith(home)) {
    return "~" + p.slice(home.length);
  }
  return p;
});

async function openFolder() {
  await (window.api.fs as any).openFolder(props.project.path);
}
</script>
