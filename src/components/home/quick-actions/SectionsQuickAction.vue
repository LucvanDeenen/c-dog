<template>
  <div class="relative">
    <button
      type="button"
      title="Toggle sections"
      :class="[
        'h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-colors duration-150 cursor-pointer',
        hiddenGroups.size > 0
          ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
          : 'border-transparent text-gray-500 hover:bg-neutral-700/50 hover:text-gray-300',
      ]"
      @click="showDropdown = !showDropdown"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
        <path :d="mdiLayers" fill="currentColor" />
      </svg>
    </button>

    <div
      v-if="showDropdown"
      class="absolute left-0 top-full mt-1 z-50 min-w-[11rem] bg-neutral-900 border border-neutral-700/60 rounded-lg shadow-xl overflow-hidden"
    >
      <button
        v-for="group in groups"
        :key="group"
        type="button"
        :class="[
          'w-full flex items-center gap-2.5 px-3 py-2 text-left text-[0.82rem] transition-colors duration-100 cursor-pointer',
          hiddenGroups.has(group) ? 'text-gray-600 hover:bg-neutral-700/60 hover:text-gray-400' : 'text-gray-300 hover:bg-neutral-700/60',
        ]"
        @click="toggleGroup(group)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" class="shrink-0">
          <path :d="hiddenGroups.has(group) ? mdiEyeOff : mdiEye" fill="currentColor" />
        </svg>
        {{ group }}
      </button>
    </div>
  </div>

  <div v-if="showDropdown" class="fixed inset-0 z-40" @click="showDropdown = false" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { mdiLayers, mdiEye, mdiEyeOff } from "@mdi/js";

defineProps<{
  groups?: string[];
}>();

const emit = defineEmits<{
  sectionsChanged: [hiddenGroups: string[]];
}>();

const showDropdown = ref(false);
const hiddenGroups = ref(new Set<string>());

function toggleGroup(group: string) {
  if (hiddenGroups.value.has(group)) {
    hiddenGroups.value.delete(group);
  } else {
    hiddenGroups.value.add(group);
  }
  hiddenGroups.value = new Set(hiddenGroups.value);
  emit("sectionsChanged", [...hiddenGroups.value]);
}
</script>
