<template>
  <div>
    <h3 class="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.05em] mt-0 mb-4">Repositories</h3>
    <div class="flex flex-col gap-2 mb-3">
      <div
        v-for="(repoPath, index) in repoPaths"
        :key="index"
        class="flex items-center gap-2 bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2"
      >
        <span class="flex-1 text-[0.875rem] text-white truncate">{{ repoPath }}</span>
        <button
          @click="removePath(index)"
          class="text-gray-500 hover:text-red-400 transition-colors text-[0.8rem] shrink-0"
        >
          ✕
        </button>
      </div>
    </div>

    <button
      @click="browsePath"
      class="w-full px-3 py-2 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 border-dashed text-gray-400 hover:text-white text-[0.875rem] rounded-md transition-colors"
    >
      + Add directory
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  initialValue: string[];
}>();

const emit = defineEmits<{
  pathsChanged: [];
}>();

const repoPaths = ref<string[]>([...props.initialValue]);

const save = async () => {
  try {
    await window.api.settings.setRepoPaths([...repoPaths.value]);
    emit("pathsChanged");
  } catch (error) {
    console.error("Failed to update repo paths:", error);
  }
};

const browsePath = async () => {
  const picked = await window.api.fs.pickDirectory();
  if (!picked) return;
  repoPaths.value.push(picked);
  await save();
};

const removePath = async (index: number) => {
  repoPaths.value.splice(index, 1);
  await save();
};
</script>
